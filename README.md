# MOSTLYVERS Android

Expo/React Native Android reader for the MOSTLYVERS backend. The app is Android-only and uses EAS Build for installable APK testing and Google Play AAB releases.

## Verification

```bash
npm ci
npm run typecheck
npm test
npx expo config --type public
```

## Production-connected APK

After the Render backend and Cloudflare admin are live, run the guided setup:

```bash
./scripts/setup-android-release-wizard.sh
```

The `staging` EAS profile creates an installable APK using the Preview environment. The `production` profile creates an AAB for Google Play. Public client configuration belongs in EAS environment variables; backend secrets must never be included in the Android project.
