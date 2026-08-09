# MtotoCare Africa – User Flow Document

**Version:** 1.0
**Date:** July 2026
**Source:** Design mockup + implementation
**Status:** Complete

---

## 1. Overview

This document describes all user flows in the MtotoCare Africa mobile application, derived from the design mockup and implemented in the codebase. Each flow includes:
- **Trigger** – what starts the flow
- **Steps** – the screens and actions involved
- **Outcomes** – success and failure paths
- **Edge cases** – special scenarios

---

## 2. Application Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    App Launch                                │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  index.tsx (Splash)                          │
│         Auth check via SecureStore                          │
└──────┬──────────────────────────────────────┬───────────────┘
       │ Authenticated                        │ Not Authenticated
       ▼                                      ▼
┌──────────────────┐                ┌──────────────────┐
│  (tabs)/home     │                │  (auth)/welcome  │
│  Main App        │                │  Onboarding      │
└──────────────────┘                └──────────────────┘
```

---

## 3. Onboarding Flow (First-Time User)

### 3.1 Visual Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│                 │     │                 │     │                  │
│    Welcome      │────►│  Get Started    │────►│  Add Your Child  │
│   (auth)/       │     │  (auth)/        │     │   (auth)/        │
│   welcome       │     │  get-started    │     │  add-your-child  │
│                 │     │                 │     │                  │
│ • Logo          │     │ • Illustration  │     │ • Photo upload   │
│ • Tagline       │     │ • "Let's get    │     │ • Name input     │
│ • 6 Features    │     │   started"      │     │ • DOB picker     │
│ • Get Started   │     │ • Create        │     │ • Gender select  │
│ • Login link    │     │   Account       │     │ • Save button    │
│                 │     │ • Login link    │     │                  │
└─────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                          │
                                                          ▼
                                            ┌──────────────────────┐
                                            │                      │
                                            │   Choose Language    │
                                            │   (auth)/             │
                                            │   choose-language     │
                                            │                      │
                                            │ • English             │
                                            │ • Kiswahili           │
                                            │ • Kikuyu              │
                                            │ • Continue button     │
                                            │                      │
                                            └──────────┬───────────┘
                                                       │
                                                       ▼
                                            ┌──────────────────────┐
                                            │                      │
                                            │   (tabs)/home         │
                                            │   Main Dashboard      │
                                            │                      │
                                            └──────────────────────┘
```

### 3.2 Detailed Steps

#### Step 1: Welcome Screen
**File:** `app/(auth)/welcome.tsx`
**Trigger:** User opens app for first time
**Actions:**
- View MTOTOCARE AFRICA logo and branding
- View tagline: "AI-Powered Child Health & Parenting Platform"
- View slogan: "Healthy Children. Smarter Healthcare. Stronger Africa."
- See 6 key features with icons
**Options:**
- Tap **Get Started** → proceeds to Step 2
- Tap **Login** → goes to Login screen (Flow 4.1)

#### Step 2: Get Started Screen
**File:** `app/(auth)/get-started.tsx`
**Trigger:** User taps "Get Started"
**Content:**
- Mother & child illustration
- "Let's get started" heading
- "Create your account to start your parenting journey."
- **Create Account** primary button
- "I already have an account" link
- Pagination dots (● ○ ○)
**Options:**
- **Create Account** → Register screen (Flow 4.2)
- **Login link** → Login screen

#### Step 3: Add Your Child
**File:** `app/(auth)/add-your-child.tsx`
**Trigger:** User completes registration OR explicit navigation
**Form fields:**
| Field | Type | Required |
|-------|------|----------|
| Photo | Image picker | Optional |
| Child's Name | Text input | Yes |
| Date of Birth | Date picker | Yes |
| Gender | Radio (Male/Female) | Yes |
**Actions:**
- Tap photo circle → camera/gallery picker
- Tap "Save & Continue" → API call to `POST /api/children`
- Pagination dots (○ ● ○)

**API Request:**
```json
POST /api/children
{
  "firstName": "Juma",
  "lastName": "Said",
  "dateOfBirth": "2024-12-15",
  "gender": "MALE",
  "birthWeightKg": 3.2,
  "birthHeightCm": 50
}
```

**On success:** Auto-generates 13 vaccination records + navigates to Step 4

#### Step 4: Choose Language
**File:** `app/(auth)/choose-language.tsx`
**Trigger:** After successful child registration
**Options:**
- English (default)
- Kiswahili
- Kikuyu
**Action:**
- Tap **Continue** → saves preference to AsyncStorage → navigates to Home
- Pagination dots (○ ○ ●)

---

## 4. Authentication Flows

### 4.1 Login Flow

