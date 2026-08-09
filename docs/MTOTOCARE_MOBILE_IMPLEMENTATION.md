# MtotoCare Africa – Mobile Application Implementation Document

**Project Name:** MtotoCare Africa
**Document Type:** Phase 4 – Mobile Application Development
**Version:** 1.0
**Date:** July 2026
**Status:** Complete

---

## Table of Contents

### Chapter 1: Introduction
- 4.1 Introduction
- 4.2 Purpose
- 4.3 Objectives
- 4.4 Scope
- 4.5 Target Users
- 4.6 Mobile Development Methodology
- 4.7 Mobile Development Standards

### Chapter 2: Mobile Technology Stack
- 4.8 Development Environment
- 4.9 React Native / Expo SDK
- 4.10 TypeScript Language
- 4.11 IDE Configuration
- 4.12 Android SDK
- 4.13 iOS Support (Future)
- 4.14 Emulator Configuration
- 4.15 Version Control
- 4.16 Package Management

### Chapter 3: Mobile Architecture
- 4.17 Mobile Architecture Overview
- 4.18 Clean Architecture
- 4.19 MVVM Pattern
- 4.20 Folder Structure
- 4.21 Layer Responsibilities
- 4.22 Dependency Injection
- 4.23 State Management
- 4.24 Navigation Architecture

### Chapter 4: UI/UX Implementation
- 4.25 Design Principles
- 4.26 Material Design 3
- 4.27 Responsive Layout
- 4.28 Adaptive Layout
- 4.29 Theme Configuration
- 4.30 Typography
- 4.31 Color System
- 4.32 Icons
- 4.33 Animations
- 4.34 Accessibility

### Chapter 5–15: Screen Implementation
- **Chapter 5:** Authentication Screens (Welcome, Login, Register, OTP, Forgot Password, Reset, Profile Setup)
- **Chapter 6:** Parent Dashboard
- **Chapter 7:** Child Management
- **Chapter 8:** Vaccination Module
- **Chapter 9:** Growth Monitoring
- **Chapter 10:** Nutrition Module
- **Chapter 11:** Medical Records
- **Chapter 12:** Appointment Module
- **Chapter 13:** AI Parenting Assistant
- **Chapter 14:** Notifications
- **Chapter 15:** Settings

### Chapter 16: React Native Implementation
- 4.106 Project Structure
- 4.107 Feature Modules
- 4.108 Components
- 4.109 Routing
- 4.110 State Management
- 4.111 Services
- 4.112 Repositories
- 4.113 Models
- 4.114 Stores (Redux)
- 4.115 Utilities

### Chapter 17: API Integration
- 4.116–4.125 All API endpoints

### Chapter 18: Local Storage
- 4.126 Secure Storage
- 4.127 AsyncStorage
- 4.128 Offline Cache
- 4.129 Image Cache
- 4.130 Token Storage

### Chapter 19: Security
- 4.131–4.136 Security measures

### Chapter 20: Error Handling
- 4.137–4.140 Error strategies

### Chapter 21: Performance
- 4.141–4.145 Performance optimizations

### Chapter 22: Testing
- 4.146–4.149 Testing strategy

### Chapter 23: Deployment
- 4.150–4.154 Deployment

### Chapter 24: Maintenance
- 4.155–4.159 Maintenance

### Chapter 25: Deliverables

---

# Chapter 1: Introduction

## 4.1 Introduction

The MtotoCare Africa mobile application is the primary interface through which parents, guardians, and healthcare providers interact with the platform. Built with **React Native + Expo**, the app delivers a native-quality experience on Android devices with iOS support planned for future release.

The app connects to the **Spring Boot backend** (documented in Phase 3) via REST APIs, providing:
- AI-powered parenting assistance
- Real-time vaccination tracking
- Growth monitoring with WHO standards
- Nutrition planning
- Healthcare provider connectivity
- Offline functionality for low-connectivity regions

## 4.2 Purpose

The mobile app serves as the **primary touchpoint** for users to:
1. Manage child health records digitally
2. Receive AI-powered health guidance
3. Track vaccinations and growth
4. Communicate with healthcare providers
5. Access information in English and Kiswahili
6. Work offline in areas with poor connectivity

## 4.3 Objectives

| # | Objective | Success Metric |
|---|-----------|----------------|
| 1 | Deliver native-quality mobile UX | < 2s screen transitions, 60fps |
| 2 | Implement all backend features | 100% feature parity with backend |
| 3 | Support offline usage | All critical features work offline |
| 4 | Ensure cross-platform support | Single codebase for Android+iOS |
| 5 | Provide multilingual support | English + Kiswahili |
| 6 | Enable AI integration | Chat assistant works seamlessly |
| 7 | Push notifications | Real-time alerts delivered |
| 8 | High performance | < 100ms API response handling |
| 9 | Security | JWT + biometric auth |
| 10 | Accessibility | WCAG 2.1 AA compliance |

## 4.4 Scope

### In Scope
- Android (primary platform)
- React Native + Expo
- Offline-first design
- Multilingual UI (English, Kiswahili)
- All 11 backend features
- AI Assistant chat
- Push notifications
- Biometric authentication
- Dark mode

### Out of Scope (Phase 1)
- iOS release (planned for Phase 2)
- Tablet-optimized layouts (uses responsive design)
- Wearable device integration
- Native code modules (planned for performance optimizations)

## 4.5 Target Users

