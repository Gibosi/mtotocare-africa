# MtotoCare Africa — Fix & Feature Delivery (2026-08-05)

## 1. Admin: "Delete user" unexpected error — FIXED
`children.parent_id` is `ON DELETE RESTRICT`. Deleting a parent with any
children (even soft-deleted ones) threw a raw `DataIntegrityViolationException`
that the generic handler reported as "An unexpected error occurred."

- `UserService.deleteUser()` now cascade-deletes the user's children first
  (their own vaccination/growth/appointment/etc. records cascade automatically
  at the DB level), then deletes the user.
- `AdminController.deleteUser` now delegates to the fixed service method
  instead of duplicating the old broken logic.
- `ChildRepository.findByParentId` added.
- `GlobalExceptionHandler` now has a dedicated `DataIntegrityViolationException`
  handler returning a clear 409 message instead of a generic 500, for any
  future FK conflict.

## 2. Meal plan nutrition always constant after regeneration — FIXED
Two root causes: the generator was 100% static (same 4 meals forever per age
bracket), and the JPA entity never mapped several DB columns that already
existed (`meal_type`, `meal_name`, `plan_date`, `calories_kcal`).

- `NutritionService.generateDaily()` now tries the real AI provider first
  (allergy-aware, told the previous plan so it varies the output), and falls
  back to a rotating set of 3 curated meal variants per age bracket if no AI
  provider is configured — "Regenerate" always changes something now.
- `NutritionPlan` entity now maps `planDate`, `mealType`, `mealName`,
  `description`, `caloriesKcal`.
- Migration `V15__add_nutrition_plan_fields.sql` reconciles `nutrition_plans`
  with the columns the entity actually uses (these existed in the "current"
  schema doc but had never landed in a real Flyway migration).

## 3. Vaccination tracking not flowing from clinicians to parents — FIXED
`VaccinationService` had working `recordVaccination()` / `scheduleAllForChild()`
methods, but neither was ever exposed on a controller endpoint — so the
"record a dose" action that both the mobile provider screen and the web
frontend already called (`POST /vaccinations/child/{childId}`) 404'd, and
`GET /vaccinations/upcoming` (used by parent home screens) didn't exist either.

- Both endpoints added to `VaccinationController`, restricted to clinical
  roles (`DOCTOR`, `NURSE`, `MIDWIFE`, `CHW`, `ADMIN`) for recording; anyone
  authenticated can read.
- **Web frontend was read-only** for vaccinations and medications (no way to
  actually record anything from the provider portal). Added a full
  "Record Vaccination" modal and "Add Medication" modal to
  `pages/provider/PatientDetail.jsx`.
- **Mobile bug found while auditing this**: five inline forms in the provider
  patient-detail screen (growth, vaccination, diagnosis, medication, allergy)
  had `setTimeout(() => { onDone }, 1000);` — referencing the callback
  instead of calling it, so after saving, the form never closed or the list
  never refreshed. Fixed all five to `onDone();`.

## 4. Growth chart always showing "0m" — FIXED
`calculateAgeInMonths()` always measures *from a date to right now*. The
chart was calling it with the measurement date instead of the child's date
of birth, so it computed "months since the measurement was taken" (≈0)
instead of the child's age at that measurement.

- Added `ageInMonthsAt(dob, referenceDate)` to `src/utils/date.ts` and
  switched `growth.tsx` to use it (found and fixed in two places — the
  chart labels and the "All Records" list, which had the same bug).

## 5. WHO Child Growth Assessment Module — NEW
`growth_records` already had `weight_for_age_z_score` / `height_for_age_z_score`
/ `weight_for_height_z_score` columns from the original migration, but the
code never computed them ("Simplified — production would use WHO Z-scores").

Implemented for real, using the **official WHO Child Growth Standards LMS
reference tables** (Multicentre Growth Reference Study, 2006), sourced from
WHO's own `WorldHealthOrganization/anthro` R package and verified against
known reference values (e.g. median birth weight for boys = 3.3464 kg):

- **Z-score engine** (`growth/who/Lms.java`, `WhoGrowthStandards.java`):
  proper LMS formula, daily-precision age lookups (0–1826 days, both sexes),
  0.1 cm precision for weight-for-length/height.
- **WHO classification + app-level triage** (`growth/who/GrowthClassifier.java`):
  official WHO cutoffs for WAZ/HAZ/WHZ/BAZ (severely underweight/stunted/
  wasted, normal, overweight, obese), plus a clearly-labeled app-level risk
  stratification (LOW/MODERATE/HIGH/CRITICAL) and 0–100 health score — these
  two are explicitly documented as heuristics, not WHO-published metrics.
