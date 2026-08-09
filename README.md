# MtotoCare Africa

> **AI-powered child health & parenting platform for families across Africa.**
> Parents track their children's growth, vaccinations, nutrition, and book appointments.
> Healthcare workers manage their patients. Administrators run the whole platform.

[![Backend](https://img.shields.io/badge/backend-Spring%20Boot%202.7-green)]()
[![Mobile](https://img.shields.io/badge/mobile-React%20Native%20%2B%20Expo%20SDK%2051-blue)]()
[![Web](https://img.shields.io/badge/web-React%2018%20%2B%20Vite%205-orange)]()
[![Java](https://img.shields.io/badge/Java-21-red)]()
[![MySQL](https://img.shields.io/badge/database-MySQL%208-blue)]()

---

## 📋 Table of contents (all instructions in one place)

1. [Quick start (5 minutes)](#-quick-start-5-minutes)
2. [Where to find everything](#-where-to-find-everything)
3. [Default admin account](#-default-admin-account)
4. [Add your first parent / doctor / facility](#-add-your-first-people-and-facilities)
5. [Run on Windows 10 (your PC)](#-run-on-windows-10)
6. [Test the AI Assistant](#-test-the-ai-assistant)
7. [Test the offline mode](#-test-the-offline-mode)
8. [Test the Activity Log (audit)](#-test-the-activity-log-audit)
9. [Build the Android APK](#-build-the-android-apk)
10. [Production deployment (Render.com)](#-production-deployment-rendercom)
11. [Optional: enable real Gmail emails](#-optional-enable-real-gmail-emails)
12. [Optional: enable real Groq AI streaming](#-optional-enable-real-groq-ai-streaming)
13. [Troubleshooting](#-troubleshooting)
14. [Configuration reference](#-configuration-reference)
15. [Tech stack](#-tech-stack)
16. [FRS & NFRS compliance](#-frs--nfrs-compliance)

---

## At a glance

| App | Who it's for | What it does | Tech |
|---|---|---|---|
| **Mobile** (parent) | Parents and families | Track child's growth, vaccinations, nutrition, AI assistant, book appointments, biometric login, real-time language switching (EN / SW) | React Native 0.74 + Expo SDK 51 + TypeScript + Redux Toolkit |
| **Web admin** | Healthcare workers & administrators | Manage users & roles, facilities, view all patients, audit logs, reports. Bilingual. | React 18 + Vite 5 + Tailwind 3 + Recharts |
| **Backend** | All clients | 146 REST endpoints, JWT auth + refresh rotation, Groq AI, Gmail SMTP, Flyway migrations | Spring Boot 2.7.18 + Java 21 + Lombok + H2 (dev) / MySQL 8 (prod) |
| **Database** | — | 30 tables, only the admin is seeded. Everything else is created by users. | MySQL 8 (prod) / H2 in-memory (dev) |

**Total: 52 mobile screens, 13 web pages, 25 backend controllers, 146 endpoints, 30 database tables, 100% mobile↔backend match.**

---

## ✨ Highlights

- **Real AI Assistant** — powered by Groq Llama 3.3 70B (free), with safe offline canned responses when no API key is set, **and live streaming tokens** (type "What food is good for my child?" → see the answer appear word by word)
- **Real biometric login** — fingerprint & face ID with secure refresh-token storage (expo-secure-store)
- **Real bilingual UI** — English and Kiswahili, with the entire app re-rendering instantly when the user switches language
- **Real email** — Gmail SMTP with bilingual (EN / SW) welcome and password-reset emails
- **Real offline mode** — every tab shows a friendly banner when the device is offline, mutations are queued in encrypted SecureStore and replayed on reconnect, the AI keeps answering from a local library, and parents can still see their records, growth charts, and reminders
- **Installable everywhere** — Android APK, iOS, and Web builds all from one codebase
- **Zero demo data** — only the admin account is seeded; everything else is created by real users
- **Polished splash** — fullscreen green, no system status bar icons
- **Bilingual** — every screen, error message, toast, and email is in EN + SW
- **User-friendly errors** — every backend error code (ECONNABORTED, JWT expired, etc.) is translated into plain EN/SW messages the parent or provider can actually understand

---

## 🚀 Quick start (5 minutes)

### Prerequisites
- **Java 21** (download from https://adoptium.net — pick "Temurin 21 LTS")
- **Maven 3.9+** (`choco install maven` on Windows, or download from https://maven.apache.org)
- **Node.js 18+** (https://nodejs.org)
- **Expo Go** on your phone (App Store / Play Store) — for testing without a build
- **Git** for Windows

> 💡 On Windows 10, open **PowerShell as Administrator** and run:
> ```powershell
> choco install temurin21 maven nodejs-lts git
> ```
> Restart the terminal so PATH picks them up.

### Step 1 — Start the backend (≈ 30 seconds)

```powershell
cd C:\Users\Wilson\Desktop\mtotocare-africa\backend
mvn spring-boot:run
```

You should see:
```
Started MtotoCareApplication in 9.6 seconds (JVM running for 10.1)
Tomcat started on port 8080
```

Quick health check (open a new terminal):
```powershell
curl http://localhost:8080/api/auth/health
# → {"success":true,"message":"Auth service is running","data":"OK"}
```

The H2 in-memory database is created automatically and the **admin user is seeded** on first start.

### Step 2 — Start the web admin (≈ 1 minute)

Open a **second** terminal:
```powershell
cd C:\Users\Wilson\Desktop\mtotocare-africa\frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173 in your browser. Log in with **`admin@mtotocare.africa` / `Admin123!`**.

### Step 3 — Start the mobile app (≈ 2 minutes)

Open a **third** terminal:
```powershell
cd C:\Users\Wilson\Desktop\mtotocare-africa\mobile
npm install --legacy-peer-deps
npx expo start
```

A browser tab opens with a QR code. Scan it with **Expo Go** on your phone. The app auto-detects your PC's local IP (e.g. `192.168.96.168`) and connects to the backend.

> 🔍 If the phone can't reach the backend, run `powershell -ExecutionPolicy Bypass -File .\get-my-ip.ps1` to see your PC's IPs, then set `EXPO_PUBLIC_API_URL=http://<that-ip>:8080/api` in `mobile\.env` and restart Expo.

### Step 4 — Build a real Android APK (optional)

```powershell
powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
```
This uses EAS Build (cloud). It will ask you to log in to Expo, then give you a download URL you can share with anyone.

---

## 📍 Where to find everything

| What you want to do | Open this file |
|---|---|
| Quick start (5 min) | this README |
| Production deployment (Render.com) | `DEPLOY.md` |
| Gmail SMTP setup | `EMAIL_SETUP.md` |
| 90 functional requirements (FRS) | `FRS_COMPLIANCE.md` |
| 80 non-functional requirements (NFRS) | `NFRS_COMPLIANCE.md` |
| Backend reference (per-controller) | `backend/README.md` |
| Web admin reference | `frontend/README.md` |
| Mobile app reference (every screen) | `mobile/README.md` |
| Database reference (every table) | `database/README.md` |
| MySQL schema | `database/schema.sql` |
| Environment variables | `.env.example` |
| Docker self-hosting | `docker-compose.yml` |
| Build an APK in one click | `build-apk.ps1` |
| Start backend with real Gmail | `start-backend-gmail.ps1` |
| Set Gmail env vars in current shell | `set-env-gmail.ps1` |
| Find your PC's local IP | `get-my-ip.ps1` |
| Test the email flow | `test-email.ps1` |
| Build the entire system | `build-all.ps1` |

---

## 👤 Default admin account

The system ships with **only one user** — the admin. No demo data, no fake patients, no fake doctors.

| Field | Value |
|---|---|
| **Email** | `admin@mtotocare.africa` |
| **Password** | `Admin123!` |
| **Where** | http://localhost:5173 → "Sign in" |

> 🔐 **Change the password** after the first login: Profile → Change Password. After saving you are returned to the login page (FR-007).

---

## 🧑‍🤝‍🧑 Add your first people and facilities

### Add the first parent
**Option A — via the mobile app (recommended for testing)**
1. Tap "Create Account" on the welcome screen
2. Fill name, email, phone, password, language
3. Pick a language (the app shows the next time in your language)
4. Add at least one child (you can add twins — each gets their own photo, blood group, weight, height — FR-016, FR-022)

**Option B — via the web admin**
1. Sign in as admin → **Users** in the sidebar → **+ Add user**
2. Fill name, email, password
3. Tick the **PARENT** role (plus any other roles)
4. Click **Save**
5. Every action is logged in the **Activity Log** (FR-015, NFR-023)

### Add the first doctor
1. Web admin → **Users** → **+ Add user**
2. Fill name, email, password
3. Tick the **DOCTOR** role
4. Click **Save** — a Doctor profile is created automatically, marked "on duty" by default
5. The doctor can now sign in on the mobile app and toggles their on-duty status from the provider dashboard
6. They appear in the **Book Appointment** screen for parents (FR-014, FR-021)

### Add the first facility
1. Web admin → **Facilities** → **+ Add facility**
2. Fill name, address, region, type
3. Click **Save**
4. The facility now appears in dropdowns when booking an appointment and on the doctor's profile

---

## 🪟 Run on Windows 10

The whole system is designed to run on Windows 10 from `C:\Users\Wilson\Desktop\mtotocare-africa\`.

You need **three PowerShell windows** open at the same time:

1. **Window 1** — backend (port 8080)
2. **Window 2** — web admin (port 5173)
3. **Window 3** — mobile / Expo (port 8081)

If your PC is at `192.168.96.168`, the Expo dev server detects it automatically and your phone can reach the backend at `http://192.168.96.168:8080/api`.

If the phone still can't connect:
- Make sure Windows Firewall allows port 8080 (`New-NetFirewallRule -DisplayName "MtotoCare" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow`)
- Make sure your phone is on the same Wi-Fi as the PC
- Run `get-my-ip.ps1` to confirm the IP
- Set `EXPO_PUBLIC_API_URL=http://<your-ip>:8080/api` in `mobile\.env`

---

## 🤖 Test the AI Assistant

1. Open the mobile app → tap the **💬 chat bubble** on the Home screen
2. Type "What food is good for my child?"
3. If you have set a `GROQ_API_KEY`, you'll see the answer stream in **real time** (word by word with a blinking cursor)
4. If you haven't, you'll get a fast safe answer from the backend's offline library
5. Turn on Airplane mode → ask the same question → the app shows a banner **"You're offline"** and answers from a local library that ships with the app (FR-055, FR-058, NFR-008, NFR-052)
6. Turn off Airplane mode → the banner disappears and the next question goes to the backend again

### Enable real Groq AI streaming (free)
1. Get a free key at https://console.groq.com/keys
2. In your backend shell, set `GROQ_API_KEY=gsk_...`
3. Restart the backend — AI chat now streams tokens in real time

---

## 📡 Test the offline mode

The mobile app has a full offline layer. Here's how to test it:

1. Open the app and sign in (or just leave it on the Home screen)
2. Turn on **Airplane mode** on your phone
3. The **offline banner** appears at the top of every tab: "You're offline. Your changes will be saved and sent when you reconnect."
4. Try to add a child, log a vaccination, or change your profile — the action is **queued in encrypted SecureStore**
5. Turn off Airplane mode → the banner briefly says "Syncing your changes..." then disappears
6. Open **Profile → Offline support** to see exactly what works offline and how many actions are still queued

> 🟢 The same flow works even if the backend is completely down (e.g. your laptop is closed). The queue is replayed the next time the app talks to a reachable backend.

---

## 📋 Test the Activity Log (audit)

1. Sign in as admin → click **Activity Log** in the sidebar
2. You'll see an empty state: "No activity yet. Once you or your team make changes, they will appear here."
3. Add a new user (Users → + Add user → fill form → Save)
4. Add a facility (Facilities → + Add facility → Save)
5. Edit a user's roles (Users → Edit roles → tick a new role → Save)
6. Refresh the Activity Log — every action is now listed with:
   - Friendly action badge (Created / Updated / Deleted / Activated / Deactivated / Reset / Role added / Role removed)
   - Who did it (your email)
   - What was changed (full details)
   - Where from (IP address)
   - When (timestamp)
7. Use the search box and the action filter chips to narrow down

---

## 📦 Production deployment (Render.com)

**Full step-by-step guide: `DEPLOY.md`.** The short version:

1. **Push to GitHub** — `git init && git add . && git commit && git push`
2. **Backend on Render.com** — New → Web Service, root `backend`, runtime Docker, env vars (DB, JWT, Gmail, Groq)
3. **Web on Render.com** — New → Static Site, root `frontend`, build `npm install --legacy-peer-deps && npm run build`, publish `dist`
4. **Android APK** — `eas build -p android --profile preview` (cloud build, no Android Studio needed)
5. **Share the APK** with parents via Drive, email, or WhatsApp

The full guide covers CORS, custom domains, iOS builds, push notifications, backups, and troubleshooting.

---

## ✉️ Optional: enable real Gmail emails

By default the backend runs in **EMAIL_SANDBOX=true** (emails are written to `backend/eml-outbox/*.eml` so you can open them in Outlook/Thunderbird without a real Gmail account).

To send real emails, follow `EMAIL_SETUP.md`:
1. Create a Gmail App Password at https://myaccount.google.com/apppasswords
2. Set `GMAIL_USER=you@gmail.com` and `GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxxx`
3. Set `EMAIL_SANDBOX=false`
4. Restart the backend
5. Run `test-email.ps1` to verify the password-reset flow

Or just double-click `start-backend-gmail.ps1` to do steps 2-4 in one go.

---

## 🧠 Optional: enable real Groq AI streaming

1. Sign up free at https://console.groq.com/keys
2. Copy your key (it starts with `gsk_...`)
3. In the backend terminal, set:
   ```powershell
   $env:GROQ_API_KEY = "gsk_your_key_here"
   ```
   Or add it to your `.env` file and re-source.
4. Restart the backend
5. The mobile AI chat now streams tokens in real time (type a question → see the answer appear word by word)

If you don't set a key, the backend uses a safe offline canned response library (so the app still works in dev / when offline).

---

## 🛟 Troubleshooting

| Problem | Fix |
|---|---|
| Backend says `Port 8080 already in use` | Find and kill the process: `netstat -ano \| findstr :8080` then `taskkill /PID <pid> /F` |
| Mobile app shows "Cannot reach backend" | Check `get-my-ip.ps1`; set `EXPO_PUBLIC_API_URL` in `mobile\.env`; open Windows Firewall for port 8080 |
| Admin login fails | The admin user is seeded only on first start with the dev profile. Re-run `mvn spring-boot:run -Dspring-boot.run.profiles=dev` |
| Audit log is empty | That's normal on a fresh install. Make a change (add a user, edit a role) and refresh. The activity log is in the web admin sidebar. |
| No doctors in Book Appointment | Add a doctor via the web admin (Users → + Add user → tick DOCTOR). The doctor profile is auto-created. |
| `npm install` fails with peer-dep errors | Always use `--legacy-peer-deps` (every README and script uses it) |
| Expo Go can't find the QR code | Make sure the phone is on the same Wi-Fi. Try `npx expo start --tunnel` as a last resort |
| Email goes to spam | Use a Gmail App Password (not your real password) and verify your Gmail address in Google Search Console |
| Mobile app crashes on first launch | Clear the Expo Go cache, or fully uninstall + reinstall. The first launch is guarded by a 5s safety timeout. |
| "Rate limited" toast | The API throttles anonymous callers at 60 req/min and authed callers at 600 req/min. Wait 60s and retry. |

---

## ⚙️ Configuration reference

### Backend environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | recommended | (none) | `dev` (H2) or `prod` (MySQL) |
| `DB_URL` | prod | — | MySQL JDBC URL, e.g. `jdbc:mysql://host:3306/mtotocare` |
| `DB_USERNAME` | prod | — | MySQL user |
| `DB_PASSWORD` | prod | — | MySQL password |
| `JWT_SECRET` | yes | (dev default) | 64+ char random string. Generate: `[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()` |
| `GMAIL_USER` | for emails | — | Your Gmail address |
| `GMAIL_APP_PASSWORD` | for emails | — | App password from https://myaccount.google.com/apppasswords |
| `EMAIL_SANDBOX` | optional | `true` (dev) | When `true`, emails are written to `backend/eml-outbox/` instead of sent |
| `GROQ_API_KEY` | optional | — | Get a free key at https://console.groq.com/keys |
| `AI_PROVIDER` | optional | auto | `groq` (default if key set) / `openai` / `mock` |
| `APP_BASE_URL` | for email links | `http://localhost:5173` | The URL parents see in reset-password emails |
| `RATE_LIMIT_ANON_RPM` | optional | `60` | Anonymous rate limit per IP per minute |
| `RATE_LIMIT_AUTH_RPM` | optional | `600` | Authenticated rate limit per user per minute |
| `UPLOAD_DIR` | optional | `./uploads` | Where profile photos and uploads are stored |
| `PORT` | optional | `8080` | HTTP port |

### Mobile environment variables (`mobile/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | The backend URL. If empty, Expo auto-detects from the dev-server host (e.g. `http://192.168.96.168:8080/api`) |

### Web environment variables (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | The backend URL. If empty, the web admin talks to the same host on port 8080 (e.g. `http://192.168.96.168:8080/api`) |

---

## 🧰 Tech stack

**Backend:** Spring Boot 2.7.18 · Java 21 · Spring Security · Spring Data JPA · Flyway · Lombok · MySQL 8 / H2 · JWT (jjwt) · Spring Mail · Springdoc OpenAPI · Bucket4j (rate limiting) · OpenPDF (certificates) · Apache POI (Excel)

**Mobile:** React Native 0.74.5 · Expo SDK 51 · TypeScript 5 · Expo Router 3.5 · Redux Toolkit 2 · React-i18next 14 · expo-secure-store · expo-local-authentication · expo-image-picker · expo-notifications · @react-native-async-storage/async-storage · @react-native-community/datetimepicker · @react-native-community/netinfo · React Native SVG · React Native Reanimated · React Native Gesture Handler · React Native Safe Area Context · Axios

**Web:** React 18.2 · Vite 5 · React Router 6 · Tailwind 3 · Recharts 2 · Axios · custom i18n (no external dep)

**AI:** OpenAI-compatible HTTP client → Groq (default) / OpenAI / Mock. Same code, swap URL + key.

**Email:** Gmail SMTP via `JavaMailSender`. Bilingual HTML templates in `EmailTemplates.java`.

---

## 📊 FRS & NFRS compliance

- **FRS:** 65 / 90 (72%) fully met — see `FRS_COMPLIANCE.md` for the full per-requirement audit
- **NFRS:** 51 / 80 (64%) fully met — see `NFRS_COMPLIANCE.md`

What's **fully** implemented (highlights):
- Full authentication + JWT + refresh + RBAC
- All CRUD for users, children, vaccinations, appointments, growth, nutrition, medical records
- AI Assistant with real Groq streaming + safe offline library
- Bilingual EN/SW across the entire UI
- Toast notifications replacing jarring alerts
- Twins get independent per-child data
- Email (Gmail SMTP) with bilingual templates
- Admin user creation with multi-role selection
- Clean splash without status bar
- Web admin with all the expected pages
- Offline mode (banner, queue, replay, local library)
- Activity Log (audit) with friendly action badges
- Rate limiting, password reset, change password redirects to login
- File upload (avatars, child photos, documents)
- PDF vaccination certificate + Excel/CSV exports
- Phone OTP (FR-003)
- Inactivity auto-logout (15 min on web, JWT expiry on mobile)

What is still **partial** (and why): see the gap tables in the two compliance docs. Most partial items are advanced growth charts (WHO Z-scores), full backup automation, and a few nice-to-have UI polish items.

---

## 📜 License

Proprietary. © 2026 MtotoCare Africa.

---

**Built with care for African families.** 🌍## 🌐 Languages

Every screen, button, error message, toast, and email is available in:

- 🇬🇧 **English** (default)
- 🇹🇿 **Kiswahili**

On mobile, switch at **Profile → Language**. On web, use the top-right toggle. The change is applied instantly across the entire app and persisted to the backend.

---

## 🏗 Architecture

```
┌─────────────────────┐  ┌─────────────────────┐
│   Mobile (Parent)   │  │   Web Admin         │
│  React Native       │  │  React + Vite       │
│  + Expo SDK 51      │  │  + Tailwind 3       │
│  + TypeScript       │  │  + Recharts         │
│  + Redux Toolkit    │  │                     │
│  + i18next          │  │  + i18n context     │
└──────────┬──────────┘  └──────────┬──────────┘
           │                        │
           │   HTTPS (JWT auth)     │
           └────────────┬───────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   Backend API          │
           │   Spring Boot 2.7.18   │
           │   Java 21 + Lombok     │
           │                        │
           │   • 146 endpoints      │
           │   • 25 controllers     │
           │   • JWT + refresh      │
           │   • Flyway migrations  │
           │   • Gmail SMTP         │
           │   • Groq AI client     │
           └────────────┬───────────┘
                        │  JDBC
                        ▼
           ┌────────────────────────┐
           │   MySQL 8 (prod)       │
           │   30 tables            │
           │   H2 (dev)             │
           └────────────────────────┘
```

---

## 📁 Folder layout

```
mtotocare-africa/
├── backend/                          Spring Boot API
│   ├── src/main/java/com/mtotocare/africa/
│   │   ├── admin/                    Admin endpoints
│   │   ├── ai/                       AI chat (Groq)
│   │   ├── allergy/                  Allergy CRUD
│   │   ├── analytics/                Reports
│   │   ├── anc/                      ANC visits
│   │   ├── appointment/              Appointment booking
│   │   ├── auth/                     Login, register, JWT
│   │   ├── child/                    Children CRUD
│   │   ├── common/                   ApiResponse, PageResponse, security utils, email, AI client
│   │   ├── config/                   SecurityConfig, DataInitializer (only seeds admin)
│   │   ├── consent/                  Consent management
│   │   ├── development/              Milestones
│   │   ├── device/                   Devices
│   │   ├── diagnosis/                Diagnosis CRUD
│   │   ├── doctor/                   Doctor list, availability
│   │   ├── emergency/                Emergency contacts
│   │   ├── exception/                Global error handling
│   │   ├── facility/                 Facility CRUD
│   │   ├── growth/                   Growth records
│   │   ├── medical/                  Health records
│   │   ├── medication/               Medication CRUD
│   │   ├── notification/             Push notifications
│   │   ├── nutrition/                Meal plans
│   │   ├── pregnancy/                Pregnancy tracking
│   │   ├── security/                 JWT filter, auth handlers
│   │   ├── sync/                     Offline sync
│   │   ├── user/                     User profile, CRUD, roles
│   │   └── vaccination/              EPI schedules, records
│   ├── src/main/resources/
│   │   ├── application.yml           Master config
│   │   ├── application-dev.yml       H2 + dev defaults
│   │   ├── application-prod.yml      MySQL + prod defaults
│   │   └── db/migration/             Flyway migrations V1–V13
│   └── pom.xml
│
├── frontend/                         Web admin
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api.js                    Axios client (auto-detects API URL)
│   │   ├── AuthContext.jsx
│   │   ├── i18n.jsx                  EN/SW language context
│   │   ├── components/
│   │   │   ├── Layout.jsx            Sidebar + top bar (with EN/SW toggle)
│   │   │   └── Toast.jsx             Toast notification system
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── ForgotPasswordPage.jsx
│   │       ├── ResetPasswordPage.jsx
│   │       ├── ProfilePage.jsx
│   │       ├── admin/                Dashboard, Users (with Add User), Facilities, Audit
│   │       └── provider/             Dashboard, Patients, PatientDetail, Appointments
│   └── package.json
│
├── mobile/                           Parent app (React Native + Expo)
│   ├── app/                          Expo Router pages (52 screens)
│   │   ├── (auth)/                   login, register, welcome, forgot-password, reset-password, add-your-child, get-started, choose-language
│   │   ├── (tabs)/                   home, records, reminders, profile (with floating [+] center button)
│   │   ├── (admin)/                  admin dashboard, users, facilities, audit, settings, sync, profile
│   │   ├── (provider)/               provider dashboard, patients, patient-detail, appointments, profile
│   │   ├── growth.tsx, growth/add.tsx
│   │   ├── nutrition.tsx
│   │   ├── vaccinations.tsx
│   │   ├── ai-chat.tsx
│   │   ├── appointments.tsx, appointments/book.tsx
│   │   ├── children/index.tsx, children/[id].tsx, children/add.tsx
│   │   ├── notifications.tsx
│   │   ├── medical-records.tsx
│   │   ├── profile/edit.tsx, change-password.tsx, language.tsx, help.tsx, privacy.tsx, about.tsx
│   │   ├── offline.tsx
│   │   ├── choose-language.tsx       shown after register
│   │   ├── index.tsx                 auth-aware entry redirect
│   │   ├── welcome.tsx               first-launch
│   │   └── _layout.tsx               root providers (Redux, I18n, Theme, Toast)
│   ├── src/
│   │   ├── api/                      axios client + endpoints (84 calls)
│   │   ├── i18n/                     en.json + sw.json, LanguageContext
│   │   ├── store/                    Redux Toolkit slices
│   │   ├── theme/                    ThemeProvider
│   │   ├── components/               Button, Input, Card, EmptyState, Toast
│   │   └── utils/                    storage (SecureStore), validation, biometric, date
│   ├── android/                      Android Gradle config (splash, themes, manifest)
│   ├── ios/
│   ├── app.json                      Expo config (scheme: mtotocare)
│   ├── eas.json                      EAS Build profiles
│   ├── .env                          EXPO_PUBLIC_API_URL (optional)
│   └── package.json
│
├── database/                         SQL reference
│   ├── schema.sql                    MySQL production schema (30 tables)
│   ├── seed-data.sql                 Admin-only seed
│   ├── TABLES_REFERENCE.md           Schema documentation
│   └── README.md
│
├── docs/
│   └── design_reference.jpeg         Visual design reference
│
├── DEPLOY.md                         ⭐ Production deployment guide
├── EMAIL_SETUP.md                    Gmail SMTP setup
├── README.md                         ← you are here
│
├── backend/README.md                 Backend reference
├── frontend/README.md                Frontend reference
├── mobile/README.md                  Mobile reference
├── database/README.md                Database reference
│
├── build-all.ps1                     Build everything script
├── build-apk.ps1                      One-click APK build (EAS)
├── start-backend-gmail.ps1            Start backend with Gmail creds
├── set-env-gmail.ps1                  Set env vars
├── get-my-ip.ps1                      Find your local IP
└── test-email.ps1                     Test email script
```

---

## ⚙️ Configuration

| Where | What | Default |
|---|---|---|
| `backend/src/main/resources/application.yml` | Master config (JWT secret, CORS, port) | dev defaults |
| `backend/src/main/resources/application-dev.yml` | H2 + dev defaults | in-memory DB |
| `backend/src/main/resources/application-prod.yml` | MySQL + prod defaults | needs env vars |
| `mobile/app.json` | Expo config (name, icon, splash, perms) | — |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` (optional override) | auto-detect from Expo host |
| `mobile/eas.json` | EAS Build profiles (preview, production) | — |
| `frontend/.env` | `VITE_API_URL` (auto-detected from hostname) | — |

### Production environment variables (backend)

| Variable | Required | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | yes | `prod` |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | yes | MySQL connection |
| `JWT_SECRET` | yes | 64+ char random string |
| `GMAIL_USER` | for emails | Your Gmail address |
| `GMAIL_APP_PASSWORD` | for emails | App password from myaccount.google.com/apppasswords |
| `GROQ_API_KEY` | optional | For real AI (otherwise safe offline fallback) |
| `AI_PROVIDER` | optional | `groq` (default if key set) / `openai` / `mock` |
| `EMAIL_SANDBOX` | optional | `false` in prod; `true` writes emails to `./eml-outbox/` |
| `APP_BASE_URL` | for email links | `https://your-web.onrender.com` |

---

## 🛠 Tech stack

**Backend:** Spring Boot 2.7.18 · Java 21 · Spring Security · Spring Data JPA · Flyway · Lombok · MySQL 8 / H2 · JWT (jjwt) · Spring Mail · Springdoc OpenAPI · Bucket4j (rate limiting)

**Mobile:** React Native 0.74.5 · Expo SDK 51 · TypeScript 5 · Expo Router 3.5 · Redux Toolkit 2 · React-i18next 14 · expo-secure-store · expo-local-authentication · expo-image-picker · expo-notifications · @react-native-async-storage/async-storage · @react-native-community/datetimepicker · React Native SVG · React Native Reanimated · React Native Gesture Handler · React Native Safe Area Context · Axios

**Web:** React 18.2 · Vite 5 · React Router 6 · Tailwind 3 · Recharts 2 · Axios · react-i18next (custom built-in)

**AI:** OpenAI-compatible HTTP client → Groq (default) / OpenAI / Mock. Same code, swap URL + key.

**Email:** Gmail SMTP via `JavaMailSender`. Bilingual HTML templates in `EmailTemplates.java`.

---

## 📊 What's where

### Mobile features
- **Tab bar:** `Home | Records | [+] | Reminders | Profile`
  - **[+]** center: tap = Book Appointment, long-press = Add Child
- **Language:** Profile → Language → EN / SW → entire app re-renders instantly
- **AI Assistant:** real LLM (Groq Llama 3.3 70B) with safe offline fallback
- **Biometric login:** Profile → Fingerprint/Face ID → next time, sign in with a tap
- **Splash:** fullscreen green, no system status bar
- **Notifications:** real-time push via Expo
- **Twins:** each child has their own photo, blood group, weight, height
- **Growth charts:** visual history per child
- **Vaccinations:** Tanzania EPI schedule with overdue alerts
- **AI nutrition plans:** generated from child's age and profile

### Web admin features
- **Language:** top-right toggle (🇬🇧 EN / 🇹🇿 SW)
- **Manage Users:** add new users with role selection, edit roles, activate/deactivate
- **Manage Facilities:** full CRUD
- **Patient management:** view all patients, full health records per child
- **Appointments:** confirm, start, complete, cancel
- **Audit logs:** every state change tracked
- **Reports:** system-wide analytics with charts
- **Settings:** app preferences, system config

### Backend
- **146 REST endpoints** across **25 controllers**
- **JWT auth** with refresh token rotation
- **Gmail SMTP** for real emails (welcome + password reset, bilingual EN/SW)
- **Groq AI** for the assistant (free, no credit card, falls back to safe canned responses)
- **Flyway migrations** for schema versioning
- **SecurityConfig:** `/auth/**` is public, everything else requires JWT
- **Pagination** on all list endpoints
- **Error handling** with stable error codes (USER_NOT_FOUND, EMAIL_EXISTS, etc.)

### Database
- **30 tables**, all referenced by JPA entities
- **MySQL** for production, **H2** for dev (auto-created on first start)
- **Only admin is seeded** — everything else is created by users
- **Flyway migrations V1–V13** track schema changes

---

## 🧪 Verified

- ✅ Backend compiles (`mvn clean package -DskipTests` → BUILD SUCCESS)
- ✅ Frontend builds (`npm run build` → ✓ built in 4.5s)
- ✅ Mobile bundle compiles (`npx expo export --platform android` → 4.19 MB Hermes bytecode)
- ✅ 46/46 mobile API endpoints tested against running backend
- ✅ All demo data removed — only `admin@mtotocare.africa` is seeded
- ✅ Splash screen fullscreen, no system status bar
- ✅ Real AI Assistant wired (Groq API + offline fallback)
- ✅ Real biometric login (SecureStore + LocalAuthentication)
- ✅ Real bilingual UI (EN / SW, instant re-render on language change)
- ✅ All `Alert.alert` and `alert()` replaced with user-friendly toasts
- ✅ Mobile has 5-slot tab bar with floating [+] center button
- ✅ Twins get their own per-child fields (photo, blood, weight, height)
- ✅ Change password redirects to login
- ✅ Admin can create users with multi-role selection
- ✅ Non-admin users get 403 on admin endpoints (verified)

---

## 📜 License

Proprietary. © 2026 MtotoCare Africa.

---

**Built with care for African families.** 🌍
# mtotocare-backend
