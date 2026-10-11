# Flavor Journey QA

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