```
┌─────────────────┐
│                 │
│   Login         │
│  (auth)/login   │
│                 │
│ • Email         │
│ • Password      │
│ • Forgot?       │
│ • Sign In       │
│ • Sign Up       │
│                 │
└────────┬────────┘
         │
         ▼
   ┌─────────────┐
   │ POST /auth/  │
   │  login      │
   └──────┬──────┘
          │
   ┌──────┴──────────────┐
   │                     │
   ▼                     ▼
Success              Failure
   │                     │
   ▼                     ▼
SecureStore        Show error
.setItemAsync      "Invalid email
   │               or password"
   ▼                     │
(tabs)/home              │
                         ▼
                    Stay on login
```

**API:** `POST /api/auth/login`
**Request:**
```json
{
  "email": "amina@example.com",
  "password": "Test1234!"
}
```
**Response:** JWT tokens + user profile

### 4.2 Registration Flow

```
┌─────────────────┐
│   Register       │
│ (auth)/register  │
│                 │
│ • Full Name     │
│ • Email         │
│ • Phone         │
│ • Password      │
│ • Confirm Pw    │
│                 │
└────────┬────────┘
         │
         ▼
  Validate inputs
         │
         ▼
  POST /auth/register
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  201 OK    409 Conflict
    │         │
    ▼         ▼
  Login    Show error
  user     "Email already
    │      registered"
    ▼
  Auto-login
    │
    ▼
  Add Child
```

### 4.3 Forgot Password Flow

```
Login screen → Tap "Forgot Password"
              ↓
         (auth)/forgot-password
              ↓
    Enter email → POST /auth/forgot-password
              ↓
         Alert: "Check Your Email"
              ↓
         Back to Login
```

### 4.4 Logout Flow

```
Profile tab → Tap "Logout"
              ↓
         Confirmation Alert
              ↓
    ┌────────┴────────┐
    │                 │
  Cancel           Logout
    │                 │
    ▼                 ▼
  Stay on        Clear SecureStore
  profile        ↓
                POST /auth/logout (best-effort)
                ↓
                (auth)/welcome
```

---

## 5. Main App Navigation Flow

### 5.1 Bottom Tab Bar Structure

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                  [Active Screen Content]                │
│                                                        │
│                                                        │
├────────┬──────────┬──────────┬──────────┬──────────────┤
│        │          │          │          │              │
│  🏠    │  📁       │    ➕     │  🔔       │  👤          │
│ Home  │ Records  │   ADD    │Reminders │ Profile     │
│       │          │   (FAB)  │          │              │
└────────┴──────────┴──────────┴──────────┴──────────────┘
```

**Tab routes:**
- Home → `app/(tabs)/home.tsx`
- Records → `app/(tabs)/records.tsx`
- Add (FAB) → `app/(auth)/add-your-child.tsx` (modal)
- Reminders → `app/(tabs)/reminders.tsx`
- Profile → `app/(tabs)/profile.tsx`

### 5.2 Home Screen Flow

```
(tabs)/home
  │
  ├─► Tap child overview card
  │     ↓
  │   children/[id].tsx (Child Detail)
  │     │
  │     ├─► Vaccinations → app/vaccinations.tsx
  │     ├─► Growth → app/growth.tsx
  │     ├─► Nutrition → app/nutrition.tsx
  │     └─► Medical Records → app/medical-records.tsx
  │
  ├─► Tap stat card (Vaccination/Growth/Nutrition/AI)
  │     ↓
  │   Navigate to respective module screen
  │
  ├─► Tap AI Assistant card
  │     ↓
  │   app/ai-chat.tsx (AI Chat)
  │
  ├─► Tap "Add Child" button
  │     ↓
  │   (auth)/add-your-child.tsx
  │
  └─► Tap notification bell
        ↓
      (tabs)/reminders.tsx
```

### 5.3 Child Detail Flow

```
children/[id]
  │
  ├─► Tap Edit (pencil icon)
  │     ↓
  │   (auth)/add-your-child.tsx (re-use for edit)
  │
  ├─► Tap Vaccination link
  │     ↓
  │   app/vaccinations.tsx
  │     │
  │     ├─► Schedule tab (PENDING/OVERDUE)
  │     └─► History tab (COMPLETED)
  │
  ├─► Tap Growth link
  │     ↓
  │   app/growth.tsx
  │     │
  │     ├─► Weight tab + chart
  │     ├─► Height tab + chart
  │     └─► BMI tab + chart
  │
  ├─► Tap Nutrition link
  │     ↓
  │   app/nutrition.tsx
  │     │
  │     ├─► Today tab
  │     ├─► This Week tab
  │     └─► Recipes tab
  │
  ├─► Tap Medical Records link
  │     ↓
  │   app/medical-records.tsx (list of categories)
  │
  └─► Tap AI Assistant card
        ↓
      app/ai-chat.tsx