- **Growth trend** (IMPROVING/STABLE/FALTERING) vs. the child's previous
  assessment.
- **AI-generated clinical summary** (explainable — plain-language explanation
  of the numbers and recommendation), with a templated fallback if no AI
  provider is configured.
- **Emergency detection & referral**: clinician-reportable oedema / severe
  dehydration flags, severe wasting, etc. all feed into `emergencyFlag` /
  `referralRecommended`.
- Migration `V16__add_who_growth_assessment_fields.sql` adds `age_in_days`,
  `bmi_for_age_z_score`, `risk_level`, `health_score`, `growth_trend`,
  `referral_recommended`, `emergency_flag`, `oedema`, `severe_dehydration`,
  `ai_summary` to `growth_records`.
- UI: WHO Z-score badges, risk/trend pills, and the AI summary added to both
  the **mobile** growth screen and the **web** provider patient-detail growth
  tab, including MUAC + clinical danger-sign inputs on both add-measurement
  forms. Added a "+ Add Measurement" flow to the web portal (didn't exist
  before — web could only view growth records, not add them).
- `database/schema.sql` (the standalone reference doc) reconciled to match
  the real Flyway-managed schema, including fixing a pre-existing column-name
  mismatch (`weight_for_age_z` in the doc vs. the real `weight_for_age_z_score`).

## 6. Mobile crash: "Property 't' doesn't exist" — FIXED
`AppointmentCard` in `app/appointments.tsx` used the translation function
`t()` without calling `useLanguage()` itself (it's a sibling component to
the screen that has it, not nested inside it). Added the missing hook call.
Audited the rest of the mobile app for the same pattern — this was the only
instance.

## 7. Mobile route warning: "No route named 'child-records'" — FIXED
`app/_layout.tsx` declared `<Stack.Screen name="child-records" />`, but no
such route exists — only `child-records/index`, `/add`, `/[id]`. Fixed the
screen name to `child-records/index`, and removed two dead duplicate files
(`add-record.tsx`, `record.tsx`) that were byte-for-byte copies of
`add.tsx`/`[id].tsx` left over from an earlier rename.

## Not in scope for this pass
The original WHO module request also listed developmental-milestone delay
detection tied into this same assessment, EMR/HIS integration, and
national digital-health-platform integration. `development` module
(milestones) already exists as a separate feature in the app; wiring it
into this same assessment record, plus the external-integration items,
would need a dedicated follow-up — they're substantial enough that folding
them in here risked rushing the core Z-score engine, which needed to be
right.

---

# Follow-up: full error-hunting pass (2026-08-06)

Ran real tooling instead of just reading code: `npm install` + production
build + dev server for the frontend (all clean — confirms a local PostCSS
error some users hit is environment-specific, not a bad file), and a full
`tsc --noEmit` typecheck across the entire mobile app, which went from
**52 real type errors down to 0**. Maven Central isn't reachable from this
environment so the backend could only get a rigorous static review (full
brace/paren balance sweep across every `.java` file, cross-checked call
sites against actual method signatures) — a real `mvn compile` is still
recommended before deploying.

Highlights (full list in git history / diff):

- **`theme.typography` didn't exist at all**, but was used by the shared
  `Loading`, `EmptyState`, and `ErrorMessage` components used across 14
  files app-wide — any loading/empty/error state with a message would
  crash with `Cannot read properties of undefined`. Added a real
  typography scale to the theme.
- **5 more instances of the `useToast()`-not-called bug** (same shape as
  the `t()` bug found earlier): `AddGrowthForm`, `AddVaccinationForm`,
  `AddDiagnosisForm`, `AddMedicationForm`, `AddAllergyForm` in the provider
  mobile screen all called `showError`/`showSuccess` without importing the
  hook. Every save (success *or* failure) in any of these 5 forms would
  crash. Fixed all five.
- **`AIChatScreen.tsx`** (reachable via `/ai-chat`) imported a type and
  called a method (`HealthArticle`, `aiOfflineLibrary.search()`) that had
  been refactored away, and read `response.data.data.aiResponse` when the
  real field is `content`. Rewrote the offline-fallback path to match the
  actual `aiOfflineLibrary.answer(question, child)` API.
- **Mobile `NutritionPlan` type was missing `feedingFrequency`/
  `foodsToAvoid`** even though the backend already returns them (see the
  nutrition fix above) — the mobile type just hadn't been updated.
- **`choose-language.tsx`** called the translate function with an
  unsupported 3rd argument, silently dropping the intended fallback text.