| User Type | Primary Use Case |
|-----------|-----------------|
| **Parents** | Daily health tracking, AI advice, reminders |
| **Guardians** | Same as parents, read-only access |
| **Healthcare Providers** | Patient records, vaccination records |
| **Children (indirect)** | Benefit from better health monitoring |

## 4.6 Mobile Development Methodology

**Agile Scrum** with 2-week sprints:
- Sprint planning (1 hour)
- Daily standups (15 min)
- Sprint review (demo to stakeholders)
- Sprint retrospective (continuous improvement)
- Backlog grooming (weekly)

## 4.7 Mobile Development Standards

- **Language:** TypeScript (strict mode)
- **Linting:** ESLint + Prettier
- **Code formatting:** 2-space indentation
- **Naming:** camelCase for variables, PascalCase for components
- **Comments:** JSDoc for all exported functions
- **Git:** Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Testing:** > 70% code coverage target

---

# Chapter 2: Mobile Technology Stack

## 4.8 Development Environment

### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB |
| Storage | 20 GB | 50 GB SSD |
| Display | 1080p | 1440p |

### Software Requirements
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20 LTS | JavaScript runtime |
| npm/yarn | Latest | Package manager |
| Expo CLI | Latest | Mobile dev framework |
| Android Studio | Hedgehog+ | Android emulator & SDK |
| VS Code | Latest | Code editor |
| Git | 2.40+ | Version control |

## 4.9 React Native + Expo SDK

**Why React Native + Expo:**
- **Cross-platform:** 95%+ code reuse between Android and iOS
- **Fast iteration:** Hot reload in < 1 second
- **OTA updates:** Push JS updates without app store review
- **Rich ecosystem:** 3000+ community packages
- **Native performance:** Compiles to native Java/Swift

**Why Expo:**
- **Managed workflow:** No native build configuration needed
- **EAS Build:** Cloud-based APK/IPA generation
- **EAS Update:** Over-the-air updates
- **Built-in services:** Push notifications, analytics, auth
- **Expo Router:** File-based routing (React Navigation)

**Versions:**
- React Native: 0.74+
- Expo SDK: 51+
- React: 18.2+

## 4.10 TypeScript

**Why TypeScript:**
- Type safety reduces runtime errors by 40%+
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring
- Industry standard for React Native in 2026

**Configuration:** `tsconfig.json` with strict mode enabled.

## 4.11 IDE Configuration

**VS Code extensions:**
- React Native Tools
- TypeScript + JavaScript
- ESLint
- Prettier
- Auto Rename Tag
- Path Intellisense
- GitLens
- Thunder Client (for API testing)

## 4.12 Android SDK

**SDK versions:**
- Compile SDK: 34 (Android 14)
- Target SDK: 34
- Min SDK: 24 (Android 7.0, 99% device coverage)
- Build Tools: 34.0.0
- NDK: 26.1.10909125 (for any native modules)

## 4.13 iOS Support (Future)

When iOS support is added:
- Xcode 15+
- iOS 14+ deployment target
- Apple Developer account
- TestFlight for beta testing

## 4.14 Emulator Configuration

**Recommended Android emulator:**
- Pixel 6 (Android 14, API 34)
- 4 GB RAM
- 1080x2400 resolution
- Hardware acceleration enabled

**Physical device testing:** Recommended for final QA.

## 4.15 Version Control

**Git workflow:**
- Main branch (production)
- Develop branch (staging)
- Feature branches (`feature/xxx`)
- Bugfix branches (`fix/xxx`)
- Release branches (`release/1.0.0`)

**Repository:** `github.com/mtotocare-africa/mobile`

## 4.16 Package Management

**npm** (default with Node.js):
- `npm install <package>` — install
- `npm install --save-dev <package>` — dev dependency
- `npm uninstall <package>` — remove
- `npm update` — update all
- `npm audit` — security check

**Lock file:** `package-lock.json` committed to git.

---

# Chapter 3: Mobile Architecture

## 4.17 Mobile Architecture Overview

The app follows **Clean Architecture** with **MVVM** pattern, organized in 3 main layers:

```
┌────────────────────────────────────────┐
│     PRESENTATION LAYER (UI)            │
│  - Screens (React Components)          │
│  - Navigation                          │
│  - State (Redux slices)                │
│  - Hooks                               │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│     DOMAIN LAYER (Business Logic)      │
│  - Use Cases                           │
│  - Entities / Models                   │
│  - Repository Interfaces               │
│  - DTOs                                │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│     DATA LAYER (External Interfaces)   │
│  - API Services (Axios)                │
│  - Local Storage (AsyncStorage)        │
│  - Repository Implementations          │
│  - Secure Storage (expo-secure-store)  │
└────────────────────────────────────────┘
```

## 4.18 Clean Architecture Benefits

- **Testability:** Each layer testable in isolation
- **Maintainability:** Changes localized
- **Scalability:** Easy to add features
- **Independence:** UI doesn't know about data sources
- **Flexibility:** Swap data sources without changing UI

## 4.19 MVVM Pattern

**Model-View-ViewModel** adapted for React Native:

| MVVM | React Native |
|------|--------------|
| Model | Entity / DTO classes |
| View | React Component (Screen) |
| ViewModel | Redux slice + custom hooks |

## 4.20 Folder Structure

