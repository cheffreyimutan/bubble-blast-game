const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http');
const root = path.resolve(__dirname, '../..');
const out = path.join(__dirname, 'evidence');
fs.mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404); return res.end(); }
    let start = 0, end = stat.size - 1, status = 200;
    const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    if (range) { start = Number(range[1]); end = range[2] ? Math.min(end, Number(range[2])) : end; status = 206; }
    const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', Connection: 'close' };
    if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    res.writeHead(status, headers);
    const stream = fs.createReadStream(file, { start, end });
    res.on('close', () => stream.destroy()); stream.on('error', () => res.destroy()); stream.pipe(res);
  });
});
const results = [];
const retryOnly = process.argv.includes('--reward-retry');
const reportFile = retryOnly ? 'ads-retry-report.json' : 'ads-report.json';
let browser;
function check(name, pass, detail) { results.push({ name, pass: !!pass, detail }); }

function nativeFixture(config) {
  localStorage.setItem('bubbleBlastOnboardingSeen', '1');
  localStorage.setItem('bubbleBlastIntroVideoSeen', '1');
  localStorage.setItem('bubbleBlastTutorialSeen', '1');
  localStorage.setItem('bubbleBlastPlayerName', 'Ad QA');
  localStorage.setItem('bubbleBlastSettings', JSON.stringify({ sfxMuted: true, bgmMuted: true, vibEnabled: false }));
  if (config.removeAds) localStorage.setItem('bubbleBlastRemoveAds', '1');
  const listeners = {}, timeline = [];
  const log = name => timeline.push({ name, at: performance.now() });
  window.qaAd = {
    timeline,
    emit(name, payload = { message: 'fixture', amount: 1, type: 'reward' }) { log(name); for (const callback of [...(listeners[name] || [])]) callback(payload); },
    resolvePrepare() { window.qaAd.prepareResolve?.(); },
    count(name) { return timeline.filter(item => item.name === name).length; }
  };
  // Only long ad deadlines are accelerated; splash and normal short timers retain their timing.
  const originalTimeout = window.setTimeout.bind(window);
  window.setTimeout = (callback, delay, ...args) => originalTimeout(callback, delay >= 3000 ? 300 : delay, ...args);
  if (config.web) return;
  window.Capacitor = { Plugins: { AdMob: {
    async initialize() {},
    async addListener(name, callback) {
      log('listen:' + name);
      if (config.listenerReject) throw Error('listener registration failed');
      (listeners[name] ||= []).push(callback);
      const handle = { async remove() { log('remove:' + name); listeners[name] = listeners[name].filter(item => item !== callback); } };
      if (config.listenerDelayed) return new Promise(resolve => window.qaAd.listenerResolve = () => resolve(handle));
      return handle;
    },
    prepareInterstitial() {
      log('prepare');
      if (config.prepareReject) return Promise.reject(Error('no fill'));
      if (config.prepareDelayed) return new Promise(resolve => window.qaAd.prepareResolve = resolve);
      return Promise.resolve();
    },
    showInterstitial() {
      log('show');
      if (config.showReject) return Promise.reject(Error('show failed'));
      if (config.showDelayed) return new Promise((resolve, reject) => { window.qaAd.showResolve = resolve; window.qaAd.showReject = reject; });
      log('showPromiseResolved');
      return Promise.resolve();
    },
    async prepareRewardVideoAd() { log('rewardPrepare'); },
    showRewardVideoAd() { log('rewardShow'); return config.rewardUnEarned ? new Promise(() => {}) : Promise.resolve({ amount: 1, type: 'reward' }); }
  } } };
  if (config.nativeWeb) window.Capacitor.isNativePlatform = () => false;
}

