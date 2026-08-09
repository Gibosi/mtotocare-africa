# MtotoCare Africa – Offline-First Implementation

**Version:** 1.0
**Date:** July 2026
**Status:** ✅ Complete

This document describes the offline-first frontend implementation that implements the architecture specified in the "Complete Online & Offline Frontend Flow" document.

---

## 1. Architecture Overview

The implementation follows the documented 3-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                  Flutter Application (RN here)              │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   UI Layer     │  │ Business Layer │  │  Data Layer  │  │
│  │  (Screens)     │  │  (Services)    │  │ (Repository)  │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                              │              │
│                    ┌─────────────────────────┴──────┐       │
│                    ▼                                  ▼       │
│         ┌──────────────────┐              ┌──────────────┐   │
│         │ Remote Data       │              │ Local Data    │   │
│         │ Source (REST API) │              │ Source (SQLite)│   │
│         └──────────────────┘              └──────────────┘   │
│                    ▲                                  ▲       │
│                    └──────── Sync Manager ─────────────┘       │
│                                  │                            │
│                       Connectivity Monitor                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Implementation Files

### 2.1 Database Layer (`src/database/`)

| File | Purpose |
|------|---------|
| `schema.ts` | SQLite schema definitions (15 tables) |
| `index.ts` | Database service + generic repository helpers |

**Tables created (matches backend MySQL):**
- `users`, `children`, `vaccinations`, `vaccination_schedule`
- `growth_records`, `nutrition_plans`, `health_records`
- `appointments`, `notifications`, `ai_conversations`
- `sync_queue` (offline action queue)
- `file_upload_queue` (deferred uploads)
- `health_library` (AI offline articles)
- `schema_metadata` (migration tracking)

### 2.2 Services Layer (`src/services/`)

| File | Implements Flow Step |
|------|---------------------|
| `connectivity.ts` | "Check Internet Connection" + Continuous monitoring |
| `offlineAuth.ts` | ONLINE: "Validate JWT" / OFFLINE: "Read Secure Storage" |
| `syncManager.ts` | "Synchronization Service" - runs every 5 min + on internet restored |
| `syncQueue.ts` | "Offline Queue" - Save Local → sync_queue → upload on reconnect |
| `repository.ts` | Module repositories with "Load Local → Background API → Update" pattern |
| `aiOfflineLibrary.ts` | "AI → Offline Health Library → Search → Display Articles" |
| `appInitializer.ts` | Wires everything together (called once on app start) |

### 2.3 Components (`src/components/`)

| File | Purpose |
|------|---------|
| `OfflineBanner.tsx` | Shows "You are offline" warning + sync status chip |
| `AIChatScreen.tsx` | Enhanced AI chat with online/offline fallback |

---

## 3. Flow Implementation Map

### 3.1 App Launch → Initialization

```
User Opens App
  ↓
Splash Screen (2-3 sec) → app/index.tsx
  ↓
appInitializer.initialize()
  ├── 1. Database init → 15 tables created
  ├── 2. Connectivity monitor → starts NetInfo subscription
  ├── 3. AI offline library → seeds 10 health articles
  ├── 4. Sync manager → starts 5-min interval + internet listener
  └── 5. Auth init → check JWT, validate, load user
  ↓
Dashboard (Home)
```

**Code:** `app/index.tsx`

### 3.2 Online Initialization

```
Check Server Status (via /users/me)
  ├── Yes → Validate JWT → Download all data → Dashboard
  └── No  → Fallback to offline mode
```

**Code:** `src/services/offlineAuth.ts → onlineInit()`

### 3.3 Offline Initialization

```
Read Secure Storage
  ├── JWT Exists → Load cached user → Dashboard (Offline)
  └── No JWT → "No previous login" → Welcome Screen
```

**Code:** `src/services/offlineAuth.ts → offlineInit()`

### 3.4 Module Flow (e.g., Child)

**ONLINE:**
```
Open Child → Load Local Data (instant) → Background API Request
  → New Data? → Update Local DB → Refresh UI
```

**OFFLINE:**
```
Open Child → Read Local Database → Display Cached Information
```

**Code:** `src/services/repository.ts → ChildrenRepository`

### 3.5 Sync Service (Runs Every 5 Min or on Internet Restored)

```
1. Authentication (refresh if needed)
2. Read Sync Queue → Upload Pending Changes
3. Download Latest Data
4. Compare Versions → Resolve Conflicts
5. Update Local Database
6. Notify User
```

**Code:** `src/services/syncManager.ts → runSync()`

### 3.6 Conflict Resolution

```
Server Version vs Local Version
  ├── Same → Ignore
  └── Different → Compare Timestamps → Latest Wins
       ↓
  Audit Log
       ↓
  Update Local DB
```

> Note: For medical records, a stricter policy can be applied (server always wins, requires validation).

**Code:** `src/services/syncManager.ts → downloadLatest()`

### 3.7 Logout Flow

```
Logout
  ├── Delete JWT
  ├── Delete Refresh Token
  ├── Delete Secure Storage
  ├── Delete Local Database (clinical data)
  ├── Delete Queue
  ├── Delete Cached Files
  └── Return Welcome Screen
```

**Code:** `src/services/offlineAuth.ts → logout()`

> Per spec: "clearing local clinical data on logout is generally the safer approach" for healthcare systems.

### 3.8 AI Assistant (Online vs Offline)