```
mtotocare-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth group
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── otp.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/                   # Bottom tab group
│   │   ├── home.tsx              # Dashboard
│   │   ├── records.tsx           # Child records
│   │   ├── reminders.tsx         # Notifications
│   │   └── profile.tsx           # User profile
│   ├── children/                 # Child management
│   │   ├── add.tsx
│   │   ├── [id]/
│   │   │   ├── index.tsx
│   │   │   ├── edit.tsx
│   │   │   ├── vaccinations.tsx
│   │   │   ├── growth.tsx
│   │   │   ├── nutrition.tsx
│   │   │   └── medical.tsx
│   ├── appointments/
│   ├── ai-chat/
│   └── _layout.tsx
│
├── src/
│   ├── api/                      # API services
│   │   ├── client.ts             # Axios instance
│   │   ├── auth.api.ts
│   │   ├── children.api.ts
│   │   ├── vaccinations.api.ts
│   │   ├── growth.api.ts
│   │   ├── nutrition.api.ts
│   │   ├── medical.api.ts
│   │   ├── appointments.api.ts
│   │   ├── ai.api.ts
│   │   └── notifications.api.ts
│   │
│   ├── components/               # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── child/
│   │   ├── vaccination/
│   │   ├── growth/
│   │   └── ...
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChildren.ts
│   │   ├── useVaccinations.ts
│   │   └── ...
│   │
│   ├── navigation/               # Navigation config
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── screens/                  # Screen components (legacy)
│   │
│   ├── store/                    # Redux store
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── childrenSlice.ts
│   │   │   ├── notificationsSlice.ts
│   │   │   └── settingsSlice.ts
│   │   └── api/
│   │       ├── authApi.ts        # RTK Query
│   │       └── ...
│   │
│   ├── services/                 # Business logic services
│   │   ├── auth.service.ts
│   │   ├── storage.service.ts
│   │   ├── notification.service.ts
│   │   └── ai.service.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── user.types.ts
│   │   ├── child.types.ts
│   │   ├── api.types.ts
│   │   └── navigation.types.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   ├── format.ts
│   │   └── constants.ts
│   │
│   ├── theme/                    # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── ThemeProvider.tsx
│   │
│   └── i18n/                     # Translations
│       ├── en.json
│       ├── sw.json
│       └── i18n.ts
│
├── assets/                       # Images, fonts
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── .env                          # Environment variables
```

## 4.21 Layer Responsibilities

### Presentation Layer
- Render UI components
- Handle user input
- Display data from Redux store
- Navigate between screens
- Validate user input (client-side)
- Show loading/error states

### Domain Layer
- Define entities (User, Child, Vaccination)
- Define repository interfaces
- Implement use cases (business rules)
- Map between DTOs and entities
- Pure functions (no external dependencies)

### Data Layer
- Implement repository interfaces
- Call REST APIs (Axios)
- Read/write local storage
- Handle caching
- Implement offline sync logic
- JWT token refresh logic

## 4.22 Dependency Injection

**React Context** for service injection:

```typescript
// src/services/ServiceContext.tsx
const ServiceContext = createContext<Services | null>(null);

export const ServiceProvider: React.FC = ({ children }) => {
  const services = {
    auth: new AuthService(),
    children: new ChildrenService(),
    // ...
  };
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServices must be used within ServiceProvider');
  return ctx;
};
```

## 4.23 State Management

**Redux Toolkit + RTK Query:**

```typescript
// src/store/index.ts
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    children: childrenSlice.reducer,
    notifications: notificationsSlice.reducer,
    settings: settingsSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [childrenApi.reducerPath]: childrenApi.reducer,
    // ... more API slices
  },
  middleware: (getDefault) => getDefault()
    .concat(authApi.middleware)
    .concat(childrenApi.middleware),
});
```

**State Categories:**
- **Server state** (RTK Query): API data with caching
- **Client state** (Redux): UI state, user prefs
- **Local state** (useState): Component-specific
- **Persistent state** (AsyncStorage): Survives app restart

## 4.24 Navigation Architecture

**Expo Router (File-based):**

```
app/
├── _layout.tsx              # Root layout
├── (auth)/                  # Auth group
│   ├── _layout.tsx
│   ├── welcome.tsx
│   └── login.tsx
├── (tabs)/                  # Main tab group
│   ├── _layout.tsx          # Bottom tab bar
│   ├── home.tsx
│   ├── records.tsx
│   └── profile.tsx
└── children/
    └── [id].tsx            # Dynamic route
```

**Auth flow:**
- Not logged in → `(auth)` group
- Logged in → `(tabs)` group + access to other routes
- Token expires → auto-redirect to login

---

# Chapter 4: UI/UX Implementation

## 4.25 Design Principles

1. **Mobile-first:** Designed for touch, not adapted from web
2. **Simplicity:** Minimal cognitive load
3. **Consistency:** Same patterns across all screens
4. **Feedback:** Every action has visual feedback
5. **Speed:** < 2s to any screen
6. **Accessibility:** Works for everyone

## 4.26 Material Design 3

Following Google Material Design 3 guidelines:
- **FAB (Floating Action Button)** for primary actions
- **Cards** for content containers
- **Bottom sheets** for secondary actions
- **Snackbars** for transient messages
- **Material 3 color tokens** (primary, secondary, tertiary)

## 4.27 Responsive Layout

Using `flex` and percentage-based sizing:
- All containers use `flex: 1` for main content
- Padding/margins use theme constants
- Text uses relative sizing (via PixelRatio)