- An entire unused **offline-first subsystem** (`appInitializer`,
  `connectivity`, `syncManager`, `offlineAuth`, `repository`) had several
  calls to methods that don't exist on their target services
  (`connectivity.getState()`, `.initialize()`, `.destroy()`,
  `syncManager.runSync('login')` with an unsupported argument, etc.). It's
  never actually invoked from the app today, so it wasn't live-crashing
  anyone, but it's clearly meant to be the app's offline-boot sequence per
  its own doc comments — fixed all the call sites to match the real APIs
  so it's ready to be wired into the root layout when that work happens.
- `tsconfig.json`: added an explicit `module: esnext` (dynamic imports in
  `network.ts` were valid code but tripped `tsc`'s stricter default).
- `i18n/index.ts`: `i18nReady` was typed `Promise<void>` but assigned a
  `Promise<TFunction>` — cosmetic type mismatch, fixed by coercing with
  `.then(() => undefined)`.

---

# Follow-up: full spec audit against the WHO Growth Assessment Module (2026-08-06)

Went through every bullet in the requirements doc against the actual code
(not just my notes, which had gone stale — several items I'd previously
flagged "not in scope" turned out to already be built). Status below.

## Already fully implemented (verified against code)
- **Core Features**: real WHO LMS Z-scores (WAZ/HAZ/WHZ/BAZ), WHO
  classification, color-coded UI badges, persisted to the child's growth
  record — all confirmed working.
- **AI Features**: personalized nutrition recommendations (nutrition
  module), automatic clinical summary, growth trend prediction
  (Improving/Stable/Faltering), Low/Moderate/High/Critical risk
  stratification, explainable summaries, 0–100 health score.
- **Child Development**: `DevelopmentMilestoneService` already covers
  motor/language/cognitive/social milestones with auto-delay-detection
  (flags a milestone DELAYED once it's 2+ months overdue) and
  per-category recommended interventions — and it's folded into the
  growth assessment's risk stratification, so a developmental delay bumps
  risk the same way a low Z-score does.
- **Clinical Support**: referral recommendations, emergency detection
  (severe wasting, oedema, severe dehydration), and automatic follow-up
  appointment + reminder scheduling for at-risk children — all present in
  `GrowthService`.
- **Technical — WHO standard updates without code changes**: already true
  by construction — the LMS reference tables are loaded from CSV resource
  files at startup, not hardcoded in Java. Updating to a future WHO
  standard means replacing the CSV, no code change.

## Fixed this pass (were genuinely missing)
- **Provider dashboards** (nutrition status, vaccination coverage, growth
  trends, high-risk children) — the existing dashboard only showed patient
  count and appointments. Added `AnalyticsService.getProviderDashboard()` +
  a new `/analytics/provider-dashboard` endpoint (role-gated to clinical
  staff) returning nutrition status distribution, risk-level counts, a
  sorted high-risk children list, and vaccination coverage. Added a
  matching panel to the web provider dashboard.
- **Anonymized reports for research/public health** — `getPopulationStats()`
  only had demographic counts (gender, age band), missing the actual
  public-health indicators this module exists to produce. Added
  malnutrition prevalence (stunting/wasting/underweight/overweight/obese,
  counts + percentages) computed from each child's latest assessment —
  aggregate only, no child-identifying fields leave the endpoint.

## Known gaps — flagging honestly rather than rushing
- **WHO growth charts (percentile curve overlay)**: the growth chart shows
  the child's own weight/height trajectory, but doesn't overlay it against
  WHO's percentile reference curves the way a clinical growth chart does.
  The underlying LMS data needed to draw those curves is already loaded on
  the backend — this would need a new endpoint to expose percentile-line
  data plus a charting change on the frontend.
- **Offline functionality with automatic sync**: this turned out to be a
  more significant gap than my last update suggested. There's a complete,
  well-built offline-first subsystem (`appInitializer`, `connectivity`,
  `syncManager`, `offlineAuth`, a repository layer with local SQLite +
  sync queue) — I found and fixed several real bugs in it last pass — but
  **it's never actually wired into the app**. The live app's auth/init
  path is a much simpler Redux thunk that just persists a token; it
  doesn't use the local database or sync queue at all, so today the app
  requires a live connection for most data. Wiring the offline subsystem
  in is a real, non-trivial integration (replacing direct API calls with
  repository calls app-wide, switching the init sequence) that I didn't
  want to force through without device/simulator testing — doing it
  blind risked breaking app boot for everyone to fix something that
  isn't currently live-broken.
- **Encrypted storage**: auth tokens are genuinely encrypted (iOS
  Keychain / Android Keystore via `expo-secure-store`). The local SQLite
  cache used by the (currently unwired) offline subsystem is not
  encrypted — moot until that subsystem is wired in, but worth doing
  together with it (e.g. SQLCipher) rather than separately.
- **Interactive child health timeline**: growth history is chartable and
  vaccination/diagnosis/appointment history all exist as separate lists,
  but there's no unified cross-module timeline view combining them.
- **EMR/HIS and national digital-health-platform integration**: not
  attempted — this needs external standards (e.g. HL7 FHIR) and is a
  project-level integration effort in its own right, not something to
  bolt on inside this module.

---

# Follow-up: full frontend/mobile ↔ backend endpoint audit (2026-08-07)

No master FR/NFR requirements document exists in the delivered codebase —
only 14 scattered ID references in code comments. Rather than guess at
numbers that can't be verified, did an exhaustive automated audit instead:
extracted all 163 backend endpoint mappings and every single API call in
both the web frontend and mobile app, then cross-referenced them. This is
the same category of bug that caused the original vaccination-recording
issue (endpoint referenced by a client but never implemented), so it was
worth checking systematically rather than only when something's reported.

**Real, previously-invisible bugs found and fixed:**

- **`PUT /notifications/read-all` didn't exist** — the mobile "mark all as
  read" button called it and would fail every time. Added a real bulk-update
  endpoint (`NotificationRepository.markAllAsRead`).
- **Notifications never actually displayed in the mobile app, silently.**
  `GET /notifications` returned a raw array; the mobile Redux thunk expected
  a paginated `{content: [...]}` wrapper (`res.data.data?.content || []`),
  so it always fell back to an empty list regardless of how many
  notifications existed. No error, no crash — just a permanently empty
  inbox. Made the endpoint properly paginated (`PageResponse<Notification>`)
  to match what the client already expected, plus added the missing
  `GET /notifications/unread` list endpoint.
- **`GET /admin/sync/status` didn't exist** — the admin sync screen always
  silently showed zeros. Added a real endpoint backed by actual `sync_logs`
  aggregate data (pending/failed counts aren't tracked server-side yet since
  the sync protocol doesn't have clients report per-item failures, so those
  stay honestly at 0 rather than being fabricated; `syncedToday` is real).
- **`GET /nutrition/child/{id}/weekly` didn't exist** — called by the mobile
  weekly nutrition view. Added it (returns whatever's already been
  generated/persisted in that date range).
- **`GET /appointments/{id}` didn't exist** on either client (currently
  unused/dead code on both, but a real REST completeness gap and an easy
  fix). Added it, reusing the existing ownership-check logic.
- **`AdminController.getStats()` had a hardcoded `"children": 0`** instead
  of a real count — found while already in that file for the sync-status
  work. Fixed.

**Result**: every API call in both the web frontend and mobile app now has
a real, matching backend endpoint — verified by automated diff, not just
inspection.




---

# Follow-up: real build error from a live `mvn spring-boot:run` (2026-08-07)

The user ran an actual Maven build and hit ~100 compile errors. One was a
real bug I'd introduced: `UserService.deleteUser()` had `@Transactional`
duplicated on two consecutive lines (left over from my very first patch to
this method) — Java doesn't allow a non-repeatable annotation twice on the
same element, so this alone failed the whole build. Fixed.

The other ~95 errors were all "cannot find symbol" for Lombok-generated
methods (`getRoles()`, `getId()`, `builder()`, etc.) across files I never
touched (`User`, `AuditLog`, `Facility`, `Doctor`, `ApiResponse`) — verified
the affected classes genuinely have `@Getter/@Setter/@Builder` in source, so
this isn't a missing-annotation bug. That pattern (the annotated class
itself never errors, only *other* files that call its generated methods)
is the known signature of Maven reusing a stale `target/classes/*.class`
from an earlier partial build under incremental compilation — not a source
defect. Recommended the user run `mvn clean` before `mvn spring-boot:run`
to force a full recompile.

