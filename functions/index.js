// Server-side Play Billing support for Pop-A-Boba.
//
// WHY THIS EXISTS: the client (www/index.html) can acknowledge/consume a purchase itself, but
// that trusts the device completely - a modified APK could set removeAdsPurchased=true without
// ever paying. These two functions are the actual trust boundary:
//   - verifyAndGrantPurchase: the client calls this right after purchaseProduct() resolves. It
//     asks Google directly (not the client) whether the purchase is real, acknowledges/consumes
//     it SERVER-SIDE (so that step can never be skipped or faked), and records it in Firestore so
//     the exact same purchaseToken can never be granted twice.
//   - playRtdn: Google Play pushes a Pub/Sub notification here the moment a purchase is refunded
//     or voided. This is the only way to find out about a refund after the fact - the client has
//     no way to know on its own - so it marks the Firestore record revoked.
//   - checkEntitlement: the client calls this occasionally (see checkRemoveAdsEntitlement() in
//     www/index.html) to ask "is the purchase I'm still showing as owned actually still valid?",
//     which is what makes playRtdn's revocation actually take effect client-side.
//
// Deploy with: firebase deploy --only functions (after `firebase use <project-id>` and setting
// the PLAY_SERVICE_ACCOUNT_KEY secret - see README.md in this directory).

const { onRequest } = require('firebase-functions/v2/https');
const { onMessagePublished } = require('firebase-functions/v2/pubsub');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

// Must match android/app/build.gradle's applicationId exactly - requests for any other package
// are rejected outright, so this endpoint can't be pointed at a different app's purchases.
const PACKAGE_NAME = 'com.cheffrey.popabobba';
const REMOVE_ADS_PRODUCT_ID = 'remove_ads';
// All consumable coin-pack product IDs - keep in sync with COIN_PACKS in www/index.html whenever
// a new denomination is added there.
const COIN_PACK_PRODUCT_IDS = new Set(['coins_100', 'coins_250']);
const KNOWN_PRODUCT_IDS = new Set([REMOVE_ADS_PRODUCT_ID, ...COIN_PACK_PRODUCT_IDS]);

// The downloaded Play Console service-account JSON key, stored as a Firebase secret so it never
// touches source control or chat: `firebase functions:secrets:set PLAY_SERVICE_ACCOUNT_KEY` and
// paste the file's contents when prompted (or `firebase functions:secrets:set PLAY_SERVICE_ACCOUNT_KEY < keyfile.json`).
const playServiceAccountKey = defineSecret('PLAY_SERVICE_ACCOUNT_KEY');

let cachedAndroidPublisher = null;
function androidPublisher() {
  if (cachedAndroidPublisher) return cachedAndroidPublisher;
  const credentials = JSON.parse(playServiceAccountKey.value());
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  cachedAndroidPublisher = google.androidpublisher({ version: 'v3', auth });
  return cachedAndroidPublisher;
}

