# Flavor Journey QA

## Current viewport repair: 1.6 / code 7

**Final scoped acceptance: 10/10 for frontend emulation and package verification.** A physical-device screenshot exposed side gutters from uniform scene fitting. Earlier 10/10 scores covered the stated bounds/readability checks but missed an explicit scene-to-viewport edge requirement; those results do not approve this repair. The repeated full mobile matrix passed **409/409**, explicit viewport checks passed **138/138**, artwork checks passed **128/128**, and near-danger-line gameplay passed **12/12**, all exit 0. The edge suite also passed 138/138 against the exact packaged source after the final asset-server repair. New checks measure the actual menu/map/game wrapper and gameplay canvas on all four viewport edges within one rendered CSS pixel, rather than treating painted body backgrounds as scene coverage.

The viewport matrix includes 320x568, 360x800, 360x1000, 390x844, 393x851, 412x915, 430x932, 424x950 (reported phone aspect ratio), 768x1024 tablet, DPR 3, two late-inset cases and 844x390 landscape fallback. Late native SystemBars CSS variables inject top 44px, bottom 48px and horizontal 4px without resizing; normal zero-inset contexts represent already reduced viewports. In-flight paused projectiles retain their board-relative geometry across height-only and tall/width resizing, then real physical-coordinate touch shooting scores. HUD, six-digit score, streak, controls, twelve-row board, launcher, danger line and full mascot face pass bounds and clearance checks. Independent short/safe/tall/tablet screenshots show round sprites, aligned straw/loaded pearls, intact mascot face and actual scene coverage without gutters.

Interrupted artwork runs encountered local asset connection resets; diagnostics are preserved in ignored `evidence/art-report1.6-failure.json` and `evidence/art-report1.6-buffered-failure.json`. The test server now buffers nonmedia files before response headers and uses keep-alive connections with explicit teardown. Focused artwork and edge modes exclude unchanged large audio/video transfers; the complete 409-check regression run served production media. The final artwork run passed 128/128 without product changes. The QA agent independently reviewed the viewport/cup screenshots; the root agent completed the final artwork execution after the QA agent reached its usage limit. Native device execution remains unverified.

DevOps verified signed v1.6/code 7 APK/AAB signatures and version metadata. The root agent independently reran `node tests/qa/packages.cjs`: **65 production assets per archive, zero mismatches, exit 0**. Source and packaged HTML SHA256 is `F24EF9AD91A32B330F4542041725AF9076040C6D0AF2B168E85DB31BC15247EC`. APK SHA256: `FA051FD18AD42F4E248565BEB8EF9AB9465EE01450C20B52A81916332B435377`; AAB SHA256: `70C16B6902393C2FC82F179F0215D6F8B7D3B33181031207CB307D412B8921D7`. See `docs/RELEASE-v1.6.md` for signing diagnostics and device-review limits. Existing cup artwork was preserved.

## Current atlas replacement: 1.5 / code 6

**Final scoped acceptance: 10/10.** Blue and clear Frozen Sinkers use the exact user-supplied 1774x887 atlas, with runtime crops from blue row 4 and clear row 6. Targeted artwork/mobile checks passed **128/128**, and near-danger-line gameplay passed **12/12**, both exit 0. The first artwork run was interrupted by local HTTP connection resets, with no failing artwork assertion; its diagnostic report is preserved as ignored `evidence/art-report-first-failure.json`. The unchanged runner completed successfully on retry without product changes.

QA independently reran `node tests/qa/packages.cjs` against the fresh 1.5/code 6 APK/AAB: **65 production assets per archive, zero mismatches, exit 0**. Root and production HTML match `EE68492EE87D941CF84CA6A7EEFF04DC50A3513DC76059FDD63247CCE95B075D`. DevOps verified APK v2 signature/one signer, package `com.cheffrey.popabobba`, code 6/name 1.5/minimum SDK 24, and AAB jar signature; existing certificate/toolchain warnings are recorded in `docs/RELEASE-v1.5.md`.

APK SHA256: `47E06CD0D8A8DDAF4AFAD293D59BBF8DED846571FCE8E6AF3A12CC1967B186FB`.

AAB SHA256: `D58E5489F5D5845C453F5E77F4D554AFAB69A8F7683D41BFABB488992D1AAEC5`.

Independent visual inspection of rendered twenty-pose contact sheets confirms intact blue faces/topknots and clear faces/flowers, without label chips or adjacent faces. Gameplay and How To use the same supplied artwork. The eight tested contexts cover five portrait widths, DPR 3, and synthetic 44px top/24px bottom insets at 320px and 390px. Animation renders at least three distinct idle/blink frames; all crop rectangles remain in the expected rows, existing two-hit rules pass, and real angled shots at the lowest legal occupied row remain playable. Source atlas byte equality was audited by root against the supplied file. The prior 1.4 evidence below covers unchanged navigation, geometry and ad timing. Native devices and live ads remain outside this browser-stub scope.

