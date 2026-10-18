# Purchase verification backend

Server-side counterpart to the Play Billing code in `www/index.html`. See the comment at the top
of `index.html` (this directory) for what each function does and why it exists.

## One-time setup

1. **Create a Firebase project** (if you don't have one): https://console.firebase.google.com →
   Add project. Free (Spark/Blaze - this needs Blaze, the pay-as-you-go plan, because outbound
   calls to the Play Developer API require it; it has a generous free tier and this app's call
   volume won't come close to costing anything).
2. Install the CLI if you don't have it: `npm install -g firebase-tools`, then `firebase login`.
3. Point this repo at your project: from the repo root, `firebase use --add` and pick your
   project, or edit `.firebaserc` directly and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`.
4. **Enable Firestore**: Firebase Console → Build → Firestore Database → Create database
   (production mode, any region - it only ever stores purchase-token records).
5. **Link Play Console to this Firebase project's service account** (this is what lets the
   function ask Google "is this purchase real?"):
   - Play Console → Setup → API access → "Link" a Google Cloud project if not already linked
     (pick the SAME project as this Firebase project - they can be the same project).
   - Still on that page, under "Service accounts", find the one named like
     `firebase-adminsdk-xxxxx@<project-id>.iam.gserviceaccount.com` (Firebase creates this
     automatically) - if it's not listed yet, click "Create new service account" and follow the
     Google Cloud Console link, then come back and refresh.
   - Click "Grant access" next to it. Give it these permissions: **Financial data → View
     financial data, orders, and cancellation survey responses**, and **Orders → Manage orders**
     (needed to acknowledge/consume/refund-check purchases). Nothing else is needed.
   - This means the function's OWN identity can authenticate to the Play Developer API with no
     separate key file to manage - but it only works when deployed (Application Default
     Credentials), so for local testing you'd still need a downloaded key. For now, deploy and
     test for real rather than running this locally.
6. Deploy: from the repo root, `firebase deploy --only functions`.
7. After deploying, you'll get three function URLs printed (verifyAndGrantPurchase,
   checkEntitlement, playRtdn - playRtdn won't have an HTTPS URL, it's Pub/Sub-triggered). Put the
   `verifyAndGrantPurchase` and `checkEntitlement` URLs into `www/index.html`'s
   `PURCHASE_VERIFY_ENDPOINT` / `PURCHASE_ENTITLEMENT_CHECK_ENDPOINT` constants (search for them),
   then re-mirror to `index.html` and rebuild the app.

## Wiring refund notifications (Real-time developer notifications)

1. Google Cloud Console (same project) → Pub/Sub → Create topic named exactly `play-rtdn`.
2. Play Console → Monetize → Monetization setup → Real-time developer notifications → turn it on,
   paste the full topic name (`projects/<project-id>/topics/play-rtdn`) → Save.
3. Grant Google Play's publishing service account `Pub/Sub Publisher` on that topic - Play Console
   shows you the exact service account email to add; do it in Cloud Console → Pub/Sub → the
   `play-rtdn` topic → Permissions → Add principal.
4. The `playRtdn` function (already deployed in step 6 above) is subscribed to that topic
   automatically - no separate subscription to create.

## What's NOT handled by this backend (scope - see it as a solid baseline, not a finished system)

- Subscriptions (this app only sells one-time products today - `remove_ads`, `coins_250`).
- A full client-side entitlement poll loop - `checkEntitlement` exists and the client calls it
  opportunistically (see `checkRemoveAdsEntitlement()` in `www/index.html`), but there's no
  push-to-device mechanism, so a refund takes effect next time the app checks, not instantly.