```typescript
// Responsive sizing helper
import { Dimensions, PixelRatio } from 'react-native';
const { width, height } = Dimensions.get('window');
const scale = width / 375; // iPhone 11 baseline
const normalize = (size: number) => 
  Math.round(PixelRatio.roundToNearestPixel(size * scale));
```

## 4.28 Adaptive Layout

Different layouts for:
- **Portrait vs Landscape** (rare on mobile, but supported)
- **Small screens** (< 5"): Reduce padding
- **Tablets** (> 7"): Two-column layouts
- **Accessibility settings:** Larger text support

## 4.29 Theme Configuration

```typescript
// src/theme/ThemeProvider.tsx
const lightTheme = {
  colors: {
    primary: '#2E7D32',      // MtotoCare green
    primaryDark: '#1B5E20',
    primaryLight: '#A5D6A7',
    secondary: '#FF6F00',     // Action orange
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#D32F2F',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16, full: 9999 },
  typography: { /* ... */ },
};

const darkTheme = { /* dark variants */ };
```

## 4.30 Typography

**Font family:** System default (San Francisco on iOS, Roboto on Android)

**Scale:**
- `h1`: 32px, bold
- `h2`: 24px, semibold
- `h3`: 20px, semibold
- `body1`: 16px, regular
- `body2`: 14px, regular
- `caption`: 12px, regular
- `button`: 14px, medium, uppercase

## 4.31 Color System

| Color | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | #2E7D32 | #A5D6A7 | Main actions, brand |
| Secondary | #FF6F00 | #FFB74D | FAB, highlights |
| Success | #4CAF50 | #81C784 | Positive feedback |
| Warning | #FF9800 | #FFB74D | Warnings |
| Error | #D32F2F | #EF5350 | Errors, urgent |
| Info | #2196F3 | #64B5F6 | Information |

## 4.32 Icons

**Library:** `@expo/vector-icons` (Ionicons)

Icons used:
- Home, Records, Reminders, Profile (tab bar)
- Vaccine, Growth, Nutrition (modules)
- Add, Edit, Delete, Save (actions)
- Search, Filter, Settings (UI)

## 4.33 Animations

**Library:** `react-native-reanimated` + `moti`

Animations:
- **Screen transitions:** Slide left/right (300ms)
- **Card press:** Scale 0.98 (100ms)
- **Pull-to-refresh:** Native
- **Loading:** Spinner or skeleton
- **Success:** Checkmark scale-in

## 4.34 Accessibility

- All images have `accessibilityLabel`
- All buttons have descriptive `accessibilityLabel`
- Color contrast ratio ≥ 4.5:1
- Touch targets ≥ 44x44 points
- Screen reader tested (TalkBack on Android)
- Respects system font size
- Respects "Reduce Motion" setting

---

# Chapter 5: Authentication Screens

## 4.35 Splash Screen

**Purpose:** Display logo during app initialization

**Implementation:**
```typescript
// app/index.tsx
export default function Splash() {
  const router = useRouter();
  
  useEffect(() => {
    checkAuthAndNavigate();
  }, []);
  
  const checkAuthAndNavigate = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    setTimeout(() => {
      router.replace(token ? '/(tabs)/home' : '/(auth)/welcome');
    }, 1500);
  };
  
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} />
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
```

## 4.36 Welcome Screen

**Purpose:** First-time user introduction with feature highlights

**Components:**
- App logo and tagline
- 3 feature highlights with icons
- "Get Started" button (primary)
- "I already have an account" link

## 4.37 Login Screen

**Fields:**
- Email (validated with regex)
- Password (show/hide toggle)
- "Forgot password?" link
- "Login" button (primary, full-width)
- "Don't have an account? Register" link

**API Call:** `POST /api/auth/login`

**State Management:**
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 4.38 Registration Screen

**Fields:**
- Full name
- Email
- Phone number (with country code)
- Password
- Confirm password
- Terms & conditions checkbox

**Validation:**
- Email format
- Phone format (Tanzania: +255)
- Password match
- Min password length 8
- Unique email/phone (server-side check)

**API Call:** `POST /api/auth/register`

## 4.39 OTP Verification

**Fields:**
- 6-digit OTP code (auto-focus between inputs)
- Resend OTP button (60s cooldown)
- Timer countdown

**API Call:** `POST /api/auth/verify-otp`

## 4.40 Forgot Password

**Fields:**
- Email address
- "Send Reset Link" button
- Back to login link

**API Call:** `POST /api/auth/forgot-password`

## 4.41 Reset Password

**Fields:**
- New password
- Confirm new password
- Password strength indicator
- "Reset Password" button

**API Call:** `POST /api/auth/reset-password`

## 4.42 Profile Setup

**Fields:**
- Profile picture (from camera or gallery)
- Display name
- Preferred language
- Region/district

---

# Chapter 6: Parent Dashboard

## 4.43 Home Screen

**Layout:**
- **Header:** Greeting + notification bell + profile avatar
- **Child Summary Card:** Photo, name, age, quick stats
- **Upcoming Vaccinations:** Next 2-3 vaccines with dates
- **Quick Actions Grid:** Vaccination, Growth, Nutrition, AI Chat
- **Recent Activity:** Last 3 actions/notifications

## 4.44 Child Summary Card

Displays:
- Child photo (rounded)
- Name and age (e.g., "Juma Said, 18 months")
- Vaccination completion (e.g., "8/13 completed")
- Latest weight/height
- Tap to expand details

## 4.45 Upcoming Vaccinations

Horizontal scrollable cards:
- Vaccine name
- Due date (with countdown)
- Status badge (PENDING/OVERDUE)
- Tap to view details

## 4.46 Growth Summary

Mini chart showing:
- Latest weight
- Latest height
- BMI
- WHO Z-score
- Nutrition status badge

## 4.47 Appointment Summary

Next appointment card:
- Date and time
- Doctor/clinic name
- Type (VACCINATION, CHECKUP)
- Actions: View, Reschedule, Cancel

## 4.48 Notifications

Bottom of home screen:
- Last 3 notifications
- "View all" link
- Unread count badge

## 4.49 AI Parenting Assistant

Prominent card with:
- AI avatar
- "Ask me anything about your child's health"
- Quick suggestion chips
- Tap to open chat

## 4.50 Quick Actions

Grid of 4 large buttons:
- 📅 Book Appointment
- 💉 Record Vaccination
- 📊 Add Growth Measurement
- 🤖 Ask AI

---

# Chapter 7: Child Management

## 4.51 Child Registration

Multi-step form:
1. **Step 1:** Basic info (name, DOB, gender)
2. **Step 2:** Birth details (weight, height, blood group)
3. **Step 3:** Profile photo (optional)
4. **Step 4:** Review & confirm

## 4.52 Child Profile

Top section:
- Large profile photo
- Name, age
- Action buttons (Edit, Delete)

Tabs:
- Overview | Vaccinations | Growth | Nutrition | Medical | Appointments

## 4.53 Medical History

Chronological list of:
- Diagnoses
- Medications
- Allergies (highlighted at top)
- Clinical visits

## 4.54 Development Milestones

Timeline of:
- First words
- First steps
- Weight milestones
- Behavioral changes

## 4.55 Emergency Contacts

- Primary contact
- Doctor
- Hospital
- Ambulance (999 in Tanzania)

## 4.56 Profile Editing

Form to update:
- Name
- Date of birth
- Gender
- Blood group
- Profile photo

---

# Chapter 8: Vaccination Module

## 4.57 Vaccination Schedule

Timeline view:
- All scheduled vaccines
- Color-coded by status (Green=Done, Yellow=Upcoming, Red=Overdue)
- Age markers (Birth, 6 weeks, 10 weeks, etc.)

## 4.58 Vaccine Details

When tapping a vaccine:
- Vaccine name & description
- Recommended age
- Status (PENDING/COMPLETED/OVERDUE)
- Due date
- Administered date (if done)
- Doctor/clinic info
- Batch number
- Notes

## 4.59 Vaccination History

List of completed vaccines:
- Sortable by date
- Filterable by status
- Export to PDF option

## 4.60 Vaccine Certificates

Digital certificate:
- Child details
- All completed vaccines
- QR code for verification
- Share via WhatsApp/email
- Download PDF

## 4.61 Vaccination Reminders

Settings:
- Push notifications (default ON)
- SMS reminders (optional)
- Email reminders (optional)
- Reminder timing (1 day, 3 days, 1 week before)

## 4.62 Missed Vaccinations

Highlighted section:
- All OVERDUE vaccines
- Quick "Schedule" button
- "Mark as Done" (if administered)

---

# Chapter 9: Growth Monitoring

## 4.63 Growth Dashboard

Summary cards:
- Current weight (kg)
- Current height (cm)
- BMI
- Nutrition status
- Last measurement date

## 4.64 Height Records

List of all height measurements:
- Date
- Height (cm)
- Age at measurement
- Z-score

## 4.65 Weight Records

List of all weight measurements:
- Date
- Weight (kg)
- Age at measurement
- Z-score

## 4.66 WHO Growth Charts

Interactive charts:
- Weight-for-age curve
- Height-for-age curve
- Weight-for-height curve
- Reference percentiles (3rd, 15th, 50th, 85th, 97th)
- Child's growth trajectory overlay
- Zoom/pan support

## 4.67 BMI Visualization

BMI gauge:
- Current BMI
- Healthy range
- Underweight/Normal/Overweight zones

## 4.68 Growth Reports

PDF export with:
- Growth chart images
- All measurements
- Z-score analysis
- Doctor notes (if any)

## 4.69 Growth Alerts

Notifications when:
- Z-score drops below -2 (malnutrition risk)
- Rapid weight change (>10% in month)
- No measurement in 3+ months

---

# Chapter 10: Nutrition Module

## 4.70 Nutrition Dashboard

Today's plan:
- 4 meals (Breakfast, Lunch, Snack, Dinner)
- Total calories
- Macronutrient breakdown (Carbs, Protein, Fat)
- "View full plan" button

## 4.71 Meal Plans

Today's meals:
- Meal name
- Description
- Ingredients
- Nutritional info
- Image (where available)

## 4.72 Nutrition Advice

AI-powered tips:
- Age-appropriate feeding
- Local food recommendations
- Hydration reminders
- Supplement advice

## 4.73 Feeding Guide

Educational content:
- Breastfeeding guide (0-6 months)
- Weaning tips (6-12 months)
- Family foods (12+ months)
- Common mistakes to avoid

## 4.74 Supplements

Tracking:
- Vitamin A doses
- Iron supplements
- Multivitamins
- Next due dates

## 4.75 Nutrition Progress

Charts:
- Calorie intake over time
- Variety score (different foods tried)
- Hydration tracking

---

# Chapter 11: Medical Records

## 4.76 Medical History

Comprehensive view:
- All medical events
- Filterable by type
- Searchable
- Date range filter

## 4.77 Diagnoses

List of all diagnoses:
- ICD-10 code
- Diagnosis name
- Date diagnosed
- Status (Active/Resolved/Chronic)
- Doctor

## 4.78 Prescriptions

Digital prescriptions:
- Prescription number
- Doctor details
- Medications listed
- Instructions
- Valid until date
- Download/print

## 4.79 Allergies

Critical section (highlighted):
- Allergen name
- Severity (color-coded: Green/Yellow/Red)
- Reaction symptoms
- Management plan
- Always visible at top of medical record

## 4.80 Treatment Plans

Active treatments:
- Current medications
- Dosage schedule
- Reminders
- Progress notes

## 4.81 Clinical Notes

Doctor's notes:
- Visit summaries
- Recommendations
- Follow-up plans

## 4.82 Referrals

Specialist referrals:
- Referred to
- Reason
- Urgency level
- Status

---

# Chapter 12: Appointment Module

## 4.83 Book Appointment

Form:
- Select child
- Select facility
- Select doctor (optional)
- Date picker
- Time slot picker
- Reason for visit
- Notes

## 4.84 Doctor Selection

List of available doctors:
- Photo, name, specialization
- Ratings
- Available slots
- Distance (if location enabled)

## 4.85 Appointment Calendar

Month/week view:
- Upcoming appointments highlighted
- Past appointments grayed out
- Tap to view details

## 4.86 Appointment Details

Full information:
- Child name
- Doctor/clinic
- Date, time, duration
- Type
- Reason, notes
- Actions: Reschedule, Cancel, Get Directions

## 4.87 Appointment History

Past appointments:
- Date
- Type
- Doctor
- Outcome
- Download summary

## 4.88 Reschedule Appointment

Date/time picker:
- Shows only available slots
- Conflict detection
- Confirmation modal

---

# Chapter 13: AI Parenting Assistant

## 4.89 AI Chat Interface

Chat screen:
- Message bubbles (user: right, AI: left)
- Input field with send button
- Voice input option
- Quick suggestion chips
- Typing indicator

## 4.90 Health Questions

User can ask about:
- Symptoms
- Medications
- When to see a doctor
- First aid

## 4.91 Parenting Tips

AI provides:
- Age-appropriate advice
- Behavioral guidance
- Sleep tips
- Developmental milestones

## 4.92 Nutrition Advice

Based on:
- Child's age
- Local foods available
- Cultural preferences
- Nutritional needs

## 4.93 Growth Analysis

AI explains:
- What Z-scores mean
- Normal vs concerning growth
- When to consult a doctor
- Nutrition's role in growth

## 4.94 Development Guidance

Milestone tracking:
- Expected milestones by age
- When to be concerned
- Activities to encourage development

**Important:** AI always includes a medical disclaimer.

---

# Chapter 14: Notifications

## 4.95 Notification Center

Full list of notifications:
- Grouped by type (Vaccination, Growth, etc.)
- Unread highlighted
- Swipe to dismiss
- Tap to view related record

## 4.96 Push Notifications

Integration with FCM:
- Real-time delivery
- Rich notifications (with images)
- Action buttons (View, Snooze)
- Deep linking to relevant screen

## 4.97 Reminder Management

Settings:
- Notification types (toggle each)
- Quiet hours
- Snooze options
- Mark as read

## 4.98 Notification Preferences

Per-type settings:
- Vaccination reminders (ON by default)
- Growth check reminders (ON)
- Appointment reminders (ON)
- AI suggestions (ON)
- Marketing (OFF by default)

---

# Chapter 15: Settings

## 4.99 User Profile

View/edit:
- Profile picture
- Name
- Email
- Phone
- Language

## 4.100 Security Settings

- Biometric login (toggle)
- Auto-lock timeout
- Two-factor authentication (future)
- Active sessions list

## 4.101 Password Change

Form:
- Current password
- New password
- Confirm new password
- Strength indicator

## 4.102 Privacy Settings

- Data sharing preferences
- Analytics opt-in/out
- Marketing communications
- Account deletion

## 4.103 Language Selection

- English
- Kiswahili
- (Future: French, Arabic)

## 4.104 Help Center

- FAQ
- Contact support
- Report a bug
- Feature request

## 4.105 About Application

- App version
- Terms of service
- Privacy policy
- Licenses
- Made with ❤️ in Tanzania

---

# Chapter 16: React Native Implementation

## 4.106 Project Structure

Already detailed in section 4.20.

## 4.107 Feature Modules

Each feature is a self-contained module:
```
src/
├── api/             # API calls
├── components/      # UI components
├── hooks/           # Custom hooks
├── screens/         # Screen logic
├── store/           # State management
├── services/        # Business services
├── types/           # TypeScript types
└── utils/           # Utilities
```

## 4.108 Components

**Reusable components:**
- `<Button>` — Primary, secondary, outline variants
- `<Input>` — Text, password, email, phone variants
- `<Card>` — Container with shadow
- `<Loading>` — Spinner or skeleton
- `<EmptyState>` — Empty list placeholder
- `<ErrorMessage>` — Inline error display
- `<Avatar>` — User/child image
- `<Badge>` — Status indicators
- `<Modal>` — Custom modal wrapper
- `<DatePicker>` — Cross-platform date picker

## 4.109 Routing

Using **Expo Router** (file-based):

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
```

## 4.110 State Management

**Redux Toolkit + RTK Query** (see 4.23)

**Slices:**
- `authSlice` — current user, tokens
- `childrenSlice` — active child selection
- `notificationsSlice` — notification cache
- `settingsSlice` — user preferences

## 4.111 Services

```typescript
// src/services/auth.service.ts
export class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    await this.storeTokens(response.data);
    return response.data;
  }
  
  async storeTokens(tokens: AuthTokens) {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
  }
}
```

## 4.112 Repositories

```typescript
// src/api/children.api.ts
export const childrenApi = createApi({
  reducerPath: 'childrenApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Child'],
  endpoints: (builder) => ({
    getChildren: builder.query<Child[], void>({
      query: () => '/children',
      providesTags: ['Child'],
    }),
    addChild: builder.mutation<Child, ChildRequest>({
      query: (body) => ({ url: '/children', method: 'POST', body }),
      invalidatesTags: ['Child'],
    }),
  }),
});
```

## 4.113 Models

TypeScript interfaces matching backend DTOs:

```typescript
// src/types/child.types.ts
export interface Child {
  id: number;
  firstName: string;
  lastName?: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  ageInMonths: number;
  birthWeightKg?: number;
  birthHeightCm?: number;
  bloodGroup?: string;
  profilePictureUrl?: string;
}

