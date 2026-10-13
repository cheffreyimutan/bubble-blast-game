# Pop-A-Boba review release 1.4

Version name: **1.4**. Version code: **5**. Android package: `com.cheffrey.popabobba`. Minimum Android SDK: 24.

This review build includes the Flavor Journey map and mobile HUD, ad placement adjustments, mascot placement, and blue/clear sinker assets. Existing v1.3 review files remain available.

## Local review artifacts

| File in `builds/` | SHA-256 |
| --- | --- |
| `Pop-A-Boba-Flavor-Journey-v1.4-code5-release.apk` | `89FEE2A773CE0ED58419E8DFA111C3E6C53194AA52A6A5133089437A4652FB08` |
| `Pop-A-Boba-Flavor-Journey-v1.4-code5-release.aab` | `F1403333EA70CB4EFE8493F8B66E987A70D341A2DF02A019240DBDABD5364454` |

The signed APK is for device installation and review. The signed AAB is for Play distribution review; it is not directly installable. Binary artifacts remain local and are not committed to Git.

## Verification

- Capacitor Android sync completed before building.
- Gradle `assembleRelease bundleRelease --offline --no-daemon` completed successfully using existing Temurin JDK 21: 216 tasks, 6 executed and 210 up to date.
- SDK 36 `apksigner verify --verbose` verifies the APK with APK Signature Scheme v2 and one signer.
- SDK 36 `aapt dump badging` confirms package, version code 5, version name 1.4 and minimum SDK 24.
- JDK 21 `jarsigner -verify` reports `jar verified` for the AAB.
- `node tests/qa/packages.cjs` compares all 64 production web assets against both archives: zero mismatches. Generated `cordova.js` and `cordova_plugins.js` are additional runtime files.
- Root HTML, `www/index.html`, and both packaged HTML files have SHA-256 `5013607CAF1283EF94F42E2B9F6BC7987ED8C8BF37DE3B955FC5776C63FB6288`.

## Diagnostics and review limits

Initial build attempts encountered Windows/OneDrive locks in generated Gradle temporary/output directories. After clearing only the affected generated output paths, the build completed successfully; saved review artifacts were preserved.

AAB verification reports a self-signed certificate, untrusted certificate chain, no signing timestamp, POSIX ZIP metadata, and different streaming/JarFile interpretation due to manifest entry order. JarFile signature verification succeeds. These checks verify artifact integrity and signing, without claiming Play upload acceptance.

The frontend QA report records browser sandbox/device-emulation results. This release verification does not include physical Android device installation or live production ad delivery; those remain review steps on the APK.