---

# Follow-up: real-device testing round (2026-08-08)

The user ran the actual apps and sent screenshots + a live bug list.
Everything below was confirmed against the real code (not guessed), fixed,
and re-verified with a real `tsc --noEmit` pass (0 errors) plus a full
backend brace/paren sweep.

## 1. AI Assistant giving generic canned responses — DIAGNOSED (no code bug)
Traced the full path: `AIService.chat()` tries the real LLM first and only
falls back to a templated response if that call returns null.
`AIClient.chat()` returns null immediately — without even attempting a
request — whenever the provider is `groq`/`openai` and the API key is
blank. `application.yml` already defaults `provider` to `groq`, but
`GROQ_API_KEY` was never set when the backend was started, so every
request silently fell back to the canned template. This single missing
env var also explains the non-varying nutrition regeneration and any
generic growth-assessment AI summaries — all three features share this
same `AIClient`. Fix: set `GROQ_API_KEY` (free tier, console.groq.com/keys)
before `mvn spring-boot:run`.

## 2. "Appointment booked does not seen by a doctor" — FIXED
Root cause: `GET /doctors/me/appointments` and `/doctors/me/patients` were
literally hardcoded stub placeholders (`return ApiResponse.success(List.of())`,
with a `// TODO: implement patient assignment` comment) — always empty,
regardless of real data. Implemented both for real, querying by the
doctor's own ID via a new `AppointmentRepository.findByDoctorIdOrderByAppointmentDatetimeAsc`.
Confirmed the parent booking flow already requires and sends `doctorId`,
so this now has real data to show.