**ONLINE:**
```
Question → POST /api/ai/chat → Backend AI → Response
  → Save to local ai_conversations
  → Cache for offline reuse
```

**OFFLINE:**
```
Question → Search local health_library
  → Match by keyword/category
  → Display articles (📚 badge shows offline source)
```

**Code:** `src/components/AIChatScreen.tsx` + `src/services/aiOfflineLibrary.ts`

### 3.9 Offline Queue

```
User Updates Profile (No Internet)
  ↓
Save to Local DB (dirty=1)
  ↓
INSERT INTO sync_queue (status='PENDING')
  ↓
[Wait for internet...]
  ↓
Sync triggered
  ↓
Item status: PENDING → UPLOADING → UPLOADED → DELETE
```

**Code:** `src/services/syncQueue.ts`

---

## 4. Module Data Availability (per spec)

| Module | Online | Offline |
|--------|:------:|:-------:|
| Authentication (existing session) | ✅ | ✅ |
| Child Profiles | ✅ | ✅ |
| Vaccination History | ✅ | ✅ |
| Growth Records | ✅ | ✅ |
| Nutrition Plans | ✅ | ✅ |
| Medical History | ✅ | ✅ |
| Prescriptions | ✅ | ✅ |
| Allergies | ✅ | ✅ |
| Appointment History | ✅ | ✅ |
| Upcoming Appointments | ✅ | ✅ |
| Book/Cancel Appointments | ✅ | ❌ |
| AI Chat (full) | ✅ | ❌ (Health Library instead) |
| Health Library | ✅ | ✅ |
| Notifications (cached) | ✅ | ✅ |
| Push Notifications | ✅ | ❌ |
| Profile Updates | ✅ | ✅ (queued) |
| Document Uploads | ✅ | Queued |

---

## 5. Synchronization Triggers

1. **App login** → Full sync
2. **Periodic timer** → Every 5 minutes (if online)
3. **Internet restored** → Delayed sync (2 sec) to ensure stable connection
4. **Manual** → `syncManager.syncNow()` from any screen
5. **After write** → Item enters queue, will sync on next trigger

---

## 6. Key Design Decisions

### 6.1 React Native + Expo Instead of Flutter
The spec mentions Flutter, but since we already built 23 React Native screens, we used:
- `expo-sqlite` instead of Drift (same SQLite underneath)
- `AsyncStorage` for sync queue
- `expo-secure-store` for tokens (encrypted)
- `@react-native-community/netinfo` for connectivity

### 6.2 Lazy Loading Repositories
Each module has its own repository that:
- Reads from local DB first (instant response)
- Triggers background sync
- Queues writes if offline
- The UI never blocks waiting for network

### 6.3 AI Offline Library
Pre-seeded with 10 health articles (English + Swahili) covering:
- Fever management
- Nutrition
- Vaccinations (Tanzania EPI)
- Dehydration
- Breastfeeding
- Emergency signs
- Growth monitoring
- Common childhood illnesses

### 6.4 Smart Logout
Per spec, healthcare apps should clear all local clinical data on logout to prevent data leakage. Our implementation:
- Clears secure storage (tokens)
- Clears all local database tables
- Clears sync queue
- Clears file upload queue
- Clears AI conversations (privacy)

---

## 7. File Summary

```
mobile/src/
├── database/                     # Local SQLite layer
│   ├── schema.ts                 # 15 tables
│   └── index.ts                  # DB service + helpers
├── services/                     # Business logic
│   ├── connectivity.ts           # NetInfo monitor
│   ├── offlineAuth.ts            # Auth (online + offline)
│   ├── syncManager.ts            # Orchestrator
│   ├── syncQueue.ts              # Action queue
│   ├── repository.ts              # Module repos
│   ├── aiOfflineLibrary.ts       # Cached health articles
│   └── appInitializer.ts         # Wire-up
└── components/
    ├── OfflineBanner.tsx         # Status banner
    └── AIChatScreen.tsx          # Enhanced AI chat
```

**Total new files:** 10
**Total new TypeScript lines:** ~1,500

---

## 8. Testing Scenarios

### 8.1 Critical Paths
1. ✅ Cold start online → home screen with data
2. ✅ Cold start offline with cached JWT → home screen with cached data
3. ✅ Cold start offline without JWT → welcome screen
4. ✅ Open app with airplane mode → offline banner shows
5. ✅ Turn off airplane mode → auto-sync triggered within 2 sec
6. ✅ Make a change offline → queued in sync_queue
7. ✅ Go online → queued item uploads automatically
8. ✅ Logout → all local data cleared

### 8.2 Edge Cases
- Network drops mid-sync → failed items re-queued with attempt count
- Token expired → 401 interceptor attempts refresh, falls back to login
- Conflict: same record modified locally + server → latest wins
- File upload failure → kept in file_upload_queue for retry

---

## 9. Future Enhancements

- **Wearable sync** (Fitbit, Apple Watch) via HealthKit/Google Fit
- **Peer-to-peer sync** for offline clinic use
- **Background fetch** (iOS BGAppRefreshTask) for periodic sync
- **Conflict resolution UI** for manual review of medical records
- **Optimistic UI** with rollback on sync failure

---

**Status:** ✅ Architecture fully implemented
**Lines of code added:** ~1,500
**Tables:** 15 (matches backend)
**Offline capability:** Full read + queue-based write
