# MtotoCare Africa — Production Deployment Guide

This guide takes you from a fresh download to a live, installable Android app.
Estimated time: **45–90 minutes** if you've never deployed before.

## What you'll have at the end

- **Live backend** at `https://mtotocare-backend.onrender.com` (HTTPS, free tier)
- **Live web admin** at `https://mtotocare-web.onrender.com`
- **Installable Android APK** (`.apk` file) you can sideload on any phone
- **Web version** that works in any browser
- **One admin account** to log into the web admin portal
- **Zero demo data** — the first person to install the app and register is the first parent

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Deploy the backend to Render.com](#2-deploy-the-backend-to-rendercom)
3. [Deploy the web admin to Render.com](#3-deploy-the-web-admin-to-rendercom)
4. [Get your live backend URL](#4-get-your-live-backend-url)
5. [Update the mobile app config](#5-update-the-mobile-app-config)
6. [Build the Android APK](#6-build-the-android-apk)
7. [Install the APK on your phone](#7-install-the-apk-on-your-phone)
8. [Create the first doctor and facility](#8-create-the-first-doctor-and-facility)
9. [Share the app with parents](#9-share-the-app-with-parents)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

You need:

- **GitHub account** (free) — https://github.com
- **Render.com account** (free) — https://render.com
- **Expo account** (free) — https://expo.dev (for building the APK)
- **Git** installed on your PC — https://git-scm.com
- The contents of the `mtotocare-africa.zip` you downloaded

You do **NOT** need:
- A custom domain (free subdomain is fine)
- A paid Render plan (free tier works)
- A Mac (you can build the APK from Windows)

---

## 2. Deploy the backend to Render.com

### 2.1 Push the project to GitHub

```powershell
cd C:\Users\Wilson\Desktop\mtotocare-africa
git init
git add .
git commit -m "Initial MtotoCare Africa"
# Create a new empty repo at https://github.com/new (name: mtotocare-africa, private)
git remote add origin https://github.com/YOUR_USERNAME/mtotocare-africa.git
git branch -M main
git push -u origin main
```

### 2.2 Create a PostgreSQL database on Render

1. Log in to https://render.com
2. Click **New +** → **PostgreSQL**
3. Settings:
   - **Name:** `mtotocare-db`
   - **Region:** Frankfurt (or closest to your users)
   - **Plan:** Free
4. Click **Create Database**
5. Wait ~1 minute for it to provision
6. Copy the **Internal Database URL** — looks like `postgresql://mtotocare_db_user:xxxxx@dpg-xxxxx.frankfurt-postgres.render.com/mtotocare_db`

### 2.3 Create the backend service

1. Click **New +** → **Web Service**
2. Click **Connect a repository** → select `mtotocare-africa`
3. Settings:
   - **Name:** `mtotocare-backend`
   - **Region:** same as the database
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Plan:** Free
4. Click **Advanced** and add these environment variables:

| Key | Value |
|-----|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | paste the Internal Database URL from step 2.2 |
| `DB_USERNAME` | the username from the URL (e.g. `mtotocare_db_user`) |
| `DB_PASSWORD` | the password from the URL |
| `DB_DRIVER` | `org.postgresql.Driver` |
| `JPA_DIALECT` | `org.hibernate.dialect.PostgreSQLDialect` |
| `JPA_DDL_AUTO` | `validate` |
| `FLYWAY_ENABLED` | `true` |
| `JWT_SECRET` | generate a random 64-char string |
| `GMAIL_USER` | `georgegibosi850@gmail.com` |
| `GMAIL_APP_PASSWORD` | `wokl rurf xblg nrnc` |
| `MAIL_FROM` | `georgegibosi850@gmail.com` |
| `MAIL_REPLY_TO` | `georgegibosi850@gmail.com` |
| `MAIL_FROM_NAME` | `MtotoCare Africa` |
| `APP_BASE_URL` | leave blank for now (fill in after web deploys) |
| `EMAIL_SANDBOX` | `false` |

5. Click **Create Web Service**
6. Wait ~3-5 minutes for the first build. Watch the logs.
7. **Copy the URL** at the top (e.g. `https://mtotocare-backend.onrender.com`)

> **Note about free tier:** Render's free Postgres expires after 90 days. For production,
> upgrade to the $7/month plan or use a different provider (Railway, Supabase, Neon).

### 2.4 Test the backend

```powershell
curl https://mtotocare-backend.onrender.com/api/auth/health
```
You should see:
```json
{"success":true,"message":"Auth service is running","data":"OK"}
```

### 2.5 Run database migrations

The first time the backend starts, it will run Flyway migrations automatically.
After ~30 seconds, verify the data is seeded:

```powershell
# Login as admin
curl -X POST https://mtotocare-backend.onrender.com/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"admin@mtotocare.africa\",\"password\":\"Admin123!\"}'
```

You should get a JWT token back. **CHANGE THE ADMIN PASSWORD** immediately (use the web admin once it's deployed).

---

## 3. Deploy the web admin to Render.com

### 3.1 Create the web service

1. Click **New +** → **Static Site**
2. Connect the same GitHub repo
3. Settings:
   - **Name:** `mtotocare-web`
   - **Branch:** main
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Click **Advanced** and add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://mtotocare-backend.onrender.com/api` |

5. Click **Create Static Site**
6. Wait ~2-3 minutes. Get the URL (e.g. `https://mtotocare-web.onrender.com`)

### 3.2 Update CORS in the backend

Go back to your backend service on Render:
1. **Environment** tab → edit `MTOTOCARE_CORS_ALLOWED_ORIGINS` or add it:
   - `MTOTOCARE_CORS_ALLOWED_ORIGINS=https://mtotocare-web.onrender.com,http://localhost:5173`
2. Save — this redeploys the backend (~2 min)

### 3.3 Test the web

Open `https://mtotocare-web.onrender.com/login` in your browser. Log in with:
- **Email:** `admin@mtotocare.africa`
- **Password:** `Admin123!`

You should land on the admin dashboard.

---

## 4. Get your live backend URL

You now have:
- **Backend API:** `https://mtotocare-backend.onrender.com/api`
- **Web admin:** `https://mtotocare-web.onrender.com`

Test:
```powershell
curl https://mtotocare-backend.onrender.com/api/auth/health
```

---

## 5. Update the mobile app config

### 5.1 Edit `mobile/.env`

Open `C:\Users\Wilson\Desktop\mtotocare-africa\mobile\.env` in Notepad. Set:

```
EXPO_PUBLIC_API_URL=https://mtotocare-backend.onrender.com/api
```

### 5.2 Edit `mobile/app.json`

Open `mobile/app.json` and update the `extra.apiUrl` and `extra` blocks:

```json
"extra": {
  "apiUrl": "https://mtotocare-backend.onrender.com/api",
  "env": "production"
}
```

### 5.3 Edit `mobile/eas.json`

Create the file `mobile/eas.json` (it doesn't exist yet):

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### 5.4 Push the changes

```powershell
cd C:\Users\Wilson\Desktop\mtotocare-africa
git add mobile/.env mobile/app.json mobile/eas.json
git commit -m "Point mobile to production backend"
git push
```

---

## 6. Build the Android APK

This uses Expo's cloud build service. You do **NOT** need Android Studio.

### 6.1 Install EAS CLI

```powershell
npm install -g eas-cli
```

### 6.2 Log in to Expo

```powershell
cd C:\Users\Wilson\Desktop\mtotocare-africa\mobile
eas login
```

(Use your Expo account email + password.)

### 6.3 Configure the build

```powershell
eas build:configure
```

When prompted, choose **Android**.

### 6.4 Build the APK

```powershell
eas build -p android --profile preview
```

This takes **~10-20 minutes** the first time. The output will be a URL like:
```
https://expo.dev/artifacts/eas/xxxxx.apk
```

Save this URL. You can also see the build status at https://expo.dev/accounts/YOUR_USERNAME/projects/mtotocare-africa/builds

### 6.5 Download the APK

Click the URL from the build output, or go to the build page and click **Download**.
The file is ~30-50 MB.

---

## 7. Install the APK on your phone

### 7.1 Transfer the APK

Pick any method:
- **Email** the download link to yourself, open on phone
- **Google Drive** — upload APK, download on phone
- **USB cable** — copy to phone's Downloads folder
- **Telegram/WhatsApp** — send to yourself

### 7.2 Enable "Install unknown apps"

On your Android phone:
1. **Settings** → **Apps** → **Special app access** → **Install unknown apps**
2. Find the app you'll install from (Chrome, Drive, Files) → **Allow**

### 7.3 Install

1. Open the APK file on the phone
2. Tap **Install**
3. Wait ~10 seconds
4. Tap **Open** — the **MtotoCare** app appears in your launcher

### 7.4 First launch

1. Tap **Create Account**
2. Enter your name, email, password
3. You'll get a welcome email at the address you used
4. The app lands on the Home screen with "No child added yet" — tap **Add Your Child**

---

## 8. Create the first doctor and facility

The app ships with **only the admin user** in the database. You need to add a doctor and a facility before parents can book appointments.

### 8.1 Log into the web admin

Open `https://mtotocare-web.onrender.com/login` on your computer, log in as admin.

### 8.2 Add a facility

1. Click **Facilities** in the sidebar
2. Click **+ Add Facility**
3. Fill in: name (e.g. "Amana Hospital"), type, address, region, phone
4. Click **Save**

### 8.3 Add a doctor

1. Click **Users** in the sidebar
2. Click **+ Add User**
3. Fill in: name, email, password
4. **Roles:** tick `DOCTOR` (and `PARENT` so they can also use the mobile app)
5. Click **Save**

A Doctor profile is automatically created and the user appears in the parent's "Book Appointment" screen.

### 8.4 Add more admins (optional)

1. **Users** → **+ Add User**
2. Name, email, password
3. Roles: tick `ADMIN`
4. Save

---

## 9. Share the app with parents

### 9.1 Host the APK for download

Upload the `.apk` file to:
- Google Drive (right-click → Share → copy link)
- Dropbox
- Your own web server

Send the download link via SMS, WhatsApp, or in person.

### 9.2 Web alternative

Parents can also use the app in any browser at:
```
https://mtotocare-web.onrender.com
```

The web version has the same features as the mobile app.

### 9.3 Onboarding message template

```
Habari! MtotoCare Africa is now available — a free app to track your
children's vaccinations, growth, and book doctor appointments.

Download: [LINK_TO_APK]
Web version: https://mtotocare-web.onrender.com

Create an account with your email and start adding your children.
```

---

## 10. Troubleshooting

### "Email is in real but doesn't work" / emails not landing

- Check the backend logs on Render → look for `Email SENT via Gmail SMTP`
- If you see `Authentication failed`, the Gmail App Password is wrong. Create a new one at https://myaccount.google.com/apppasswords
- First-time Gmail sends go to **Spam**. Tell users to check spam and mark as "Not spam"
- The `from` address MUST match the `GMAIL_USER`. If they differ, Gmail rejects the email

### App can't connect to backend

- Open the app, shake the phone, tap **Open JS Debugger** (or open `http://localhost:8081/debug` in Chrome via `adb`)
- Look at network errors. Most common: `cleartext HTTP not permitted` (Android blocks HTTP by default in release builds — your URL must be HTTPS, which `onrender.com` is)
- Verify `.env` has `EXPO_PUBLIC_API_URL=https://mtotocare-backend.onrender.com/api` (with `https://`, not `http://`)

### "No doctors available" when booking

The app needs at least one Doctor in the database. Log into the web admin → Users → add a user with role `DOCTOR`.

### "Cannot connect to backend" on web

- Open browser DevTools (F12) → Network tab → try logging in
- Look for CORS errors. The backend's `MTOTOCARE_CORS_ALLOWED_ORIGINS` must include your web URL
- Verify the backend URL ends with `/api` (e.g. `https://mtotocare-backend.onrender.com/api`)

### Render free tier sleeps

Free Render web services **spin down after 15 minutes of inactivity**. The first request after that takes ~30-60 seconds. This is normal. Upgrade to a paid plan to avoid this.

### "Schema validation failed" on backend startup

The Flyway migrations don't match the database state. Solution:
1. Render dashboard → your PostgreSQL → **Shell**
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. The backend will recreate everything on next deploy

### APK build fails

- Run `eas build -p android --profile preview --clear-cache`
- Check the build log at https://expo.dev
- Common cause: SDK version mismatch. Make sure `mobile/package.json` has `"expo": "~51.0.0"`

### "I forgot the admin password"

Connect to your Render PostgreSQL:
1. Render → Database → **Shell**
2. Run this SQL to reset the admin password to `Admin123!`:
   ```sql
   UPDATE users SET password_hash = '$2a$12$NEW_BCRYPT_HASH' WHERE email = 'admin@mtotocare.africa';
   ```
3. To generate a new BCrypt hash, run this in the backend directory locally:
   ```powershell
   mvn spring-boot:run
   # in another terminal:
   curl -X POST http://localhost:8080/api/auth/forgot-password -H "Content-Type: application/json" -d '{"email":"admin@mtotocare.africa"}'
   ```
4. Or simpler: just delete the user and re-seed:
   ```sql
   DELETE FROM users WHERE email = 'admin@mtotocare.africa';
   ```
   Then restart the backend — `DataInitializer` re-seeds the admin.

---

## What's next?

- **Custom domain:** In Render → Settings → Custom Domain. ~$12/year.
- **iOS build:** Run `eas build -p ios --profile production`. Need an Apple Developer account ($99/year).
- **Push notifications:** Set up Firebase Cloud Messaging, wire into `NotificationService`.
- **SMS reminders:** Set up Africa's Talking, add a `SmsService` mirroring `EmailService`.
- **Audit logs:** Add an `@Aspect` that logs every state change to an `audit_logs` table.
- **Backups:** Render's free Postgres doesn't auto-backup. Upgrade to $7/month for daily snapshots.

---

**Built with:**
- Spring Boot 2.7.18 + Java 21
- React 18 + Vite 5 + Tailwind 3
- React Native + Expo SDK 51
- PostgreSQL (prod) / H2 (dev)
- Gmail SMTP for real emails
- Render.com for hosting
- EAS Build for the Android APK