async function destination(page, action) {
  return page.evaluate(action => action === 'next' ? appState === 'playing' && currentLevel === 2 && !gameOver : action === 'restart' ? appState === 'playing' && currentLevel === 1 && !gameOver : action === 'retry' ? appState === 'endless' && !gameOver : appState === action, action);
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const cases = [
    ['win-next', 'win', 'next', { prepareDelayed: true }],
    ['win-map', 'win', 'map', {}],
    ['endless-retry', 'endless', 'retry', {}],
    ['endless-menu', 'endless', 'menu', {}],
    ['give-up', 'fail', 'map', {}],
    ['rapid-next-map', 'win', 'next', { prepareDelayed: true, rapid: true }],
    ['prepare-no-fill', 'win', 'next', { prepareReject: true }],
    ['show-rejected', 'win', 'next', { showReject: true }],
    ['listener-rejected', 'win', 'next', { listenerReject: true }],
    ['failed-to-show-event', 'win', 'next', { eventFailure: true }],
    ['late-prepare-timeout', 'win', 'next', { prepareDelayed: true, timeout: true }],
    ['remove-ads', 'win', 'next', { removeAds: true }],
    ['web-no-plugin', 'win', 'next', { web: true }],
    ['web-plugin-not-native', 'win', 'next', { nativeWeb: true }],
    ['pause-level-quit', 'pause-level', 'map', {}],
    ['pause-level-restart', 'pause-level', 'restart', {}],
    ['pause-endless-quit', 'pause-endless', 'menu', {}],
    ['pause-endless-restart', 'pause-endless', 'retry', {}],
    ['late-listener-timeout', 'win', 'next', { listenerDelayed: true }],
    ['presented-ad-rejects-promise', 'win', 'next', { showDelayed: true, presentedReject: true }],
    ['dismissed-before-show-promise', 'win', 'next', { showDelayed: true }],
    ['paid-continue', 'continue', 'paid', {}],
    ['rewarded-continue', 'continue', 'reward', {}],
    ['rewarded-continue-no-earned-event', 'continue', 'reward', { rewardUnEarned: true }],
    ['win-reward', 'win-reward', 'reward', {}],
    ['win-reward-dismiss-before-earn', 'win-reward', 'reward', { rewardUnEarned: true }]
  ];
  for (const [name, ending, action, config] of cases) {
    if (retryOnly && !config.rewardUnEarned) continue;
    console.log('Testing ' + name);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.fulfill({ status: 200, body: '' }));
    await context.addInitScript(nativeFixture, config);
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/www/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => getComputedStyle(document.getElementById('splashScreen')).display === 'none' && appState === 'menu');
    await page.evaluate(ending => {
      economy.pearls = 500;
      if (ending.startsWith('pause')) { ending === 'pause-endless' ? startEndless() : startLevel(1); openPause(); }
      else if (ending === 'endless') { startEndless(); failEndless(); }
      else { startLevel(1); if (ending === 'win' || ending === 'win-reward') winLevel(); else failLevel('QA timeout'); }
    }, ending);
    await page.waitForTimeout(50);
    const resultSelector = ending.startsWith('pause') ? '#pauseOverlay' : '#overlay';
    check(name + ': result visible before ad preparation', await page.locator(resultSelector).isVisible() && await page.evaluate(() => qaAd.count('prepare') === 0 && qaAd.count('show') === 0));
    if (ending === 'continue' || ending === 'win-reward') {
      const pearls = await page.evaluate(() => economy.pearls);
      await page.locator(action === 'paid' ? '#overlayPrimaryBtn' : '#overlayAdBtn').tap();
      await page.waitForTimeout(70);
      if (action === 'paid') {
        check(name + ': continues without interstitial', await page.evaluate(() => !gameOver && qaAd.count('prepare') === 0 && qaAd.count('show') === 0));
        check(name + ': payment preserved', await page.evaluate(pearls => economy.pearls === pearls - CONTINUE_COST, pearls));
      } else {
        await page.waitForFunction(() => qaAd.count('rewardShow') === 1);
        check(name + ': early reward promise does not resume', await page.evaluate(() => gameOver));
        check(name + ': result remains hidden while reward ad is visible', await page.locator('#overlay').isHidden());
        await page.evaluate(() => { document.getElementById('overlayPrimaryBtn').click(); document.getElementById('overlaySecondaryBtn').click(); });
        check(name + ': pending reward blocks stale result exits', await page.evaluate(() => qaAd.count('prepare') === 0 && qaAd.count('show') === 0));
        if (!config.rewardUnEarned) {
          await page.evaluate(() => qaAd.emit('onRewardedVideoAdReward'));
          await page.waitForTimeout(50);
          check(name + ': earned event still waits for dismissal', await page.evaluate(() => gameOver));
        }
        await page.evaluate(() => qaAd.emit('onRewardedVideoAdDismissed'));
        await page.waitForTimeout(70);
        if (config.rewardUnEarned) {
          check(name + ': unearned dismissal restores result', await page.locator('#overlay').isVisible() && await page.evaluate(() => gameOver));
          check(name + ': unearned dismissal grants no reward', await page.evaluate(pearls => economy.pearls === pearls, pearls));
          await page.locator('#overlayAdBtn').tap();
          await page.waitForTimeout(70);
          check(name + ': unearned reward can be retried', await page.evaluate(() => qaAd.count('rewardShow') === 2));
          await page.evaluate(() => { qaAd.emit('onRewardedVideoAdReward'); qaAd.emit('onRewardedVideoAdDismissed'); });
          await page.waitForTimeout(70);
          check(name + ': retry pays or resumes only after earned dismissal', ending === 'continue' ? await page.evaluate(() => !gameOver) : await page.evaluate(pearls => economy.pearls > pearls, pearls));
        } else if (ending === 'continue') {
          check(name + ': earned dismissed reward resumes same game', await page.evaluate(() => !gameOver && currentLevel === 1 && qaAd.count('prepare') === 0));
          check(name + ': rewarded continue does not charge pearls', await page.evaluate(pearls => economy.pearls === pearls, pearls));
        } else {
          check(name + ': earned dismissed reward restores win result', await page.locator('#overlay').isVisible() && await page.evaluate(() => gameOver));
          check(name + ': win reward grants pearls once', await page.evaluate(pearls => economy.pearls > pearls, pearls));
          const rewardedPearls = await page.evaluate(() => economy.pearls); await page.evaluate(() => qaAd.emit('onRewardedVideoAdReward'));
          check(name + ': duplicate late earned event cannot pay twice', await page.evaluate(n => economy.pearls === n, rewardedPearls));
        }
      }
    } else {
      const button = ending.startsWith('pause') ? action === 'map' || action === 'menu' ? '#quitBtn' : '#restartBtn' : ending === 'fail' ? '#overlayGhostBtn' : action === 'map' || action === 'menu' ? '#overlaySecondaryBtn' : '#overlayPrimaryBtn';
      await page.locator(button).tap();
      if (config.rapid) await page.evaluate(() => { document.getElementById('overlayPrimaryBtn').click(); document.getElementById('overlaySecondaryBtn').click(); });
      if (config.removeAds || config.web || config.nativeWeb || config.prepareReject || config.showReject || config.listenerReject) {
        await page.waitForTimeout(80);
        check(name + ': exits safely on skip or failure', await destination(page, action));
        if (config.removeAds || config.web || config.nativeWeb || config.listenerReject) check(name + ': no unsafe preparation', await page.evaluate(() => qaAd.count('prepare') === 0 && qaAd.count('show') === 0));
      } else if (config.timeout) {
        await page.waitForTimeout(400);
        check(name + ': timeout exits safely', await destination(page, action));
        await page.evaluate(() => qaAd.resolvePrepare()); await page.waitForTimeout(50);
        check(name + ': late preparation never shows ad', await page.evaluate(() => qaAd.count('show') === 0));
      } else if (config.listenerDelayed) {
        await page.waitForTimeout(400);
        check(name + ': listener timeout exits safely', await destination(page, action));
        await page.evaluate(() => qaAd.listenerResolve()); await page.waitForTimeout(50);
        check(name + ': late listener removed without showing', await page.evaluate(() => qaAd.count('prepare') === 0 && qaAd.count('show') === 0 && qaAd.timeline.some(item => item.name.startsWith('remove:'))));
      } else {
        check(name + ': result hidden during transition', await page.locator(resultSelector).isHidden());
        if (config.prepareDelayed) {
          check(name + ': destination waits for preparation', !await destination(page, action));
          await page.evaluate(() => qaAd.resolvePrepare());
        }
        await page.waitForFunction(() => qaAd.count('show') === 1);
        if (config.presentedReject) {
          await page.evaluate(() => { qaAd.emit('interstitialAdShowed'); qaAd.showReject(Error('late bridge rejection')); qaAd.emit('interstitialAdFailedToShow'); });
          await page.waitForTimeout(70);
          check(name + ': presented ad remains locked after late failure', !await destination(page, action));
        }
        const timer = await page.evaluate(() => levelTimeLeft); await page.waitForTimeout(70);
        check(name + ': early show promise does not start destination', !await destination(page, action));
        check(name + ': gameplay timer stays frozen during ad', await page.evaluate(timer => levelTimeLeft === timer, timer));
        await page.evaluate(event => qaAd.emit(event), config.eventFailure ? 'interstitialAdFailedToShow' : 'interstitialAdDismissed');
        await page.waitForTimeout(70);
        check(name + ': event releases exactly one transition', await destination(page, action) && await page.evaluate(() => qaAd.count('prepare') === 1 && qaAd.count('show') === 1));
        if (config.showDelayed && !config.presentedReject) { await page.evaluate(() => qaAd.showResolve()); await page.waitForTimeout(30); check(name + ': late show promise preserves destination', await destination(page, action)); }
      }
    }
    check(name + ': no JavaScript errors', errors.length === 0, errors);
    results.push({ name: name + ': timeline', pass: true, detail: await page.evaluate(() => qaAd.timeline) });
    await context.close();
  }
  fs.writeFileSync(path.join(out, reportFile), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.filter(item => item.pass).length, total: results.length, failures: results.filter(item => !item.pass) }, null, 2));
  if (results.some(item => !item.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); results.push({ name: 'Harness completed', pass: false, detail: error.message }); fs.writeFileSync(path.join(out, reportFile), JSON.stringify(results, null, 2)); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); server.close(); });
