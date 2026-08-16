# Database

## Files

- `schema.sql` — Production PostgreSQL schema (30 tables)
- `seed-data.sql` — Seeds only the admin user
- `TABLES_REFERENCE.md` — Column-by-column reference

## Production setup (PostgreSQL)

```bash
psql -U mtotocare -d mtotocare -f schema.sql
psql -U mtotocare -d mtotocare -f seed-data.sql
```

## Flyway migrations (prod only)

Flyway is disabled in the `dev` profile — H2 (in-memory) uses Hibernate's
`ddl-auto: update` to auto-create tables from the JPA entities instead.
Migrations only run against the real database in the `prod` profile. Files
in `backend/src/main/resources/db/migration/`:

- V1__init_schema.sql — initial schema
- V2__seed_tanzania_epi.sql.disabled — disabled (we don't seed demo data)
- V4–V16 — incremental tables and fields (clinical, ANC, milestones,
  nutrition/growth assessment fields, etc.)

The `.disabled` extension tells Flyway to skip that file (already-applied DBs won't break).

## What's seeded

**Only one user** — the admin:
- `admin@mtotocare.africa` / `Admin123!`

Everything else is created by the admin from the web admin portal:
- **Doctors** — Users → Add User with role DOCTOR
- **Facilities** — Facilities → Add Facility
- **Parents** — register through the mobile app
- **Children** — added by parents
- **Vaccinations** — recorded by providers

## What the schema covers

1. **Identity** — users, user_roles, sessions, password_reset_tokens
2. **Children** — children, allergies, medications, diagnoses, growth_records
3. **Health** — health_records, vaccinations, vaccination_schedule
4. **Appointments** — appointments
5. **Providers** — doctors, facilities, healthcare_workers
6. **Pregnancy** — pregnancies, anc_visits
7. **Development** — development_milestones
8. **AI** — ai_conversations
9. **Notifications** — notifications, devices
10. **Sync** — sync_logs
11. **Compliance** — consents, audit_logs
12. **Settings** — user_settings, system_settings
13. **Files** — file_uploads
14. **Emergency** — emergency_contacts

## Reset for testing

```sql
DROP DATABASE mtotocare;
CREATE DATABASE mtotocare;
```
```bash
psql -U mtotocare -d mtotocare -f schema.sql
psql -U mtotocare -d mtotocare -f seed-data.sql
```

Or on Render.com: open the database shell and run:
```sql
TRUNCATE users, doctors, facilities, children, vaccinations, growth_records,
         appointments, ai_conversations, sessions, password_reset_tokens,
         allergies, medications, diagnoses, notifications, attachments,
         sync_logs, consents, system_settings, devices, emergency_contacts,
         milestones, pregnancies, anc_visits, development_milestones,
         healthcare_workers RESTART IDENTITY CASCADE;
```

Then restart the backend — `DataInitializer` re-seeds admin.
