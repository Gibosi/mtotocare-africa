# MtotoCare Africa — Database Tables Reference

This document maps every JPA entity to its database table and Flyway migration file.

## Tables Inventory (33 total)

### Core Domain (V1 — original)
| Table | Entity | Module |
|-------|--------|--------|
| `users` | `User` | user |
| `user_roles` | `@ElementCollection` on User | user |
| `facilities` | `Facility` | facility |
| `doctors` | `Doctor` | doctor |
| `doctor_languages` | `@ElementCollection` on Doctor | doctor |
| `children` | `Child` | child |
| `vaccination_schedule` | `VaccinationSchedule` | vaccination |
| `vaccinations` | `Vaccination` | vaccination |
| `appointments` | `Appointment` | appointment |
| `growth_records` | `GrowthRecord` | growth |
| `nutrition_plans` | `NutritionPlan` | nutrition |
| `health_records` | `HealthRecord` | medical |
| `ai_conversations` | `AIConversation` | ai |
| `notifications` | `Notification` | notification |
| `file_uploads` | legacy (deprecated) | — |
| `audit_logs` | (legacy log table) | common |

### Clinical Extensions (V4)
| Table | Entity | Module |
|-------|--------|--------|
| `diagnoses` | (legacy) | medical |
| `medications` | (legacy) | medical |
| `prescriptions` | (legacy) | medical |
| `prescription_items` | (legacy) | medical |
| `allergies` | (legacy) | medical |

### Pregnancy & Maternity Care (V5) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `pregnancies` | `Pregnancy` | pregnancy |
| `anc_visits` | `AncVisit` | anc |

### Child Development (V6) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `development_milestones` | `DevelopmentMilestone` | development |

### Safety & Security (V7, V11) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `emergency_contacts` | `EmergencyContact` | emergency |
| `auth_sessions` | `Session` | auth |
| `password_reset_tokens` | `PasswordResetToken` | auth |

### Devices & Files (V8) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `devices` | `Device` | device |
| `attachments` | `Attachment` | attachment |

### Privacy & Preferences (V9) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `consents` | `Consent` | consent |
| `app_settings` | `AppSettings` | user |

### Healthcare Directory (V10) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `healthcare_workers` | `HealthcareWorker` | user |

### Auth & Sync (V11, V12) — NEW
| Table | Entity | Module |
|-------|--------|--------|
| `auth_sessions` | `Session` | auth |
| `password_reset_tokens` | `PasswordResetToken` | auth |
| `sync_logs` | `SyncLog` | sync |

## Migration Strategy

| Profile | DB | Flyway | JPA |
|---------|----|----|-----|
| **dev** | H2 in-memory | **disabled** | `ddl-auto: update` |
| **prod** | MySQL 8 | **enabled** | `ddl-auto: validate` |

In dev, JPA auto-creates the schema from entities. In prod, Flyway runs V1–V11 to create the same tables.

## Running Migrations

```bash
# Production
SPRING_PROFILES_ACTIVE=prod FLYWAY_ENABLED=true mvn spring-boot:run

# Migrations are applied automatically on startup from
# src/main/resources/db/migration/V*.sql
```

## Schema Coverage Matrix

| Module | Entity | Migration | Notes |
|--------|--------|-----------|-------|
| user | User | V1 | base table |
| user | AppSettings | V9 | per-user preferences |
| user | HealthcareWorker | V10 | directory (doctors/nurses/CHWs) |
| child | Child | V1 | base table |
| pregnancy | Pregnancy | V5 | NEW |
| anc | AncVisit | V5 | NEW (ANC + PNC) |
| development | DevelopmentMilestone | V6 | NEW |
| vaccination | Vaccination | V1 | base |
| vaccination | VaccinationSchedule | V1 | base |
| growth | GrowthRecord | V1 | base |
| nutrition | NutritionPlan | V1 | base |
| medical | HealthRecord | V1 | base |
| medical | (diagnoses etc.) | V4 | clinical extensions |
| appointment | Appointment | V1 | base |
| facility | Facility | V1 | base |
| doctor | Doctor | V1 | base |
| ai | AIConversation | V1 | base |
| notification | Notification | V1 | base |
| sync | SyncLog | V1 | base |
| auth | Session | V11 | NEW |
| auth | PasswordResetToken | V11 | NEW |
| sync | SyncLog | V12 | NEW |
| emergency | EmergencyContact | V7 | NEW |
| device | Device | V8 | NEW |
| attachment | Attachment | V8 | NEW |
| consent | Consent | V9 | NEW |