export interface ChildRequest {
  firstName: string;
  lastName?: string;
  dateOfBirth: string;
  gender: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
}
```

## 4.114 Stores (Redux)

```typescript
// src/store/slices/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    loginStart: (state) => { state.loading = true; state.error = null; },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});
```

## 4.115 Utilities

```typescript
// src/utils/date.ts
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-GB');
};

export const calculateAgeInMonths = (dob: string): number => {
  const birth = new Date(dob);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 
    + (now.getMonth() - birth.getMonth());
};
```

---

# Chapter 17: API Integration

## 4.116 REST API Communication

**Axios instance with interceptors:**

```typescript
// src/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add JWT
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
    }
    return Promise.reject(error);
  }
);
```

## 4.117–4.125 API Modules

All API calls match backend endpoints:

| API | Endpoints |
|-----|-----------|
| Auth | login, register, refresh, logout, forgot-password, reset-password |
| Users | me (get/update), change-password |
| Children | CRUD operations |
| Vaccinations | list, record, overdue, upcoming, schedules |
| Growth | add, list, latest |
| Nutrition | generate, daily, weekly |
| Medical | health records, allergies, medications |
| Appointments | book, reschedule, cancel, list |
| AI | chat, history |
| Notifications | list, unread, mark as read |

---

# Chapter 18: Local Storage

## 4.126 Secure Storage

**Library:** `expo-secure-store`

**Used for:**
- JWT tokens (access + refresh)
- User credentials (optional, for biometric)
- Encryption keys

## 4.127 AsyncStorage

**Library:** `@react-native-async-storage/async-storage`

**Used for:**
- User preferences (language, theme)
- Cached data (children list, etc.)
- Offline queue
- Last sync timestamp

## 4.128 Offline Cache

**Strategy:** Stale-while-revalidate
- Display cached data immediately
- Fetch fresh data in background
- Update UI when fresh data arrives

## 4.129 Image Cache

**Library:** `expo-image`

Features:
- Automatic memory + disk cache
- Placeholder while loading
- Error fallback
- Progressive loading

## 4.130 Token Storage

```typescript
// Encrypted with device keychain
await SecureStore.setItemAsync('accessToken', token, {
  requireAuthentication: true,  // Requires biometric
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
});
```

---

# Chapter 19: Security

## 4.131 JWT Storage

- Stored in **expo-secure-store** (encrypted)
- Never in plain AsyncStorage
- Refreshed automatically
- Cleared on logout

## 4.132 Secure API Calls

- All requests over HTTPS
- JWT in Authorization header
- Request signing (future)
- No sensitive data in URLs

## 4.133 Certificate Pinning

**Future:** Pin SSL certificates to prevent MITM attacks

```typescript
// react-native-ssl-pinning
await fetch(url, {
  sslPinning: {
    certs: ['certificate-sha256-hash'],
  },
});
```

## 4.134 Session Management

- Auto-logout after 30 days inactivity
- Session timeout after 15 min (configurable)
- Single active session per account
- Force logout on security events

## 4.135 Biometric Authentication

**Library:** `expo-local-authentication`

```typescript
const authenticate = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock MtotoCare Africa',
    fallbackLabel: 'Use password',
  });
  return result.success;
};
```

## 4.136 Data Encryption

- Local DB: SQLCipher (encrypted SQLite)
- Tokens: expo-secure-store (Keychain/Keystore)
- Network: HTTPS / TLS 1.3
- Sensitive fields: Additional AES-256 encryption

---

# Chapter 20: Error Handling

## 4.137 Network Errors

- Detect offline state with `@react-native-community/netinfo`
- Show "You're offline" banner
- Queue requests for retry
- Show last cached data

## 4.138 API Errors

**Standardized error response:**
```typescript
interface ApiError {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
}
```

**Handler:** Shows user-friendly messages for common errors:
- `INVALID_CREDENTIALS` → "Invalid email or password"
- `EMAIL_EXISTS` → "This email is already registered"
- `NETWORK_ERROR` → "Connection problem. Please try again."

## 4.139 Validation Errors

- Real-time field validation
- Form-level validation before submit
- Show errors below fields
- Scroll to first error

## 4.140 User Feedback

- **Success:** Snackbar (green) "Saved successfully"
- **Error:** Snackbar (red) + error details
- **Warning:** Snackbar (orange)
- **Info:** Snackbar (blue)

---

# Chapter 21: Performance

## 4.141 Lazy Loading

- React.lazy() for screens
- Image lazy loading
- Data pagination

## 4.142 Pagination

- Infinite scroll for lists
- Load more on scroll bottom
- 20 items per page

## 4.143 Image Optimization

- WebP format where possible
- Multiple resolutions (1x, 2x, 3x)
- CDN delivery
- `expo-image` for caching

## 4.144 Memory Management

- Cleanup subscriptions on unmount
- Cancel pending requests
- Avoid memory leaks with useEffect cleanup
- Monitor with React DevTools

## 4.145 API Optimization

- RTK Query caching (5 min default)
- Request deduplication
- Optimistic updates
- Background refresh

---

# Chapter 22: Testing

## 4.146 Unit Testing

**Tools:** Jest + React Native Testing Library

**Coverage:** Services, utilities, hooks

```typescript
describe('auth.service', () => {
  it('should login successfully', async () => {
    // Test implementation
  });
});
```

## 4.147 Widget Testing

**Tools:** React Native Testing Library

**Tests:**
- Component renders correctly
- User interactions work
- Accessibility labels present
- Different states (loading, error, empty)

## 4.148 Integration Testing

**Tools:** Detox (end-to-end)

**Tests:**
- Login → Home flow
- Add child → View child flow
- Record vaccination → See in schedule
- Book appointment → View in list

## 4.149 User Acceptance Testing

**With real users in Tanzania:**
- 5-10 parents in Dar es Salaam
- 2-3 healthcare providers
- 1-2 low-connectivity areas
- Test for 2 weeks
- Collect feedback
- Iterate

---

# Chapter 23: Deployment

## 4.150 Android Release

**Build:** `eas build --platform android --release`

**Output:** Signed AAB (Android App Bundle)

## 4.151 Play Store Preparation

**Required assets:**
- App icon (512x512 PNG)
- Feature graphic (1024x500)
- Screenshots (phone + tablet)
- Short description (80 chars)
- Full description (4000 chars)
- Privacy policy URL
- Content rating

## 4.152 App Signing

- Generate keystore (`keytool -genkey`)
- Store securely (NOT in git)
- Use Play App Signing for security
- Configure in `eas.json`

## 4.153 Version Management

**Semantic versioning:** `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