## 3. Admin "can't delete user" — FIXED
The mobile admin Users screen had no delete action at all (only
activate/deactivate) — that was the "deny," the button simply didn't
exist. Added it with a confirmation dialog, wired to the already-fixed
cascading-delete endpoint. Web already had this.

## 4. Admin dashboard stats all showing "--" — FIXED
The backend, the web admin dashboard, and the mobile admin dashboard were
each using different, mutually inconsistent key names for the same stats
object (e.g. `children` vs `totalChildren`; no appointment/vaccination
counts existed on the backend at all). Standardized the backend response
and added real appointment/vaccination counts.

## 5. No patient or vaccine management for admin — BUILT
- `GET /children` was 100% parent-scoped — an admin/doctor/nurse/CHW user
  got an empty list (or their own zero children), not "all patients."
  Made it role-aware: admins and clinical staff now see every child;
  parents still only see their own. Same fix applied to `verifyOwnership`
  so admins can open any child's detail record, not just their own.
- Vaccine schedule (the EPI catalog itself — "BCG at birth" etc., as
  opposed to a specific child's doses) had **no admin API at all** —
  only the entity/repository existed, used internally to auto-generate
  each child's schedule. The mobile "Vaccines" quick action was a literal
  stub: `onPress={() => showError('Manage vaccine schedule')}` — it fired
  an error toast with the feature's own name instead of navigating
  anywhere (this was the red banner visible at the top of the admin
  dashboard screenshot). Built a full CRUD API
  (`VaccinationScheduleController`) and matching mobile screen.
  Also built a new "All Patients" admin screen.

## 6. Systemic routing bug — found in TWO tab groups, both fixed
`(provider)/_layout.tsx` and `(admin)/_layout.tsx` both use a custom Tabs
navigator with only some folder files explicitly declared as
`<Tabs.Screen>`. Expo Router still auto-discovers every `.tsx` file in
the folder and adds it as an *additional, undeclared tab* (Tabs don't
stack — a "detail" screen meant to be pushed on top instead silently
becomes a sibling tab with a "?" icon, as seen in the screenshots for
"patient-detail" — and in the admin dashboard's tab bar showing 7 items
when only 5 are declared, from `settings.tsx`/`sync.tsx` already quietly
having the same problem).
- Moved `(provider)/patient-detail.tsx` → top-level `provider-patient-detail.tsx`.
- Moved `(admin)/settings.tsx`, `sync.tsx` → `admin-settings.tsx`, `admin-sync.tsx`.
- Registered all of these as proper `<Stack.Screen>` entries in the root layout.
- Also fixed a real hang: the detail screen's `if (!id) return;` skipped
  loading but never set `loading = false`, so a missing/failed load spun
  forever. Added proper "no patient selected" / "couldn't load" states.
- **Caught during this fix**: moving files changed their folder depth, so
  their `../../src/...` imports needed to become `../src/...`. Missed
  this on the first pass — a full `npm install` + `tsc --noEmit` re-run
  caught it (`Cannot find module` on 5 files), which would have been a
  hard bundle-time crash on every one of those screens. Fixed and
  re-verified clean.

---

# Follow-up: two more real bugs (2026-08-08, second round)

## 1. "Doctor sees its patients but not the appointment booked" — FIXED (2 causes)
Two separate bugs contributing to this:
- **Mobile**: the provider appointments screen defaults to a "Today" tab
  with date-based filtering, while the Patients screen (fed from the same
  underlying data) has no date filter at all. A future-dated appointment
  correctly showed its patient but was invisible on the default "Today"
  view — not a data bug, a UX default. Fixed: on first load, if there's
  nothing for today but something upcoming, land on the "Upcoming" tab
  instead (only on initial load, not on manual pull-to-refresh, so it
  never overrides a tab the doctor deliberately chose).
- **Web**: found a completely separate, previously-undiscovered bug —
  `ProviderAppointments.jsx` called the generic `GET /appointments`
  endpoint, which is 100% parent-scoped (returns appointments for children
  where the caller is the *parent*). A doctor has no children of their
  own, so this always returned empty. The mobile app was already fixed to
  use the doctor-scoped `/doctors/me/appointments` in the previous round,
  but the web page was never touched and had the exact same root cause
  the mobile app originally had. Fixed to call `doctorApi.myAppointments()`
  (the endpoint already existed in the API layer, just wasn't used).

## 2. "Vaccination save button [doesn't work]" — FIXED
Root cause: `AddVaccinationForm` (mobile, provider patient-detail screen)
sent `administeredAt: new Date(date).toISOString()` — producing a full
ISO datetime string (`"2026-08-08T00:00:00.000Z"`) — but the backend's
`RecordVaccinationRequest.administeredAt` is typed `LocalDate` (date-only).
Jackson cannot bind a full datetime string to a `LocalDate` field, so
every single "Record Vaccination" submission failed with a 400 error.
`date` itself was already in the correct plain `YYYY-MM-DD` format (from
the existing `todayISO()` helper) — the bug was purely the unnecessary
`new Date(...).toISOString()` re-wrapping. Fixed to send `date` directly.

**Found the identical copy-paste bug in a second, sibling form while
checking for it**: `AddDiagnosisForm` had `diagnosedAt: new Date().toISOString()`
against a backend field that's also `LocalDate` — meaning "Save Diagnosis"
was equally broken. Fixed the same way. Checked the two remaining forms
(`AddAllergyForm`, `AddMedicationForm`) and the web equivalents for the
same pattern — both already correct, no further instances found.

---

# Follow-up: ported backend from MySQL to PostgreSQL (2026-08-09)

Deploy to Render failed at startup:
`Driver com.mysql.cj.jdbc.Driver claims to not accept jdbcUrl, postgresql://...`

Render's free managed database is PostgreSQL, not MySQL — but this backend
was built entirely for MySQL (driver, dialect, all 16 migrations). Rather
than send the user hunting for a separate MySQL host, ported the backend to
run on PostgreSQL, since it's Render's native free offering.

## What changed
- **`pom.xml`**: added the `org.postgresql:postgresql` driver (kept the
  MySQL driver too, in case of local MySQL use later — harmless to have
  both on the classpath). Flyway's PostgreSQL support is built into
  `flyway-core`, no extra module needed (unlike MySQL, which needs
  `flyway-mysql`).
- **`application-prod.yml`**: driver, dialect, and default URL switched to
  PostgreSQL.
- **All 16 Flyway migrations + `database/schema.sql`**: converted every
  MySQL-specific construct to PostgreSQL equivalents —
  `AUTO_INCREMENT` → `GENERATED BY DEFAULT AS IDENTITY`, dropped
  `ON UPDATE CURRENT_TIMESTAMP` (redundant — Hibernate's `@LastModifiedDate`
  already manages `updated_at` at the application layer, and Postgres has
  no inline equivalent syntax anyway), dropped MySQL-only `AFTER <column>`
  clauses from two of my own earlier `ALTER TABLE` migrations (V15, V16),
  fixed bare `DOUBLE` → `DOUBLE PRECISION` (Postgres requires the two-word
  form). Confirmed clean beforehand: no native SQL queries anywhere in the
  Java code (everything's JPQL/derived queries, dialect-agnostic), no
  MySQL-only INSERT syntax (`ON DUPLICATE KEY`, etc.) in the seed data, no
  inline `INDEX` clauses inside `CREATE TABLE` (a genuinely MySQL-only
  pattern Postgres doesn't support at all) — this schema was already
  written in a fairly portable style, which kept the port's actual risk
  surface small despite touching every migration file.
- **New: `RenderDatabaseUrlEnvironmentPostProcessor`**. The specific error
  above was caused by pasting Render's *raw* connection string format
  (`postgresql://user:pass@host/db`) directly into `DB_URL` — that's not a
  valid JDBC URL (JDBC needs `jdbc:postgresql://...` with credentials
  passed separately, not embedded). This runs before Spring reads any
  datasource config and auto-converts the raw form into a proper JDBC URL
  + separate username/password if it detects one — so this whole class of
  deploy failure can't recur. A real `jdbc:postgresql://...` URL still
  works unchanged.
- Updated `backend/README.md` and `database/README.md` /
  `TABLES_REFERENCE.md` (were giving MySQL commands as the primary
  production instructions — literally the commands that led to the
  original confusion) to reflect PostgreSQL, and fixed two unrelated
  pre-existing doc inaccuracies noticed along the way (a `sync_log` vs.
  `sync_logs` table-name typo, and a claim that Flyway runs in dev — it
  doesn't; dev uses H2 with Hibernate's `ddl-auto: update` instead).

## Not changed
Dev profile (H2 in-memory) is untouched — it doesn't run Flyway at all,
so it was never affected by the MySQL/Postgres question either way.

---

# Follow-up: AI relevance, parent-healthworker visibility, security audit (2026-08-10)

## AI Assistant — real fixes, not just the missing API key from before
- **Found the most likely root cause of "AI reply doesn't match what was asked":**
  the model hardcoded in `AIClient.java` (`llama-3.3-70b-versatile`) was
  deprecated by Groq (announced June 17, 2026). If your account is past
  the shutdown date, every real API call fails outright — silently
  falling back to a crude 7-template keyword-matcher, which explains
  generic, off-topic replies. Updated to Groq's current recommended
  replacement, `openai/gpt-oss-120b`.
- **Fixed a real bug**: the Swahili system prompt checked
  `"M".equals(gender)` to decide "mvulana" (boy) vs "msichana" (girl), but
  gender is stored as `"MALE"`/`"FEMALE"` — so it always said "girl" in
  Swahili, even for boys. Fixed to `"MALE".equals(gender)`.
- **New: `ChildHealthKnowledgeBase.java`** — a structured, WHO/Tanzania
  Ministry of Health-aligned knowledge base (14 topics: vaccination,
  nutrition, fever, diarrhea, cough/cold, growth, pregnancy, malnutrition,
  development, breastfeeding, skin/rash, sleep, first aid, hygiene), each
  in English and Swahili. This is injected into the **real AI's system
  prompt** for the detected topic (so it answers with the specific,
  Tanzania-relevant facts requested rather than generic advice), and also
  powers a dramatically better **offline fallback** for when no AI
  provider is reachable — replacing the old 7-template system with much
  more specific content across all 14 topics, plus a smarter default reply
  when the topic doesn't match anything (points at what it *can* help
  with, instead of a dead-end non-answer).
- Expanded `detectIntent()` from 7 to 14 topic categories with many more
  bilingual keywords, so more questions get properly routed instead of
  falling into the generic bucket.
- Added an explicit instruction to both the streaming and non-streaming
  system prompts: answer the specific question asked, don't default to a
  generic overview; a plain greeting gets a brief greeting back, not
  unrelated health advice — directly addressing "reply is not the same as
  what asked."

## Parent ↔ health worker visibility — the actual "connection" gap
Audited what a parent can see of what a health worker has done for their
child, since the pieces existed but weren't all connected:
- **"Health Visits" and "Lab Results" in the parent app's Medical Records
  screen were permanent, hardcoded stub messages** ("Visit history will
  appear here...") — even though doctors can already record diagnoses via
  the provider app, and lab-result file uploads already exist as a
  backend feature (`attachments` with `category=LAB_RESULT`), neither was
  ever actually surfaced to the parent. Wired both up for real: "Health
  Visits" now shows the child's actual diagnosis history (condition,
  severity, treating doctor, treatment plan) and "Lab Results" shows
  uploaded lab documents.
- Added the missing mobile `Attachment` type and `attachmentsApi` needed
  to support this.

## Security: missing ownership checks (found while wiring the above)
While connecting the parent app to `GET /diagnoses/child/{id}` and
`GET /attachments/child/{id}`, found **neither endpoint checked that the
caller was actually allowed to see that child's data** — any authenticated
user could view any child's diagnoses or attachments (including lab
results, birth certificates) by ID. Audited every other `getForChild`-style
endpoint for the same gap and fixed all of them found lacking it:
`AttachmentService`, `DiagnosisService`, `MedicationService`,
`AllergyService`, `GrowthService`, `HealthRecordService`. All now verify
the caller is either the child's parent or clinical/admin staff before
returning data. (`DevelopmentMilestoneService` already had this check —
confirmed, not modified.)

## Widespread invisible-UI bug — found via systematic sweep, not by chance
Same root-cause pattern as two bugs fixed in earlier rounds
(`theme.typography` missing, `theme.X` vs `theme.colors.X` in
`AppointmentCard`) — but this time swept the **entire** mobile codebase
for every remaining instance instead of fixing one-off as found. Result:
**57 more instances across 6 files** — admin dashboard, provider dashboard,
provider profile, admin settings, admin sync status, and all 5 "Add X"
forms in the provider patient-detail screen. Every one of these accessed
theme colors as `theme.text`/`theme.primary`/etc. instead of
`theme.colors.text`/`theme.colors.primary`, silently resolving to
`undefined` — meaning text, icons, and borders across some of the most-used
screens in the app (both admin and provider dashboards) were rendering
with broken/invisible colors rather than the intended theme, with no error
or crash to signal it. Fixed all 57 with a verified, targeted replacement
(re-checked afterward that zero instances remain anywhere in the codebase).

## Final verification
- Full mobile `tsc --noEmit`: 0 errors (fresh reinstall).
- Full web `vite build`: clean (fresh reinstall).
- Full backend brace/paren sweep: clean (one confirmed false positive from
  literal `)` characters in numbered-list strings, verified harmless
  repeatedly this session).
- Full endpoint cross-reference (163+ backend routes vs. every API call in
  both clients): 100% match, no orphaned client calls.

## Honest scope note
This pass focused on the concrete, verifiable issues raised (AI relevance,
parent/health-worker data visibility, and — since I was already auditing
data-access code — a security sweep and a systematic UI-bug sweep that
both turned out to be far more valuable than anticipated). A full manual
walkthrough of literally every admin and health-worker screen against a
complete "what should this role be able to do" checklist is a larger
exercise than fits in one pass; the endpoint-level audit above confirms
every existing UI action has working backend support, but doesn't
guarantee every activity a real admin or clinician would eventually want
already has a UI built for it (e.g., healthcare-worker credential
verification/approval workflow, a unified cross-module patient timeline,
and bulk/CSV reporting exports were not found to exist and were not built
in this pass — worth a dedicated follow-up if needed).

---

# Follow-up: healthcare-worker credential verification workflow (2026-08-11)

Addressed the first item from the "honest gap" list: a real verification
workflow for clinical accounts.

## What was found
Only admins can create clinical-role accounts (a reasonable gate already
in place) — but the actual license-number field was being **auto-generated
as a fake placeholder** (`"TZ-" + System.currentTimeMillis()`) instead of
capturing the healthcare worker's real medical license. There was no
concept of "verified" at all — a fabricated ID looked identical to a real,
checked one everywhere in the system.

While fixing this, found a second, separate account-creation code path
(`UserService.createUser`, backing `POST /users` — unused by any current
UI, both web and mobile call `POST /admin/users` instead) that had an even
worse version of the same gap: it assigned clinical roles without creating
a `Doctor` profile at all, meaning such an account would have the DOCTOR
role but be completely non-functional as a doctor (no appointments, not
listed for booking, etc.) — a latent trap for any future code that used
this endpoint. Fixed both paths consistently.

## What changed
- **`Doctor.credentialsVerified`** (new column, migration `V17`) — defaults
  `false` for every new and existing account.
- Both user-creation paths now **require a real license number** for
  clinical roles (rejected with a clear error if missing or already
  registered to someone else), accept a specialization and a specific
  facility selection (previously always silently grabbed whichever
  facility happened to be first in the database), and create the account
  as unverified.
- New endpoints: `PUT /admin/doctors/{id}/verify` and `/unverify` —
  audit-logged, admin-only.
- **Web**: the admin "Create User" form now shows a license number
  (required), specialization, and facility picker whenever a clinical role
  is checked, with a clear note that the account starts unverified. The
  users table shows a "✓ Credentials verified" / "⚠ Unverified — click to
  verify" toggle badge for every clinical-role user.
- **Mobile**: admin previously had **no way to create a user at all**
  (view/activate/deactivate/delete only) — built the missing create-user
  form from scratch, matching the web version (role picker, conditional
  license/specialization/facility fields, validation), plus the same
  verification badge/toggle on each user card.

## Also fixed while in this file
`database/schema.sql` — the standalone reference doc — had **57 inline
`INDEX` clauses inside `CREATE TABLE` statements**, a MySQL-only pattern
that PostgreSQL does not support at all. This was missed during the
MySQL→PostgreSQL port two rounds ago (the actual Flyway migrations were
already clean; this was isolated to the reference doc) — meaning the exact
`psql -f schema.sql` command given in the README at the time would have
failed immediately on the first table. Converted all 57 to separate
`CREATE INDEX` statements after each table, verified table count (30) and
paren balance both check out, and confirmed no dangling trailing commas
from the extraction.

## Verification
Full mobile `tsc --noEmit`: 0 errors (fresh reinstall). Full web
`vite build`: clean (fresh reinstall). Full backend brace/paren sweep:
clean (one confirmed-harmless false positive, as in every previous round).

## Still open from the original "honest gap" list
Unified cross-module patient timeline, and bulk/CSV reporting exports —
not addressed this round; the verification workflow above and the
schema.sql fix took priority as the more safety-relevant and more broadly
impactful items respectively.