```

---

## 6. Module-Specific Flows

### 6.1 AI Assistant Chat Flow

```
User types question in input
              ↓
         Tap send (paper plane icon)
              ↓
         POST /api/ai/chat
         {
           "message": "...",
           "language": "en" | "sw",
           "childId": 1
         }
              ↓
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
Loading...         Error
"Thinking..."    "Sorry, try again"
    │                   │
    ▼                   ▼
AI response       Display error
displayed         message
              ↓
Continue conversation
```

**Features:**
- Quick prompt chips (suggests common questions)
- Mic button (voice input - future)
- Message bubbles with role-based styling
- Auto-scroll to latest message

### 6.2 Vaccination Tracker Flow

```
vaccinations.tsx
  │
  ├─► Default: Schedule tab
  │     Shows PENDING + OVERDUE vaccines
  │     Timeline with status dots
  │     │
  │     └─► Pull to refresh → reload data
  │
  ├─► Tap "History" tab
  │     Shows COMPLETED vaccines
  │
  └─► (Future) Tap vaccine → detail screen
```

**Data flow:**
```
GET /api/vaccinations/child/{childId}
       ↓
Render timeline with status colors:
  • Green (COMPLETED)
  • Yellow (PENDING)
  • Red (OVERDUE)
```

### 6.3 Growth Monitoring Flow

```
growth.tsx
  │
  ├─► Tab: Weight | Height | BMI
  │     │
  │     └─► Chart displays measurements over time
  │
  ├─► Current value shown prominently
  │     with status badge (NORMAL/STUNTED/etc.)
  │
  └─► "Add Measurement" button
        ↓
      Form modal (future)
      ↓
      POST /api/growth/child/{childId}
```

### 6.4 Nutrition Guide Flow

```
nutrition.tsx
  │
  ├─► Tab: Today | This Week | Recipes
  │     │
  │     └─► "Today" tab:
  │           POST /api/nutrition/child/{childId}/generate
  │           ↓
  │           Display meals with emojis:
  │             🍌 Breakfast
  │             🍛 Lunch
  │             🍚 Dinner
  │             🍎 Snack
  │
  └─► "Tip of the day" card at bottom
```

### 6.5 Reminders Flow

```
reminders.tsx
  │
  ├─► Upcoming Reminders section
  │     Cards with:
  │       • Icon (color-coded by type)
  │       • Title
  │       • Countdown ("Due in 12 days")
  │       • Full date/time
  │
  ├─► Past Reminders section
  │     Faded cards with checkmark
  │
  └─► "Add Reminder" FAB
        ↓
      Form (future)
```

### 6.6 Profile Flow

```
profile.tsx
  │
  ├─► User info section
  │     • Avatar
  │     • Name & email
  │     • Role badges (PARENT, DOCTOR, etc.)
  │
  ├─► Section: Account
  │     • Edit Profile
  │     • Change Password
  │     • Language
  │
  ├─► Section: Preferences
  │     • Dark Mode (toggle)
  │     • Notifications (toggle)
  │     • Biometric Login (toggle)
  │
  ├─► Section: Support
  │     • Offline Support → /offline
  │     • Help Center
  │     • Privacy Policy
  │     • About (v1.0.0)
  │
  └─► Logout button (red)
        ↓
      Confirmation alert
        ↓
      Clear tokens + redirect to /welcome
```

---

## 7. Offline & Error Handling Flows

### 7.1 Network Status Detection

```
App foreground
    ↓
Check network state (@react-native-community/netinfo)
    ↓
┌─────────┴─────────┐
│                   │
Online              Offline
│                   │
Standard           Show "Offline" banner
operation          ↓
              Cache last data
              ↓
              Queue actions for later sync
```

### 7.2 Token Expiry Flow

```
API request returns 401
              ↓
      axios interceptor catches
              ↓
      POST /auth/refresh with refreshToken
              ↓
    ┌─────────┴─────────┐
    │                   │
Success              Failure
    │                   │
Save new tokens      Clear tokens
    │                   │
Retry original       Redirect to login
request
```

### 7.3 Offline Screen Flow

```
(tabs)/profile → "Offline Support"
              ↓
         app/offline.tsx
              ↓
    Shows WiFi-off icon + illustration
              ↓
    "You are offline" warning
              ↓
    "Some features may be limited"
              ↓
    User returns online
              ↓
    Auto-sync queued data
```

---

## 8. Data Synchronization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   API Client (Axios)                         │
│  with JWT interceptor + auto-refresh                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────────┐
   │ Online  │  │ Cached   │  │  Pending     │
   │ Request │  │ Data     │  │  Sync Queue  │
   │         │  │ (Async  │  │  (Offline)   │
   │         │  │  Storage│  │              │
   └─────────┘  └──────────┘  └──────────────┘
```

