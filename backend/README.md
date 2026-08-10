# MtotoCare Backend

Spring Boot 2.7.18 + Java 21 REST API for MtotoCare Africa.

## Run

```bash
# dev (H2 in-memory, auto-seed admin)
mvn spring-boot:run

# production (PostgreSQL)
SPRING_PROFILES_ACTIVE=prod \
  DB_URL=jdbc:postgresql://localhost:5432/mtotocare \
  DB_USERNAME=mtotocare \
  DB_PASSWORD=... \
  mvn spring-boot:run
```

Deploying to Render (or Heroku/Railway): you can paste the platform's raw
database connection string (`postgresql://user:pass@host/db`) directly as
`DB_URL` — `RenderDatabaseUrlEnvironmentPostProcessor` auto-converts it into
a proper JDBC URL + separate credentials at startup. A real JDBC-formatted
URL (`jdbc:postgresql://...`) also works as-is, unchanged.

Health: `http://localhost:8080/api/auth/health`

## Configuration

| Profile | DB | Email | AI |
|---|---|---|---|
| `dev` (default) | H2 in-memory | sandbox mode (.eml files) | mock |
| `prod` | PostgreSQL (env vars) | real Gmail SMTP | groq or openai |

Environment variables:
- `SPRING_PROFILES_ACTIVE` — `dev` | `prod`
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER`, `JPA_DIALECT`
- `JWT_SECRET` — 64+ char random string
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` — for real emails
- `GROQ_API_KEY` — for real AI (free at https://console.groq.com/keys)
- `AI_PROVIDER` — `groq` (default if key set) | `openai` | `mock`
- `EMAIL_SANDBOX` — `true` to write .eml files instead of sending

## API base path

`http://localhost:8080/api`

## Public endpoints (no auth)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/auth/health` | Liveness check |
| `POST` | `/auth/login` | Login → returns JWT + refresh |
| `POST` | `/auth/register` | Sign up a new parent |
| `POST` | `/auth/refresh` | Exchange refresh for new JWT |
| `POST` | `/auth/forgot-password` | Send password reset email |
| `POST` | `/auth/reset-password` | Reset password with token |
| `GET` | `/h2-console/**` | H2 web console (dev only) |
| `GET` | `/actuator/health` | Spring Boot health |

## Authenticated endpoints (JWT in `Authorization: Bearer <token>`)

All other endpoints require a valid JWT.

### Users (`/users`)

- `GET /me` — current user
- `PUT /me` — update own profile
- `GET /` — list users (admin)
- `GET /{id}` — get user
- `PUT /{id}` — update user (admin)
- `DELETE /{id}` — delete user (admin)
- `PUT /{id}/activate` — activate (admin)
- `PUT /{id}/deactivate` — deactivate (admin)
- `POST /{userId}/roles` — assign role (admin)
- `DELETE /{userId}/roles/{role}` — remove role (admin)

### Admin (`/admin`)

- `GET /users` — list users
- `POST /users` — create user (auto-creates Doctor profile if DOCTOR role)
- `GET /facilities` — list all facilities
- `POST /facilities` — create facility
- `DELETE /facilities/{id}` — delete facility
- `GET /stats` — system stats (user/facility counts)
- `GET /settings`, `PUT /settings` — system settings
- `GET /audit-logs` — audit log

### Children (`/children`)

- `GET /` — list my children
- `POST /` — add a child
- `GET /{id}` — get child
- `PUT /{id}` — update child
- `DELETE /{id}` — delete child

### Vaccinations (`/vaccinations`)

- `GET /schedules` — all vaccination schedules
- `GET /schedules/active` — only active
- `GET /child/{childId}` — a child's vaccinations
- `GET /overdue` — overdue vaccinations
- `POST /child/{childId}` — record a vaccination

### Growth (`/growth`)

- `POST /child/{childId}` — add growth record
- `GET /child/{childId}` — get all for child
- `GET /child/{childId}/latest` — get latest

### Nutrition (`/nutrition`)

- `POST /child/{childId}/generate` — generate meal plan
- `GET /child/{childId}/daily` — today's meals
- `GET /child/{childId}/weekly` — week plan

### Appointments (`/appointments`)

- `GET /` — my appointments
- `GET /upcoming` — upcoming only
- `GET /my` — my (alias)
- `GET /{id}` — get appointment
- `POST /` — book
- `PUT /{id}/confirm` — confirm
- `PUT /{id}/cancel?reason=...` — cancel
- `PUT /{id}/reschedule` — reschedule
- `PUT /{id}/complete?notes=...` — mark complete
- `PUT /{id}/no-show` — mark no-show
- `PUT /{id}/start` — start visit

### Doctors (`/doctors`)

- `GET /` — list doctors
- `GET /{id}` — get doctor
- `GET /user/{userId}` — find by user id
- `GET /me/patients` — my patients (provider)
- `GET /me/appointments` — my appointments (provider)
- `PUT /me/availability` — set on/off duty

### Facilities (`/facilities`)

- `GET /` — list facilities
- `GET /{id}` — get facility
- `GET /region/{region}` — by region
- `GET /type/{type}` — by type
- `POST /` — create
- `PUT /{id}` — update
- `DELETE /{id}` — delete

### AI (`/ai`)

- `POST /chat` — chat with AI
- `GET /conversations` — list history
- `GET /history` — paginated history
- `DELETE /history` — clear history
- `GET /health` — health

### Notifications (`/notifications`)

- `GET /` — list mine
- `GET /unread` — unread only
- `GET /unread/count` — count
- `PUT /{id}/read` — mark read
- `PUT /read-all` — mark all read

### Allergies (`/allergies`)

- `GET /child/{childId}` — list for child
- `GET /child/{childId}/critical` — only critical
- `POST /child/{childId}` — add
- `PUT /{id}` — update
- `DELETE /{id}` — delete

### Medications (`/medications`)

- `GET /child/{childId}` — list for child
- `GET /child/{childId}/active` — only active
- `POST /child/{childId}` — add
- `PUT /{id}` — update
- `PUT /{id}/discontinue` — discontinue
- `DELETE /{id}` — delete

### Diagnoses (`/diagnoses`)

- `GET /child/{childId}` — list
- `POST /child/{childId}` — add
- `PUT /{id}` — update

### Reports (`/reports`)

- `GET /child/{childId}/health-summary` — child health report
- `GET /clinic` — clinic-level report
- `GET /vaccination-coverage` — coverage report

### Other

- `POST /auth/change-password` — change own password
- `POST /auth/logout` — logout
- `POST /auth/logout-all` — logout everywhere
- `GET /auth/sessions` — active sessions
- `DELETE /auth/sessions/{id}` — revoke session
- `POST /auth/verify-email` — verify email
- `GET /users/me/appointments` — my appointments
- `GET /users/me/patients` — my patients
- `GET /analytics/dashboard` — admin dashboard stats
- `GET /analytics/child/{id}/summary` — child summary
- `GET /analytics/vaccination-coverage` — coverage
- `GET /analytics/population` — population stats

## Build

```bash
mvn clean package -DskipTests
# JAR at: target/mtotocare-backend-1.0.0.jar
java -jar target/mtotocare-backend-1.0.0.jar
```

## Tech stack

- Spring Boot 2.7.18, Spring Security, Spring Data JPA
- Java 21
- Lombok 1.18.42
- H2 (dev) / PostgreSQL (prod) via Flyway
- JJWT 0.11.5
- Spring Boot Mail (Gmail SMTP)
- Groq / OpenAI HTTP client (custom, no SDK)
- springdoc-openapi-ui 1.6.15 (Swagger at /swagger-ui.html)