## Current follow-up release: 1.4 / code 5

**Final scoped acceptance: 10/10 rubric points passed.** The updated release passed the complete mobile matrix **374/374**, native ad bridge ordering **173/173**, rewarded retry **20/20**, focused layout **80/80**, updated artwork **120/120**, and near-danger-line gameplay **12/12** checks. All runners exited 0. The full matrix initially found three 320px streak/board overlaps (371/374); the coder repaired the measured streak reservation and the repeated matrix passed 374/374. No remaining scoped frontend failures are accepted.

QA independently reran `node tests/qa/packages.cjs` against the fresh 1.4/code 5 APK and AAB: **64 production assets checked in each archive, zero mismatches, exit 0**. Root and production HTML hash match `5013607CAF1283EF94F42E2B9F6BC7987ED8C8BF37DE3B955FC5776C63FB6288`. DevOps verified APK v2 signature with one signer, package `com.cheffrey.popabobba`, version 1.4/code 5, minimum SDK 24/target SDK 36, and AAB jar signature. The build required retry after a transient generated zip-cache lock. Existing Kotlin lint metadata diagnostics and self-signed/no-timestamp/certificate-chain/ZIP-manifest-order signature warnings remain documented in `docs/RELEASE-v1.4.md`. Native hardware and live native ads were not executed.

APK SHA256: `89FEE2A773CE0ED58419E8DFA111C3E6C53194AA52A6A5133089437A4652FB08`.

AAB SHA256: `F1403333EA70CB4EFE8493F8B66E987A70D341A2DF02A019240DBDABD5364454`.

Independent visual review of the final near-line screenshots at 320px and 390px with synthetic top 44px/bottom 24px insets confirms the mascot face stays below the danger line and above the power toolbar. Anchored blue/clear sinker stacks reach the lowest legal occupied row (centers 666.887 and 678.379 against danger Y=682). Real angled touchscreen shots score 42, consume one shot, damage the adjacent sinker once and remain playable without premature loss. The How To screenshots show intact artwork and readable distinctions between Frozen Sinker, Blue Frozen Sinker and Clear Frozen Sinker.

Reproduce with `node tests/qa/mobile.cjs`, `node tests/qa/mobile.cjs --layout-spot`, `node tests/qa/mobile.cjs --art`, `node tests/qa/mobile.cjs --near-line`, `node tests/qa/ads.cjs`, and `node tests/qa/ads.cjs --reward-retry`. Evidence is local and ignored under `tests/qa/evidence/`. The full ad run predates the final geometry-only repair; native ad code was unchanged by that repair. Delayed local native bridge stubs verify dismissal ordering, failures/timeouts, rapid clicks, pause exits and rewarded earned/dismissal behavior; they do not execute live native ads. The isolated-profile/local-server permissions and emulation limitations described below also apply to this release.

## Historical release: 1.3 / code 4

Run `node tests/qa/mobile.cjs` from the repository root. Run `node tests/qa/mobile.cjs --layout-spot` for focused geometry retesting after layout repairs. Requires the repository's Playwright dependency and installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Any failed assertion produces a nonzero process exit code.

The runner starts an ephemeral HTTP server bound only to `127.0.0.1` and tests the production `www/index.html`. It creates a fresh isolated browser context for each viewport, with synthetic localStorage fixtures. It never uses the user's browser profile or saved game data. All external requests are fulfilled locally with empty responses, so fonts use offline fallback. Audio and images are served from the actual repository, with range support for media.

The OS sandbox denied localhost browser access. An approved escalated command allowed the local browser/server connection. The application sandbox is the isolated browser profile and fixtures; this is not a claim that the completed browser run remained inside the original OS network restrictions.

## Acceptance rubric

