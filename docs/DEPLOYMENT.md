# MtotoCare Africa — Deployment Guide

This document covers end-to-end deployment of the MtotoCare Africa platform: backend, mobile app, and supporting infrastructure.

## Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐
│  Mobile (RN + Expo) │ ──────▶ │  Backend (Spring)    │
│  iOS + Android      │  HTTPS  │  /api on port 8080   │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  MySQL 8 (prod)      │
                                │  H2 (dev/test)       │
                                └──────────────────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  Flyway migrations   │
                                │  (V1..V5)            │
                                └──────────────────────┘
```

## Backend Deployment

### Option 1: Docker (recommended)

```bash
# From project root
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

`docker-compose.yml` orchestrates:
- `mysql` — MySQL 8 with persistent volume
- `backend` — Spring Boot app (port 8080) connecting to MySQL

The `backend/Dockerfile` uses a multi-stage build:
1. `maven:3.9-eclipse-temurin-21` — compile + package
2. `eclipse-temurin:21-jre` — minimal runtime (alpine)

### Option 2: Direct JVM

```bash
cd backend
SPRING_PROFILES_ACTIVE=prod \
  SPRING_DATASOURCE_URL=jdbc:mysql://db-host:3306/mtotocare \
  SPRING_DATASOURCE_USERNAME=mtotocare \
  SPRING_DATASOURCE_PASSWORD=$DB_PASSWORD \
  JWT_SECRET=$STRONG_SECRET \
  java -jar target/mtotocare-backend-1.0.0.jar
```

### Option 3: Cloud (AWS / GCP / Azure)

#### AWS Elastic Beanstalk
```bash
eb init mtotocare --platform "Corretto 21"
eb create mtotocare-prod --database.engine mysql
eb deploy
```

#### GCP Cloud Run
```bash
gcloud builds submit --tag gcr.io/$PROJECT/mtotocare-backend
gcloud run deploy mtotocare \
  --image gcr.io/$PROJECT/mtotocare-backend \
  --add-cloudsql-instances $PROJECT:region:mtotocare-db \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod"
```

## Database Setup (MySQL production)

```sql
CREATE DATABASE mtotocare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mtotocare'@'%' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL ON mtotocare.* TO 'mtotocare'@'%';
FLUSH PRIVILEGES;
```

Flyway will run all migrations automatically on first startup. To re-seed reference data (vaccines, facilities), set `app.seed-data=true` in `application-prod.yml` once.

## Mobile App Deployment

### Build with EAS

```bash
cd mobile
npm install --legacy-peer-deps

# Preview (internal distribution)
eas build --profile preview --platform all

# Production
eas build --profile production --platform all
```

### App store submission

```bash
# iOS App Store
eas submit --platform ios --latest

# Google Play
eas submit --platform android --latest
```

The `eas.json` is preconfigured for `production`, `preview`, and `development` profiles.

## CI/CD

`.github/workflows/ci.yml` runs on every push:
- **Backend**: `mvn test` + `mvn package` (H2 tests)
- **Mobile**: `npx tsc --noEmit` (TypeScript type check)

Extend the workflow to push Docker images and submit mobile builds on tagged releases.

## Environment Variables

| Name | Where | Required | Description |
| --- | --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | Backend | Yes (prod) | Set to `prod` |
| `SPRING_DATASOURCE_URL` | Backend | Yes (prod) | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Backend | Yes (prod) | DB user |
| `SPRING_DATASOURCE_PASSWORD` | Backend | Yes (prod) | DB password (use secrets manager) |
| `JWT_SECRET` | Backend | Yes (prod) | Min 256-bit HMAC secret |
| `ALLOWED_ORIGINS` | Backend | No | Comma-sep CORS origins |
| `API_BASE_URL` | Mobile (EAS) | Yes | Backend URL |

## Health Checks

- Backend liveness: `GET /api/actuator/health`
- Backend readiness: same endpoint
- Mobile crash monitoring: integrate Sentry or Bugsnag (set `SENTRY_DSN` in EAS env)

## Backup & Recovery

- MySQL: nightly `mysqldump` to S3/GCS
- Retention: 30 days rolling
- Recovery: `mysql mtotocare < backup-2026-XX-XX.sql`

## Monitoring

Recommended:
- **APM**: New Relic, Datadog, or Elastic APM
- **Logs**: Grafana Loki, ELK, or CloudWatch
- **Uptime**: UptimeRobot or Better Uptime (ping `/api/actuator/health` every 60s)

## License

© 2026 MtotoCare Africa — All rights reserved.