function setCors(res) {
  // Public-by-design endpoint (no cookies/session auth - the purchase token itself, checked
  // against Google, is the authorization), called from a Capacitor WebView rather than a
  // browser tab with a fixed origin, so a wildcard is the pragmatic choice here.
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

exports.verifyAndGrantPurchase = onRequest(
  { secrets: [playServiceAccountKey], cors: true },
  async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

    const { packageName, productId, purchaseToken } = req.body || {};
    if (packageName !== PACKAGE_NAME) { res.status(400).json({ error: 'unknown packageName' }); return; }
    if (!KNOWN_PRODUCT_IDS.has(productId)) { res.status(400).json({ error: 'unknown productId' }); return; }
    if (!purchaseToken || typeof purchaseToken !== 'string') { res.status(400).json({ error: 'missing purchaseToken' }); return; }

    const docRef = db.collection('purchases').doc(purchaseToken);

    try {
      const existing = await docRef.get();
      if (existing.exists && existing.data().state === 'completed') {
        // Already verified and finished by an earlier call (e.g. the client retried after a
        // dropped response) - same outcome, no second acknowledge/consume against Google.
        res.json({ verified: true, alreadyProcessed: true, productId: existing.data().productId });
        return;
      }

      const publisher = androidPublisher();
      const { data: purchase } = await publisher.purchases.products.get({
        packageName: PACKAGE_NAME,
        productId,
        token: purchaseToken,
      });

      // purchaseState: 0 = purchased, 1 = cancelled, 2 = pending. Only 0 is real money received.
      if (purchase.purchaseState !== 0) {
        res.json({ verified: false, reason: purchase.purchaseState === 2 ? 'pending' : 'cancelled' });
        return;
      }

      const isConsumable = COIN_PACK_PRODUCT_IDS.has(productId);
      // consumptionState: 0 = yet to be consumed, 1 = consumed.
      if (isConsumable) {
        if (purchase.consumptionState !== 1) {
          await publisher.purchases.products.consume({ packageName: PACKAGE_NAME, productId, token: purchaseToken });
        }
      } else if (purchase.acknowledgementState !== 1) {
        await publisher.purchases.products.acknowledge({ packageName: PACKAGE_NAME, productId, token: purchaseToken, requestBody: {} });
      }

      await docRef.set({
        productId,
        purchaseToken,
        orderId: purchase.orderId || null,
        state: 'completed',
        revoked: false,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ verified: true, productId });
    } catch (err) {
      // A Google API error here (e.g. "purchase not found") almost always means a forged or
      // stale token - log it plainly so abuse is visible in the function logs, but don't leak
      // Google's raw error text back to the (unauthenticated) caller.
      logger.error('verifyAndGrantPurchase failed', { productId, purchaseToken, error: String(err) });
      res.status(502).json({ verified: false, reason: 'verification_failed' });
    }
  }
);

exports.checkEntitlement = onRequest({ cors: true }, async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const { purchaseToken } = req.body || {};
  if (!purchaseToken || typeof purchaseToken !== 'string') { res.status(400).json({ error: 'missing purchaseToken' }); return; }

  try {
    const doc = await db.collection('purchases').doc(purchaseToken).get();
    // An unknown token (never verified here, e.g. an app installed before this backend existed)
    // is treated as still-valid rather than revoked - this endpoint can only ever take
    // entitlement away based on evidence (a recorded revocation), never withhold it by default.
    const revoked = doc.exists && doc.data().revoked === true;
    res.json({ valid: !revoked });
  } catch (err) {
    logger.error('checkEntitlement failed', { purchaseToken, error: String(err) });
    // Fail open: a transient Firestore error shouldn't take away something the player paid for.
    res.json({ valid: true });
  }
});

// Wired from Play Console > Monetize > Monetization setup > Real-time developer notifications,
// pointed at a Pub/Sub topic this function subscribes to. See README.md for the exact setup.
exports.playRtdn = onMessagePublished('play-rtdn', async (event) => {
  let payload;
  try {
    payload = JSON.parse(Buffer.from(event.data.message.data, 'base64').toString('utf8'));
  } catch (err) {
    logger.error('playRtdn: unparseable message', { error: String(err) });
    return;
  }

  const voided = payload.voidedPurchaseNotification;
  if (!voided || !voided.purchaseToken) {
    // Subscription/other notification types aren't relevant to this app's one-time products -
    // acknowledged by returning normally (nothing to revoke).
    return;
  }

  // refundType: 1 = full refund, 2 = quantity-based partial refund. Either way, for a one-time
  // non-consumable or an already-granted consumable, the purchase is no longer valid.
  await db.collection('purchases').doc(voided.purchaseToken).set(
    { revoked: true, revokedAt: admin.firestore.FieldValue.serverTimestamp(), revokeReason: `refundType:${voided.refundType}` },
    { merge: true }
  );
  logger.info('playRtdn: marked purchase revoked', { purchaseToken: voided.purchaseToken });
});
