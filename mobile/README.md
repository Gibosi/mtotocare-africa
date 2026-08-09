# MtotoCare Mobile

React Native + Expo SDK 51 parent app for tracking children's health, vaccinations, growth, nutrition, and booking appointments.

## Quick start (Expo Go — dev)

```bash
npm install --legacy-peer-deps
npx expo start
# Scan QR with Expo Go on your phone
```

## Build installable APK

```powershell
powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
# 10-20 min on EAS cloud
# Download link: https://expo.dev/accounts/<you>/projects/mtotocare-africa/builds
```

The APK is a real `.apk` file anyone can sideload on Android (Settings → Install unknown apps → tap to install).

## App structure

```
app/
├── _layout.tsx          Root: providers (Redux, i18n, Theme, Language)
├── index.tsx            Entry: redirects to /welcome or /(tabs)/home
├── welcome.tsx          First-launch screen
├── choose-language.tsx  Shown after register: pick EN or SW
│
├── (auth)/
│   ├── login.tsx                       Email + password OR biometric
│   ├── register.tsx                    Create parent account
│   ├── forgot-password.tsx             Request reset email
│   ├── reset-password.tsx              Set new password
│   ├── add-your-child.tsx              Add a child profile
│   ├── get-started.tsx
│   └── welcome.tsx
│
├── (tabs)/                Bottom tab bar
│   ├── _layout.tsx       Custom tab bar with [+] center button
│   ├── home.tsx           Greeting, child overview, quick actions
│   ├── records.tsx        All health records
│   ├── reminders.tsx      Upcoming events
│   └── profile.tsx        Settings, biometric, logout
│
├── (admin)/               Admin portal (role=ADMIN)
│   ├── dashboard.tsx, users.tsx, facilities.tsx, audit.tsx, settings.tsx, sync.tsx, profile.tsx
│
├── (provider)/            Provider portal (role=DOCTOR/NURSE/MIDWIFE/CHW)
│   ├── dashboard.tsx, patients.tsx, patient-detail.tsx, appointments.tsx, profile.tsx
│
├── ai-chat.tsx            Real AI assistant (Groq Llama 3.3 70B + offline fallback)
├── growth.tsx             Growth chart
├── growth/add.tsx         Add growth measurement
├── nutrition.tsx          Generate / view meal plan
├── vaccinations.tsx       Vaccination tracker
├── appointments.tsx       Appointment list
├── appointments/book.tsx  Book new appointment
├── children/[id].tsx      View child detail
├── children/add.tsx       Add child (also accessible via long-press [+])
├── children/index.tsx     Redirect to home
├── notifications.tsx      Notifications list
├── medical-records.tsx    Medical history
├── offline.tsx            Offline support info
│
└── profile/
    ├── edit.tsx             Edit name, phone, language
    ├── change-password.tsx  Change own password
    ├── language.tsx         EN/SW picker (live, no reload)
    ├── help.tsx             Help center
    ├── privacy.tsx          Privacy policy
    └── about.tsx            About the app
```

## Features

### Biometric login (real, not demo)

1. Log in with email + password
2. Profile → Fingerprint/Face ID → toggle on
3. OS prompts for biometric
4. On success, email + refresh token saved in `expo-secure-store` (hardware-encrypted)
5. Next time on login screen, a big **"Sign in with Fingerprint"** button appears
6. Tap → biometric prompt → auto-login via refresh token

### AI Assistant (real)

Uses Groq Llama 3.3 70B. Set `GROQ_API_KEY` env var on backend.
Without a key, falls back to a safe curated response library.

### Bilingual UI (real)

Pick English or Kiswahili in:
- **Post-register screen** (choose-language.tsx)
- **Profile → Language** (live, no reload)

Everything re-renders: navigation, forms, alerts, AI responses, emails.

### 5-tab bottom bar

`Home | Records | [+] | Reminders | Profile`

The center `[+]` button:
- **Tap:** Book Appointment
- **Long-press:** Add Child

### Splash screen

No wifi/battery/time icons. Full screen with just the app icon on green background.

## Configuration

- `app.json` — Expo config (name, icon, splash, Android perms, iOS bundle id)
- `app.config.js` — same as app.json but for runtime
- `.env` — `EXPO_PUBLIC_API_URL` (optional; auto-detected from Expo dev server)
- `eas.json` — EAS Build profiles

## Build outputs

| Command | Output |
|---|---|
| `npx expo start` | Dev server, opens in Expo Go |
| `eas build -p android --profile preview` | Installable APK (sideload) |
| `eas build -p android --profile production` | Play Store AAB |
| `eas build -p ios --profile production` | App Store IPA (needs Apple Developer account) |
| `npx expo export --platform web` | Static web build (for netlify/vercel) |

## Tech

- React Native 0.74
- Expo SDK 51
- TypeScript
- React Native Reanimated 3
- React Native Gesture Handler 2
- expo-router 3.5 (file-based routing)
- Redux Toolkit + RTK Query (basic)
- i18next + react-i18next (mobile) — full EN + SW
- expo-local-authentication (biometric)
- expo-secure-store (secure storage for refresh token)
- expo-image-picker (avatar upload)
- expo-notifications (push)
- @react-native-community/datetimepicker
