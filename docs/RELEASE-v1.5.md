# Pop-A-Boba review release 1.5

Version name: **1.5**. Version code: **6**. Package: `com.cheffrey.popabobba`. Minimum Android SDK: 24.

This release uses the exact user-provided sinker atlas. The source atlas and its root/production copies match SHA-256 `E97A0DB64E242871FC82B41BE6A1F55FC44E502331E818827A25A678174B623C`. Earlier sinker PNGs are preserved as inactive assets. Earlier review builds are preserved.

## Review artifacts

| Local file in `builds/` | SHA-256 |
| --- | --- |
| `Pop-A-Boba-Flavor-Journey-v1.5-code6-release.apk` | `47E06CD0D8A8DDAF4AFAD293D59BBF8DED846571FCE8E6AF3A12CC1967B186FB` |
| `Pop-A-Boba-Flavor-Journey-v1.5-code6-release.aab` | `D58E5489F5D5845C453F5E77F4D554AFAB69A8F7683D41BFABB488992D1AAEC5` |

The APK supports device installation for review. The AAB supports Play distribution review and is not directly installable. Binaries remain local rather than committed to Git.

## Verification

- Root completed Capacitor sync and Gradle `assembleRelease bundleRelease --offline --no-daemon` with Temurin JDK 21. Build succeeded in 39 seconds: 216 tasks, 54 executed and 162 up to date.
- SDK 36 `apksigner verify --verbose` verifies APK Signature Scheme v2 with one signer.
- SDK 36 `aapt dump badging` confirms package identity, version code 6, version name 1.5 and minimum SDK 24.
- JDK 21 `jarsigner -verify` reports `jar verified` for the AAB.
- `node tests/qa/packages.cjs` passes: all 65 production assets match both archives, with zero mismatches. Additional `cordova.js` and `cordova_plugins.js` files are generated runtime assets.
- Root/production/packaged HTML SHA-256 is `EE68492EE87D941CF84CA6A7EEFF04DC50A3513DC76059FDD63247CCE95B075D`.

## Diagnostics and review limits

AAB verification reports the existing self-signed certificate, untrusted certificate chain, no timestamp, POSIX metadata and streaming/JarFile manifest-order warnings. JarFile signature verification succeeds. This does not establish Play upload acceptance.

Frontend browser sandbox/emulation results are recorded in the QA report. Package verification does not include physical Android installation or live production ad delivery; those remain APK review steps.