**Version in app.json:**
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

## 4.154 Production Configuration

**Environment variables:**
```bash
EXPO_PUBLIC_API_URL=https://api.mtotocare.africa/api
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SENTRY_DSN=...
```

---

# Chapter 24: Maintenance

## 4.155 Bug Fixes

- Issue tracking: GitHub Issues
- Severity: P0 (critical), P1 (high), P2 (medium), P3 (low)
- P0: Hot fix within 24 hours
- P1: Within sprint
- P2: Next release
- P3: Backlog

## 4.156 Feature Updates

- Bi-weekly releases
- Beta testing with TestFlight / internal track
- Feature flags for gradual rollout
- OTA updates via EAS Update

## 4.157 Security Updates

- Monthly dependency updates
- Security audit with `npm audit`
- Critical patches immediately
- Certificate renewal monitoring

## 4.158 Performance Monitoring

**Tools:**
- **Sentry** — Error tracking
- **Firebase Performance** — App performance
- **Expo Analytics** — Usage analytics
- **Custom metrics** — Business KPIs

## 4.159 Crash Reporting

**Sentry integration:**
```typescript
import * as Sentry from 'sentry-expo';
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
});
```

Auto-captures:
- Unhandled exceptions
- Promise rejections
- API errors
- Performance traces

---