**Storage layers:**
| Data Type | Storage | Lifetime |
|-----------|----------|----------|
| JWT tokens | SecureStore (encrypted) | Until logout |
| User prefs | AsyncStorage | Permanent |
| Children cache | Redux state | Session |
| API response cache | RTK Query | 5 min TTL |
| Pending actions | AsyncStorage queue | Until online |

---

## 9. Notification Flow

### 9.1 Push Notification (FCM)

```
Backend scheduled task
        ↓
Vaccination overdue check (daily 8 AM)
        ↓
Create notification record
        ↓
Firebase Cloud Messaging
        ↓
User device receives push
        ↓
Tap notification
        ↓
Deep link to relevant screen
(e.g., /vaccinations)
```

### 9.2 In-App Notification Center

```
reminders.tsx (Reminders tab)
        ↓
GET /api/notifications?page=0&size=20
        ↓
Render upcoming + past reminders
        ↓
Tap reminder
        ↓
Navigate to related entity
        ↓
PUT /api/notifications/{id}/read
```

---

## 10. Error States & Edge Cases

### 10.1 Network Errors

| Error | Display | Recovery |
|-------|---------|----------|
| No internet | "You are offline" banner | Auto-retry when online |
| 401 Unauthorized | Login screen | After token refresh fails |
| 403 Forbidden | "Access denied" toast | Hide menu items |
| 404 Not Found | "Item not found" toast | Back navigation |
| 500 Server Error | "Something went wrong" | Retry button |
| Timeout | "Request timed out" | Auto-retry 3x |

### 10.2 Form Validation

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Email | Regex `^[^@]+@[^@]+\.[^@]+$` | "Invalid email" |
| Password | Min 8 chars | "Password too short" |
| Confirm Password | Match password | "Passwords don't match" |
| Child DOB | Must be in past | "Invalid date" |
| Phone | Optional, 10-15 digits | "Invalid phone" |

### 10.3 Empty States

| Screen | Empty State |
|--------|-------------|
| Home (no children) | "Add your first child" + CTA button |
| Records | "No children yet" + Add button |
| Reminders | "No upcoming reminders" + Add button |
| Vaccinations | "No vaccinations scheduled" |
| Growth | "No measurements yet" + Add button |
| Nutrition | Auto-generates if empty |
| AI Chat | Welcome message + quick prompts |

---

## 11. State Management Flow (Redux)

```
┌─────────────────────────────────────────────────────┐
│                  Redux Store                          │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐      │
│  │   auth   │  │ children │  │ notifications│      │
│  │  Slice   │  │  Slice   │  │    Slice     │      │
│  │          │  │          │  │              │      │
│  │ • user   │  │ • list   │  │ • list       │      │
│  │ • token  │  │ • select │  │ • unread     │      │
│  │ • loading│  │   edId   │  │ • loading    │      │
│  │ • error  │  │ • loading│  │              │      │
│  └──────────┘  └──────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────┘
```

**Data flow:**
1. Component dispatches action (e.g., `fetchChildren()`)
2. Redux thunk calls API
3. API returns data
4. Reducer updates state
5. Component re-renders with new data

---

## 12. Testing Scenarios

### 12.1 Critical User Paths to Test

1. ✅ **New user onboarding** – Welcome → Get Started → Register → Add Child → Language → Home
2. ✅ **Returning user login** – Welcome → Login → Home
3. ✅ **Add multiple children** – Add Child → Save → Add another → Save
4. ✅ **View child's health modules** – Home → Child → Vaccinations/Growth/Nutrition
5. ✅ **Chat with AI** – Home → AI → Type message → Send → Receive response
6. ✅ **Logout** – Profile → Logout → Confirm → Welcome
7. ✅ **Offline behavior** – Disable network → App still shows cached data
8. ✅ **Token refresh** – Wait for token expiry → Auto-refresh in background

### 12.2 Error Scenarios to Test

- Empty form submission
- Invalid email format
- Network timeout
- Server 500 error
- Concurrent API calls
- Large data sets (100+ children)
- Slow network (2G simulation)

---

## 13. Future Flow Enhancements

| Flow | Current State | Future |
|------|---------------|--------|
| Doctor portal | Not implemented | Separate role-based flow |
| Video consultations | Not implemented | Integrated video call |
| Wearable sync | Not implemented | Health data from devices |
| Voice input | Button only | Full STT integration |
| Multi-language AI | English + Kiswahili | All East African languages |
| Offline-first | Partial | Full offline mode with sync |

---

**End of User Flow Document**

**Status:** Complete
**Last Updated:** July 2026
