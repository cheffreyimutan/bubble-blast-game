# Pop-A-Boba review release 1.6

Version name: **1.6**. Version code: **7**. Package: `com.cheffrey.popabobba`. Minimum Android SDK: 24.

This release addresses the letterboxing observed in the user's physical-device screenshot, extends the scene to the viewport, and corrects native inset handling. Existing cup artwork remains unchanged. Previous review binaries are preserved.

## Review artifacts

| Local file in `builds/` | SHA-256 |
| --- | --- |
| `Pop-A-Boba-Flavor-Journey-v1.6-code7-release.apk` | `FA051FD18AD42F4E248565BEB8EF9AB9465EE01450C20B52A81916332B435377` |
| `Pop-A-Boba-Flavor-Journey-v1.6-code7-release.aab` | `70C16B6902393C2FC82F179F0215D6F8B7D3B33181031207CB307D412B8921D7` |

The APK supports installation for device review. The AAB supports Play distribution review and cannot be directly installed. Binary artifacts remain local rather than committed to Git.

## Verification

- Root completed Capacitor sync and Gradle `assembleRelease bundleRelease --offline --no-daemon` using Temurin JDK 21. Build succeeded in 1 minute 6 seconds: 216 tasks, 54 executed and 162 up to date.
- SDK 36 `apksigner verify --verbose` verifies the APK with APK Signature Scheme v2 and one signer.
- SDK 36 `aapt dump badging` confirms package identity, version code 7, version name 1.6 and minimum SDK 24.
- JDK 21 `jarsigner -verify` reports `jar verified` for the AAB.
- `node tests/qa/packages.cjs` passes: all 65 production assets match both archives, with zero mismatches. Additional `cordova.js` and `cordova_plugins.js` files are generated runtime assets.
- Root/production/packaged HTML SHA-256: `F24EF9AD91A32B330F4542041725AF9076040C6D0AF2B168E85DB31BC15247EC`.
- Root reports passing frontend suites: edge/inset 138 checks, full mobile 409 checks, focused artwork 128 checks and near-line 12 checks. The QA agent independently reviewed 13 screenshots before a usage limitation; root completed the artwork verification. See the QA report for the test scope.

## Review limits

AAB verification reports the existing self-signed certificate, untrusted certificate chain, no timestamp, POSIX metadata and streaming/JarFile manifest-order warnings. JarFile signature verification succeeds; this does not establish Play upload acceptance.

Browser sandbox and device emulation checks do not establish physical Android rendering. Reinstall this APK on the affected device to review the viewport/inset fix and production ad behavior.