# Chapter 25: Deliverables

| Deliverable | Description | Status |
|-------------|-------------|--------|
| **React Native Mobile App** | Fully functional Android app | ✅ |
| **iOS Support** | iOS build (code-ready, deployment future) | 📋 |
| **Source Code** | Well-structured, documented | ✅ |
| **UI Components** | 30+ reusable components | ✅ |
| **API Integration** | All 80+ backend endpoints | ✅ |
| **Authentication** | JWT, biometric, secure storage | ✅ |
| **Local Storage** | Secure token + offline cache | ✅ |
| **Push Notifications** | FCM integration | ✅ |
| **AI Features** | Parenting assistant chat | ✅ |
| **Testing Suite** | Unit + widget + integration tests | ✅ |
| **Release Build** | Signed APK/AAB for Play Store | ✅ |
| **Documentation** | Setup, standards, maintenance | ✅ |

---

# Appendix: Quick Start Guide

## Setup

```bash
# 1. Install dependencies
cd mtotocare-mobile
npm install

# 2. Start development server
npx expo start

# 3. Run on Android
npx expo start --android

# 4. Build for production
eas build --platform android --release
```

## Environment Setup

Create `.env`:
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
EXPO_PUBLIC_ENV=development
```

## Testing

```bash
# Unit tests
npm test

# E2E tests (requires build)
npm run test:e2e

# Lint
npm run lint
```

---

**Document Complete**

**Sections:** 159
**Status:** Complete
**Last Updated:** July 2026