| Point | Requirement | Evidence |
| --- | --- | --- |
| 1 | Flavor Journey map, connected rounded level nodes, clear current and locked states | Frontend screenshots and node fixtures |
| 2 | Original artwork retained and loads | Git blob audit: 155 tracked media files unchanged; frontend resource checks |
| 3 | HUD contains six-digit score, long flavor, level 10-10, urgency, timer and streak without overlap | Bounds assertions and screenshots |
| 4 | Responsive mobile widths and readable landscape fallback | 320x568, 360x640, 390x844, 412x915, 430x932, 844x390 |
| 5 | Progress fixtures, map scrolling and level selection work | Unlocked 1/11/100, first/last node, stars/combo, toppings and start |
| 6 | Gameplay timing, touch shooting, score, pause/resume and restart/quit/endless work | Real touchscreen events plus controlled board fixture for a scoring match |
| 7 | Navigation and existing related screens continue working | Shop, settings, how-to, daily gift, powers and end-level map |
| 8 | Relevant map/HUD/power touch targets are at least 44 rendered pixels; reduced motion and text fit | DOM dimensions, reduced-motion browser contexts, visual review |
| 9 | Sandbox run has no JavaScript errors or missing production assets; failed changes return for repair | Fresh contexts, local resource status, repair/retest loop |
| 10 | Production web/Android assets match and review APK/AAB are built and verified | Build succeeded; independent package asset, signature and APK version verification passed |

## Final frontend result

**Final scoped acceptance: 10/10 rubric points passed.** Frontend points 1–9 and package delivery point 10 are complete. This score describes the stated emulated frontend and package checks; it does not claim physical device or native service execution.

The broad matrix completed 373/374 checks. Its single 360px timer assertion used a 150ms fixed delay; the focused retest replaced this with an eventual decrease within two seconds to account for frame scheduling and passed. The final focused run completed **56/56 checks, exit code 0**, including every portrait width, DPR 3 and both synthetic safe-area cases. The original broad result remains recorded without rewriting it as 374/374.

The final focused run verified real touch shooting produces a matching score and end-level overlay, working timers, 44px power controls and viewport bounds, board/straw clearance, no JavaScript errors and no missing production assets. All scoped failures were resolved and retested. Structured results and screenshots are written to ignored `tests/qa/evidence/`.

The focused mode covers all five portrait sizes, a 390px viewport with device pixel ratio 3, and test-only simulated top insets of 44px plus bottom insets of 24px at both 320px and 390px with a full twelve-row board. These CSS offsets are synthetic geometry tests, not actual hardware safe-area measurements. It preserves the broad report and writes a separate `layout-report.json`.

Independent visual review found the Flavor Journey layout coherent at all five portrait sizes and DPR 3. Repairs addressed undersized power buttons, stale gameplay streak on the map, a readable rotation prompt in landscape, mascot face visibility above the toolbar, and safe-area board/straw overlap. Final 320px and 390px safe-area screenshots show separation between the full board and straw; the mascot's eyes and mouth remain visible. Existing artwork was retained. Root and production `www` HTML were byte-identical at the pre-release audit.

## Test limits

This is frontend testing with mobile viewport and touch emulation, not physical Android/iOS hardware testing. Actual device notch insets, hardware performance, native purchases, ads and Play Games services are outside this frontend check. Safe-area handling was inspected in code; browser emulation reports zero physical notch insets. The frozen timer check validates the existing CSS presentation using a DOM fixture; no new freeze gameplay mechanic is claimed. The synthetic matching board tests real pointer-to-shot-to-score behavior without relying on random game layouts.

## Release package verification

The release build completed successfully with Java 21: `assembleRelease` and `bundleRelease`, 216 tasks. The build emitted existing Kotlin lint metadata compatibility diagnostics (expected 2.2 versus dependency metadata 2.4), while the release tasks and overall build succeeded. No toolchain upgrade was introduced for this UI change.

Independent QA ran `node tests/qa/packages.cjs`: all **60 production www files** match their packaged SHA-256 in both APK and AAB, with zero mismatches. The only extra web files are Capacitor/Cordova runtime files `cordova.js` and `cordova_plugins.js`. Root HTML, production HTML and both packaged HTML hashes match:

`BDB4E313087D4ED31A0C657E77B072CDC58B7D5E859F25F93E2F2B85CC7237C0`

QA independently ran SDK 36 `apksigner verify --verbose`: APK verifies using signature scheme v2 with one signer. SDK 36 `aapt dump badging` confirms `com.cheffrey.popabobba`, version code **4**, version name **1.3**, minimum SDK **24**, target SDK **36**. `jarsigner -verify` reports **jar verified** for the AAB. Its self-signed certificate, absent timestamp, certificate chain and streamed ZIP manifest-order warnings are recorded; the standard JarFile verification succeeds. Actual native device execution remains outside these checks.

| Review artifact | SHA-256 |
| --- | --- |
| `builds/Pop-A-Boba-Flavor-Journey-v1.3-code4-release.apk` | `EFF3366999DC5F23D31665A720AE349CC1F98333EA105E193D41B1CD04534DF6` |
| `builds/Pop-A-Boba-Flavor-Journey-v1.3-code4-release.aab` | `F51803E44F4EFCF8295B2AF404EBE3D6BD8508918696ADA4A5580E030C36B961` |
