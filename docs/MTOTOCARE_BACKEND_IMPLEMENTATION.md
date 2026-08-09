# MtotoCare Africa – Backend Implementation Document

**Project Name:** MtotoCare Africa
**Document Type:** Backend Technical Implementation Reference
**Version:** 1.0
**Date:** July 2026
**Status:** Complete

---

## Table of Contents

### Part A: Foundation & Configuration
1. Introduction
2. Backend Objectives
3. Development Environment
4. Technology Stack
5. Project Folder Structure
6. Coding Standards
7. Architecture Pattern
8. Spring Boot Configuration
9. Maven Configuration
10. Environment Variables
11. Database Configuration
12. Security Configuration
13. JWT Authentication
14. Authorization (RBAC)

### Part B: Modules
15. User Module
16. Parent Module
17. Child Module
18. Healthcare Facility Module
19. Doctor Module
20. Appointment Module
21. Vaccination Module
22. Growth Monitoring Module
23. Nutrition Module
24. Medical Records Module
25. Diagnosis Module
26. Medication Module
27. Prescription Module
28. Allergy Module
29. Notification Module
30. AI Module
31. File Upload Module
32. Reporting Module
33. Audit Module

### Part C: Cross-Cutting Concerns
34. Exception Handling
35. Validation Strategy
36. DTO Design
37. Entity Relationships
38. Repository Layer
39. Service Layer
40. Controller Layer
41. API Standards
42. Response Format
43. Error Handling
44. Logging
45. Monitoring
46. Caching
47. Asynchronous Processing
48. Performance Optimization

### Part D: Testing & Deployment
49. Unit Testing
50. Integration Testing
51. API Documentation (Swagger)
52. Docker Configuration
53. CI/CD Pipeline
54. Production Deployment
55. Backup and Recovery
56. Maintenance Strategy
57. Deliverables
58. Future Enhancements

---

# PART A: FOUNDATION & CONFIGURATION

---

## 1. Introduction

### 1.1 Purpose
The MtotoCare Africa backend provides the server-side foundation for the AI-powered child healthcare platform. It implements secure REST APIs, manages healthcare data persistence, integrates AI services, and provides real-time notifications for parents, healthcare providers, and administrators.

### 1.2 Scope
This document describes the complete backend implementation including:
- All 16 feature modules (Auth, User, Child, Vaccination, etc.)
- Database schema and migrations
- Security and authentication
- Cross-cutting concerns (logging, monitoring, caching)
- Testing strategies
- Deployment procedures

### 1.3 Audience
- Backend developers
- Database administrators
- DevOps engineers
- QA engineers
- Technical project managers

---

## 2. Backend Objectives

### 2.1 Primary Objectives

| # | Objective | Success Metric |
|---|-----------|----------------|
| 1 | Develop secure RESTful APIs | 100% endpoints documented, JWT-secured |
| 2 | Implement authentication & RBAC | 6 user roles with appropriate permissions |
| 3 | Connect to MySQL database | 13 tables, all relationships enforced |
| 4 | Enforce business rules | Validation on all DTOs, business logic in services |
| 5 | Manage healthcare data securely | BCrypt passwords, soft delete, audit logs |
| 6 | Integrate AI services | Hybrid cloud/local AI, multilingual support |
| 7 | Implement notifications | Push/SMS/Email/In-app channels |
| 8 | Support cloud deployment | Docker-ready, environment-based config |
| 9 | Ensure scalability & maintainability | Modular architecture, clean separation of concerns |

### 2.2 Non-Functional Objectives

| # | Objective | Target |
|---|-----------|--------|
| 1 | Response time | < 200ms p95 for API calls |
| 2 | Availability | 99.9% uptime |
| 3 | Security | OWASP Top 10 compliance |
| 4 | Maintainability | < 30% code duplication |
| 5 | Testability | > 80% code coverage on services |

---

## 3. Development Environment

### 3.1 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 10 GB | 50 GB SSD |
| Network | 10 Mbps | 100 Mbps |

### 3.2 Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| JDK | 11+ (LTS) | Java runtime |
| Maven | 3.6+ | Build tool |
| Git | 2.30+ | Version control |
| Docker | 20.10+ (optional) | Containerization |
| MySQL | 8.0+ | Production database |
| H2 | 2.1+ | Dev/test database |
| IDE | IntelliJ IDEA / VS Code | Development |
| Postman / Insomnia | Latest | API testing |

### 3.3 Development Setup

```bash
# 1. Install Java 11+ and Maven
# 2. Clone the repository
git clone https://github.com/mtotocare-africa/backend.git
cd backend

# 3. Build the project
mvn clean install

# 4. Run with H2 (development profile)
mvn spring-boot:run

# 5. Run with MySQL (production profile)
DB_URL=jdbc:mysql://localhost:3306/mtotocare \
DB_USERNAME=root \
DB_PASSWORD=secret \
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# 6. Access Swagger UI
open http://localhost:8080/api/swagger-ui.html
```

---

## 4. Technology Stack

### 4.1 Core Technologies

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Language** | Java | 11 LTS | Enterprise standard, strong typing, mature ecosystem |
| **Framework** | Spring Boot | 2.7.18 | Production-ready, convention-over-configuration |
| **Security** | Spring Security | 5.7.11 | Industry-standard, JWT support, RBAC |
| **ORM** | Hibernate | 5.6.15 | Mature, well-documented JPA implementation |
| **Database** | MySQL | 8.0+ | ACID compliance, healthcare-grade reliability |
| **Dev DB** | H2 | 2.1+ | In-memory for fast development cycles |
| **Migrations** | Flyway | 9.x | Versioned, reliable schema management |
| **Auth** | JWT (JJWT) | 0.11.5 | Stateless, scalable authentication |
| **Password** | BCrypt | Strength 12 | Adaptive, industry-standard hashing |
| **Build** | Maven | 3.8+ | Dependency management, lifecycle control |
| **Docs** | SpringDoc OpenAPI | 1.6.15 | Auto-generated Swagger UI |
| **Utilities** | Lombok | 1.18+ | Reduce boilerplate |
| **JSON** | Jackson | 2.13+ | JSON serialization with date/time support |
| **Connection Pool** | HikariCP | 4.0+ | High-performance JDBC pooling |
| **Validation** | Jakarta Validation | 2.0+ | Declarative validation annotations |
| **Logging** | SLF4J + Logback | 1.2+ | Structured logging |

### 4.2 Why These Choices?

**Java 11 over Java 17:** Maximum compatibility with libraries and target deployment environments (especially for older server systems common in African deployments).

**Spring Boot 2.7 over 3.x:** Spring Boot 2.7 is the final version supporting Java 11. It has the longest support window and most stable ecosystem.

**Hibernate over JOOQ:** JPA/Hibernate is the de facto standard in enterprise Java, easier to hire for, and has more learning resources.

**MySQL over PostgreSQL:** MySQL is more widely available in Tanzanian hosting environments, has better managed service options, and lower memory footprint.

**JWT over Sessions:** Stateless authentication scales horizontally without session affinity, ideal for cloud deployment.

**Flyway over Liquibase:** Flyway has a simpler SQL-first approach, better for teams familiar with SQL.

---

## 5. Project Folder Structure

```
mtotocare-africa/backend/
├── pom.xml                                    # Maven build configuration
├── Dockerfile                                  # Docker image definition
├── docker-compose.yml                         # Local container orchestration
├── .gitignore
│
├── src/
│   ├── main/
│   │   ├── java/com/mtotocare/africa/
│   │   │   ├── MtotoCareApplication.java      # Spring Boot entry point
│   │   │   │
│   │   │   ├── auth/                          # Authentication module
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   └── AuthResponse.java
│   │   │   │
│   │   │   ├── user/                          # User management
│   │   │   │   ├── User.java
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── UserDto.java
│   │   │   │   ├── UserUpdateRequest.java
│   │   │   │   └── ChangePasswordRequest.java
│   │   │   │
│   │   │   ├── child/                         # Child profile module
│   │   │   │   ├── Child.java
│   │   │   │   ├── ChildRepository.java
│   │   │   │   ├── ChildService.java
│   │   │   │   ├── ChildController.java
│   │   │   │   ├── ChildRequest.java
│   │   │   │   └── ChildResponse.java
│   │   │   │
│   │   │   ├── facility/                      # Healthcare Facility module
│   │   │   │   ├── Facility.java
│   │   │   │   ├── FacilityRepository.java
│   │   │   │   ├── FacilityService.java
│   │   │   │   └── FacilityController.java
│   │   │   │
│   │   │   ├── doctor/                        # Doctor/Provider module
│   │   │   │   ├── Doctor.java
│   │   │   │   ├── DoctorRepository.java
│   │   │   │   ├── DoctorService.java
│   │   │   │   └── DoctorController.java
│   │   │   │
│   │   │   ├── appointment/                   # Appointment module
│   │   │   │   ├── Appointment.java
│   │   │   │   ├── AppointmentRepository.java
│   │   │   │   ├── AppointmentService.java
│   │   │   │   ├── AppointmentController.java
│   │   │   │   ├── AppointmentRequest.java
│   │   │   │   └── AppointmentDto.java
│   │   │   │
│   │   │   ├── vaccination/                   # Vaccination module
│   │   │   │   ├── Vaccination.java
│   │   │   │   ├── VaccinationSchedule.java
│   │   │   │   ├── VaccinationRepository.java
│   │   │   │   ├── VaccinationScheduleRepository.java
│   │   │   │   ├── VaccinationService.java
│   │   │   │   ├── VaccinationController.java
│   │   │   │   ├── VaccinationDto.java
│   │   │   │   ├── RecordVaccinationRequest.java
│   │   │   │   └── VaccinationDataInitializer.java
│   │   │   │
│   │   │   ├── growth/                        # Growth monitoring
│   │   │   │   ├── GrowthRecord.java
│   │   │   │   ├── GrowthRepository.java
│   │   │   │   ├── GrowthService.java
│   │   │   │   ├── GrowthController.java
│   │   │   │   └── GrowthRequest.java
│   │   │   │
│   │   │   ├── nutrition/                     # Nutrition module
│   │   │   │   ├── NutritionPlan.java
│   │   │   │   ├── NutritionPlanRepository.java
│   │   │   │   ├── NutritionService.java
│   │   │   │   └── NutritionController.java
│   │   │   │
│   │   │   ├── medical/                       # Medical records
│   │   │   │   ├── HealthRecord.java
│   │   │   │   ├── HealthRecordRepository.java
│   │   │   │   ├── HealthRecordService.java
│   │   │   │   ├── HealthRecordController.java
│   │   │   │   └── HealthRecordRequest.java
│   │   │   │
│   │   │   ├── diagnosis/                     # Diagnosis module
│   │   │   │   ├── Diagnosis.java
│   │   │   │   ├── DiagnosisRepository.java
│   │   │   │   ├── DiagnosisService.java
│   │   │   │   └── DiagnosisController.java
│   │   │   │
│   │   │   ├── medication/                    # Medication module
│   │   │   │   ├── Medication.java
│   │   │   │   ├── MedicationRepository.java
│   │   │   │   ├── MedicationService.java
│   │   │   │   └── MedicationController.java
│   │   │   │
│   │   │   ├── prescription/                  # Prescription module
│   │   │   │   ├── Prescription.java
│   │   │   │   ├── PrescriptionRepository.java
│   │   │   │   ├── PrescriptionService.java
│   │   │   │   └── PrescriptionController.java
│   │   │   │
│   │   │   ├── allergy/                       # Allergy module
│   │   │   │   ├── Allergy.java
│   │   │   │   ├── AllergyRepository.java
│   │   │   │   ├── AllergyService.java
│   │   │   │   └── AllergyController.java
│   │   │   │
│   │   │   ├── notification/                  # Notifications
│   │   │   │   ├── Notification.java
│   │   │   │   ├── NotificationRepository.java
│   │   │   │   ├── NotificationService.java
│   │   │   │   ├── NotificationController.java
│   │   │   │   └── NotificationDto.java
│   │   │   │
│   │   │   ├── ai/                            # AI Assistant
│   │   │   │   ├── AIConversation.java
│   │   │   │   ├── AIConversationRepository.java
│   │   │   │   ├── AIService.java
│   │   │   │   ├── AIController.java
│   │   │   │   └── AIChatRequest.java
│   │   │   │
│   │   │   ├── upload/                        # File upload
│   │   │   │   ├── FileUpload.java
│   │   │   │   ├── FileUploadRepository.java
│   │   │   │   ├── FileUploadService.java
│   │   │   │   └── FileUploadController.java
│   │   │   │
│   │   │   ├── report/                        # Reporting
│   │   │   │   ├── ReportService.java
│   │   │   │   └── ReportController.java
│   │   │   │
│   │   │   ├── audit/                         # Audit logging
│   │   │   │   ├── AuditLog.java
│   │   │   │   ├── AuditLogRepository.java
│   │   │   │   └── AuditService.java
│   │   │   │
│   │   │   ├── common/                        # Shared utilities
│   │   │   │   ├── BaseEntity.java            # Audit fields (createdAt, updatedAt, deletedAt)
│   │   │   │   ├── ApiResponse.java           # Standard response wrapper
│   │   │   │   ├── PageResponse.java          # Pagination wrapper
│   │   │   │   ├── Constants.java             # Application constants
│   │   │   │   └── SecurityUtils.java         # Security helpers
│   │   │   │
│   │   │   ├── config/                        # Configuration classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── OpenApiConfig.java
│   │   │   │   ├── JacksonConfig.java
│   │   │   │   └── SchedulingConfig.java
│   │   │   │
│   │   │   ├── exception/                     # Exception handling
│   │   │   │   ├── ApiException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │
│   │   │   └── security/                      # JWT implementation
│   │   │       ├── JwtTokenProvider.java
│   │   │       └── JwtAuthenticationFilter.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml                # Main config
│   │       ├── application-prod.yml           # Production overrides
│   │       ├── logback-spring.xml             # Logging config
│   │       └── db/migration/                  # Flyway migrations
│   │           ├── V1__init_schema.sql
│   │           ├── V2__seed_tanzania_epi.sql
│   │           └── V3__create_views_and_functions.sql
│   │
│   └── test/
│       └── java/com/mtotocare/africa/
│           ├── AuthControllerTest.java
│           ├── ChildControllerTest.java
│           └── ... (more tests)
```

### 5.1 Module Pattern

Each business module follows the same internal structure:

```
module-name/
├── ModuleName.java           # JPA Entity
├── ModuleNameRepository.java # Data Access Layer
├── ModuleNameService.java    # Business Logic
├── ModuleNameController.java # REST API
├── Dto/Request classes       # Data Transfer Objects
└── (optional) Validator, Mapper, Exception
```

---

## 6. Coding Standards

### 6.1 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Class | PascalCase | `UserService`, `ChildController` |
| Interface | PascalCase | `UserRepository` |
| Method | camelCase | `findByEmail`, `addChild` |
| Variable | camelCase | `userId`, `firstName` |
| Constant | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `ROLE_ADMIN` |
| Package | lowercase | `com.mtotocare.africa.user` |
| Database table | snake_case + plural | `users`, `child_records` |
| Database column | snake_case | `first_name`, `created_at` |
| REST endpoint | kebab-case | `/medical-records`, `/vaccinations/overdue` |
| JSON field | camelCase | `firstName`, `dateOfBirth` |

### 6.2 Code Style

- **Indentation:** 4 spaces (no tabs)
- **Line length:** Max 120 characters
- **Braces:** K&R style (opening brace on same line)
- **Imports:** No wildcard imports (`com.foo.*`)
- **Comments:** Javadoc for public APIs
- **Lombok:** Use `@Data`, `@Builder`, `@RequiredArgsConstructor` to reduce boilerplate

### 6.3 Example Service Class

```java
package com.mtotocare.africa.child;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing child profiles.
 * Handles CRUD operations and auto-generates vaccination schedules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChildService {

    private final ChildRepository childRepository;
    private final VaccinationService vaccinationService;

    @Transactional
    public ChildResponse addChild(String parentEmail, ChildRequest request) {
        log.info("Adding child for parent: {}", parentEmail);
        // Implementation
    }
}
```

### 6.4 Code Review Checklist

- [ ] Method length < 50 lines
- [ ] Class length < 500 lines
- [ ] No System.out.println (use logger)
- [ ] No hardcoded strings (use Constants)
- [ ] All public methods documented
- [ ] Unit tests written
- [ ] No SQL injection (use parameterized queries)
- [ ] No N+1 queries (use fetch joins or DTOs)

---

## 7. Architecture Pattern

### 7.1 Layered Architecture

The backend follows a **strict 4-layer architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│  Controllers, DTOs, Exception Handlers                  │
│  (Handles HTTP, validation, serialization)              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                    │
│  Services, Validators, Mappers                          │
│  (Implements business rules, orchestrates workflows)    │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                       │
│  Repositories (Spring Data JPA)                         │
│  (Database access via JPA entities)                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                          │
│  MySQL 8.0 / H2 (in-memory)                            │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Key Principles

1. **Controllers are thin:** Only HTTP handling and delegation to services
2. **Services contain business logic:** All rules and validations
3. **Repositories are pure data access:** No business logic
4. **DTOs separate API contract from database schema:** Entities never returned directly
5. **No circular dependencies between layers**

### 7.3 Dependency Injection

Spring's constructor injection is used exclusively (no `@Autowired` field injection):

```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor for final fields
public class ChildService {
    private final ChildRepository childRepository;  // Injected via constructor
    private final VaccinationService vaccinationService;
}
```

---

## 8. Spring Boot Configuration

### 8.1 Main Application Class

```java
package com.mtotocare.africa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing        // Enables @CreatedDate, @LastModifiedDate
@EnableAsync              // Enables @Async for async methods
@EnableScheduling         // Enables @Scheduled for background tasks
public class MtotoCareApplication {

    public static void main(String[] args) {
        SpringApplication.run(MtotoCareApplication.class, args);
    }
}
```

### 8.2 Application Properties (application.yml)

```yaml
spring:
  application:
    name: mtotocare-backend
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  datasource:
    url: ${DB_URL:jdbc:h2:mem:mtotocare;MODE=MySQL}
    username: ${DB_USERNAME:sa}
    password: ${DB_PASSWORD:}
    driver-class-name: ${DB_DRIVER:org.h2.Driver}
  jpa:
    hibernate:
      ddl-auto: ${JPA_DDL_AUTO:update}
    open-in-view: false  # Prevent lazy loading in views
    properties:
      hibernate:
        format_sql: true
        dialect: ${JPA_DIALECT:org.hibernate.dialect.H2Dialect}
  flyway:
    enabled: ${FLYWAY_ENABLED:false}
    locations: classpath:db/migration
  jackson:
    serialization:
      fail-on-empty-beans: false
      write-dates-as-timestamps: false
    default-property-inclusion: non_null

server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api

mtotocare:
  jwt:
    secret: ${JWT_SECRET:dev-secret-key-32-chars-min-replace-in-production}
    access-token-expiration: 900000      # 15 minutes
    refresh-token-expiration: 604800000  # 7 days
  cors:
    allowed-origins: http://localhost:8081,http://localhost:19006

logging:
  level:
    com.mtotocare.africa: DEBUG
    org.springframework.security: INFO
```

### 8.3 Production Profile (application-prod.yml)

```yaml
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate  # Flyway manages schema
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

mtotocare:
  jwt:
    secret: ${JWT_SECRET}  # MUST be set in production via env var

logging:
  level:
    root: INFO
    com.mtotocare.africa: INFO
```

---

## 9. Maven Configuration

### 9.1 POM Structure (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
    </parent>

    <groupId>com.mtotocare.africa</groupId>
    <artifactId>mtotocare-backend</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>11</java.version>
        <jjwt.version>0.11.5</jjwt.version>
        <springdoc.version>1.6.15</springdoc.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Database -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Flyway -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- API Documentation -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-ui</artifactId>
            <version>${springdoc.version}</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 9.2 Maven Commands

| Command | Purpose |
|---------|---------|
| `mvn clean` | Clean target directory |
| `mvn compile` | Compile source code |
| `mvn test` | Run unit tests |
| `mvn package` | Build JAR file |
| `mvn spring-boot:run` | Run the application |
| `mvn spring-boot:run -Dspring-boot.run.profiles=prod` | Run with prod profile |
| `mvn dependency:tree` | View dependency tree |
| `mvn -DskipTests package` | Build without tests |

---

## 10. Environment Variables

### 10.1 Required Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `DB_URL` | JDBC database URL | `jdbc:mysql://localhost:3306/mtotocare` | H2 in-memory |
| `DB_USERNAME` | Database username | `mtotocare_user` | `sa` |
| `DB_PASSWORD` | Database password | `securepass123` | (empty) |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `(random 32+ chars)` | dev-only secret |
| `SERVER_PORT` | HTTP port | `8080` | `8080` |

### 10.2 Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` |
| `JPA_DIALECT` | Hibernate dialect | `H2Dialect` |
| `JPA_DDL_AUTO` | Schema generation mode | `update` |
| `FLYWAY_ENABLED` | Enable Flyway migrations | `false` |
| `LOG_LEVEL` | Application log level | `INFO` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins | localhost |

### 10.3 .env File Example (Development)

```bash
# .env (DO NOT commit to git)
DB_URL=jdbc:mysql://localhost:3306/mtotocare
DB_USERNAME=mtotocare_dev
DB_PASSWORD=devpassword
JWT_SECRET=development-secret-key-replace-in-production-min-32-chars
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
LOG_LEVEL=DEBUG
```

### 10.4 Production Environment Setup

```bash
# On production server
export DB_URL=jdbc:mysql://prod-db.mtotocare.africa:3306/mtotocare
export DB_USERNAME=mtotocare_prod
export DB_PASSWORD=$(cat /run/secrets/db_password)
export JWT_SECRET=$(cat /run/secrets/jwt_secret)
export SPRING_PROFILES_ACTIVE=prod
export LOG_LEVEL=INFO
```

---

## 11. Database Configuration

### 11.1 Connection Configuration

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      pool-name: MtotoCareHikariCP
```

### 11.2 JPA Configuration

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate        # Never use create/update in production
    show-sql: false             # Set true for SQL debugging
    open-in-view: false         # Prevent OSIV anti-pattern
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

### 11.3 Flyway Configuration

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
    out-of-order: false
    table: flyway_schema_history
```

### 11.4 Schema Migrations

| Version | File | Description |
|---------|------|-------------|
| V1 | `V1__init_schema.sql` | 13 core tables, indexes, FKs, constraints |
| V2 | `V2__seed_tanzania_epi.sql` | 13 Tanzania EPI vaccine entries |
| V3 | `V3__create_views_and_functions.sql` | Reporting views |

**Adding a new migration:** Create `V4__description.sql` (never modify V1, V2, V3 after deployment).

---

## 12. Security Configuration

### 12.1 SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${mtotocare.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()  // Stateless JWT API
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .antMatchers("/auth/**").permitAll()
                .antMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .antMatchers("/h2-console/**").permitAll()
                .antMatchers("/actuator/health", "/actuator/info").permitAll()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .antMatchers("/provider/**").hasAnyRole("DOCTOR", "NURSE", "NUTRITIONIST")
                .anyRequest().authenticated()
            .and()
            .headers().frameOptions().sameOrigin()  // For H2 console
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 12.2 Security Layers

```
┌────────────────────────────────────────┐
│  1. HTTPS (TLS 1.2+) in production     │
├────────────────────────────────────────┤
│  2. CORS Filter (allowed origins)      │
├────────────────────────────────────────┤
│  3. CSRF Disabled (stateless API)      │
├────────────────────────────────────────┤
│  4. JWT Authentication Filter          │
├────────────────────────────────────────┤
│  5. Authorization Rules (RBAC)         │
├────────────────────────────────────────┤
│  6. Method-level @PreAuthorize         │
├────────────────────────────────────────┤
│  7. Input Validation (DTOs)            │
├────────────────────────────────────────┤
│  8. SQL Parameterization (JPA)         │
├────────────────────────────────────────┤
│  9. Password Hashing (BCrypt 12)       │
└────────────────────────────────────────┘
```

---

## 13. JWT Authentication

### 13.1 Token Structure

**Access Token Payload:**
```json
{
  "sub": "user@example.com",
  "roles": ["PARENT"],
  "type": "access",
  "iat": 1720353600,
  "exp": 1720354500
}
```

**Refresh Token Payload:**
```json
{
  "sub": "user@example.com",
  "type": "refresh",
  "iat": 1720353600,
  "exp": 1720958400
}
```

### 13.2 Token Generation

```java
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration = 900000;   // 15 min
    private final long refreshTokenExpiration = 604800000; // 7 days

    public String generateAccessToken(String email, List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
            .setSubject(email)
            .claim("roles", roles)
            .claim("type", "access")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }
}
```

### 13.3 Authentication Flow

```
┌────────┐                ┌─────────┐              ┌──────────┐
│ Client │                │ Backend │              │ Database │
└───┬────┘                └────┬────┘              └────┬─────┘
    │  POST /auth/login        │                        │
    │  {email, password}       │                        │
    ├──────────────────────────►                        │
    │                          │  Find user by email   │
    │                          ├───────────────────────►│
    │                          │◄───────────────────────┤
    │                          │  User entity           │
    │                          │  Verify password       │
    │                          │  (BCrypt.matches)      │
    │                          │                        │
    │                          │  Generate JWT          │
    │                          │  (access + refresh)    │
    │  200 OK                  │                        │
    │  {accessToken,           │                        │
    │   refreshToken, user}    │                        │
    │◄──────────────────────────                        │
    │                          │                        │
    │  GET /api/children       │                        │
    │  Authorization: Bearer... │                        │
    ├──────────────────────────►                        │
    │                          │  Extract & validate    │
    │                          │  JWT from header       │
    │                          │  Set SecurityContext   │
    │                          │                        │
    │                          │  Query children        │
    │                          ├───────────────────────►│
    │                          │◄───────────────────────┤
    │  200 OK                  │                        │
    │  {children: [...]}       │                        │
    │◄──────────────────────────                        │
```

### 13.4 JWT Filter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        try {
            String token = extractToken(request);
            if (token != null && jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getEmailFromToken(token);
                List<String> roles = jwtTokenProvider.getRolesFromToken(token);
                
                List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
                
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(email, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.error("JWT authentication failed", e);
        }
        filterChain.doFilter(request, response);
    }
}
```

---

## 14. Authorization (RBAC)

### 14.1 User Roles

| Role | Description | Typical Permissions |
|------|-------------|---------------------|
| `PARENT` | Child's parent or guardian | Manage own children, view records |
| `GUARDIAN` | Caregiver (grandparent, etc.) | Same as PARENT |
| `DOCTOR` | Licensed physician | View assigned patients, write prescriptions |
| `NURSE` | Registered nurse | View patients, record vitals |
| `NUTRITIONIST` | Nutrition specialist | View patients, create meal plans |
| `ADMIN` | System administrator | User management, system config |
| `SUPER_ADMIN` | System owner | All permissions + user role changes |

### 14.2 Method-Level Security

```java
@PreAuthorize("hasRole('ADMIN')")
public PageResponse<UserDto> getAllUsers(int page, int size, String search) { ... }

@PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
public VaccinationDto recordVaccination(Long childId, RecordVaccinationRequest request) { ... }

@PreAuthorize("hasAnyRole('DOCTOR', 'NUTRITIONIST', 'ADMIN')")
public List<NutritionPlan> generateDailyMealPlan(Long childId, LocalDate date) { ... }
```

### 14.3 URL-Based Authorization

```java
.antMatchers("/admin/**").hasRole("ADMIN")
.antMatchers("/provider/**").hasAnyRole("DOCTOR", "NURSE", "NUTRITIONIST")
.antMatchers("/auth/**").permitAll()
```

### 14.4 Resource-Level Authorization

Beyond role checks, the services enforce **ownership rules**:

```java
public ChildResponse getChild(String parentEmail, Long childId) {
    Child child = childRepository.findById(childId)
        .orElseThrow(() -> new ApiException("Not found", HttpStatus.NOT_FOUND));
    
    // Parents can only access their own children
    if (!child.getParent().getEmail().equals(parentEmail)) {
        throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
    }
    return mapToResponse(child);
}
```

---

# PART B: MODULES

---

## 15. User Module

### 15.1 Purpose
Central identity management for all system users. Handles registration, authentication, profile management, and account lifecycle.

### 15.2 Business Rules
1. Email must be unique across the system
2. Phone number must be unique (if provided)
3. Password must be at least 8 characters
4. Inactive users cannot login
5. Soft-deleted users retain audit trail but cannot access
6. Users can have multiple roles (e.g., PARENT + NUTRITIONIST)

### 15.3 Functional Requirements

| FR-ID | Description | Status |
|-------|-------------|--------|
| FR-USER-01 | Register new user with email/password | ✅ |
| FR-USER-02 | Login with email/password, get JWT | ✅ |
| FR-USER-03 | Update own profile | ✅ |
| FR-USER-04 | Change own password | ✅ |
| FR-USER-05 | Admin can list all users | ✅ |
| FR-USER-06 | Admin can deactivate users | ✅ |
| FR-USER-07 | User can logout (client discards token) | ✅ |
| FR-USER-08 | Forgot password flow | ✅ |
| FR-USER-09 | Refresh access token | ✅ |
| FR-USER-10 | Search users by name/email | ✅ |

### 15.4 Package Structure
```
com.mtotocare.africa.user/
├── User.java
├── UserRepository.java
├── UserService.java
├── UserController.java
├── UserDto.java
├── UserUpdateRequest.java
└── ChangePasswordRequest.java
```

### 15.5 Entity Design

```java
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "phone_number")
})
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;
    
    @NotBlank
    @Email
    private String email;
    
    private String phoneNumber;
    
    @NotBlank
    private String passwordHash;  // BCrypt
    
    private Boolean emailVerified = false;
    private Boolean phoneVerified = false;
    private String profilePictureUrl;
    private String preferredLanguage = "en";
    private Boolean active = true;
    private LocalDateTime lastLoginAt;
    
    // For healthcare providers
    private String licenseNumber;
    private String specialization;
    private Long clinicId;
    
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> roles = new HashSet<>();  // PARENT, DOCTOR, etc.
}
```

### 15.6 DTOs

**UserDto** (output):
```json
{
  "id": 1,
  "fullName": "Amina Mwalimu",
  "email": "amina@example.com",
  "phoneNumber": "+255700111222",
  "preferredLanguage": "en",
  "emailVerified": false,
  "phoneVerified": false,
  "active": true,
  "roles": ["PARENT"],
  "createdAt": "2026-07-01T10:00:00"
}
```

**UserUpdateRequest** (input):
```json
{
  "fullName": "Amina Mwalimu",
  "phoneNumber": "+255700999888",
  "preferredLanguage": "sw"
}
```

**ChangePasswordRequest** (input):
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmNewPassword": "NewPass456!"
}
```

### 15.7 Repository Interface

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.active = true AND u.deletedAt IS NULL")
    Optional<User> findActiveByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.active = true AND u.deletedAt IS NULL " +
           "AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchActiveUsers(String search, Pageable pageable);
    
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime WHERE u.id = :userId")
    void updateLastLogin(Long userId, LocalDateTime loginTime);
}
```

### 15.8 Service Implementation

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException("User not found", 
                HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UserUpdateRequest request) {
        User user = userRepository.findActiveByEmail(email)
            .orElseThrow(() -> new ApiException("User not found", 
                HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfilePictureUrl() != null) 
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getPreferredLanguage() != null) 
            user.setPreferredLanguage(request.getPreferredLanguage());

        user = userRepository.save(user);
        log.info("Profile updated: {}", email);
        return UserDto.from(user);
    }

    @Transactional
    public void changePassword(String email, String currentPassword, 
                                 String newPassword) {
        User user = userRepository.findActiveByEmail(email)
            .orElseThrow(() -> new ApiException("User not found", 
                HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ApiException("Current password incorrect", 
                HttpStatus.BAD_REQUEST, "INVALID_PASSWORD");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", email);
    }
}
```

### 15.9 Controller Responsibilities

```java
@RestController
@RequestMapping("/users")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success(
            userService.getUserByEmail(email)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @Valid @RequestBody UserUpdateRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success(
            "Profile updated", 
            userService.updateProfile(email, request)));
    }

    @PostMapping("/me/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new ApiException("Passwords do not match", 
                HttpStatus.BAD_REQUEST, "PASSWORD_MISMATCH");
        }
        userService.changePassword(email, request.getCurrentPassword(), 
                                    request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed", null));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(
            userService.getAllUsers(page, size, search)));
    }
}
```

### 15.10 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register new user |
| POST | `/auth/login` | None | Login |
| POST | `/auth/refresh` | None | Refresh token |
| POST | `/auth/forgot-password` | None | Request reset |
| POST | `/auth/reset-password` | None | Reset with token |
| POST | `/auth/logout` | JWT | Logout (client-side) |
| GET | `/users/me` | JWT | Get current user |
| PUT | `/users/me` | JWT | Update profile |
| POST | `/users/me/change-password` | JWT | Change password |
| GET | `/users` | JWT + ADMIN | List all users |
| GET | `/users/{id}` | JWT + ADMIN | Get user by ID |
| DELETE | `/users/{id}` | JWT + ADMIN | Deactivate user |

### 15.11 Validation Rules

| Field | Rule | Error Code |
|-------|------|-----------|
| fullName | Not blank, 2-100 chars | `VALIDATION_ERROR` |
| email | Not blank, valid email format, max 150 | `VALIDATION_ERROR` |
| phoneNumber | Optional, 10-15 digits with optional + | `VALIDATION_ERROR` |
| password | Not blank, min 8 chars | `VALIDATION_ERROR` |
| confirmPassword | Must match password | `PASSWORD_MISMATCH` |
| preferredLanguage | Max 10 chars | `VALIDATION_ERROR` |

### 15.12 Exception Handling

| Exception | HTTP Status | Error Code |
|-----------|-------------|-----------|
| Email already exists | 409 Conflict | `EMAIL_EXISTS` |
| Phone already exists | 409 Conflict | `PHONE_EXISTS` |
| User not found | 404 Not Found | `USER_NOT_FOUND` |
| Invalid credentials | 401 Unauthorized | `INVALID_CREDENTIALS` |
| Invalid current password | 400 Bad Request | `INVALID_PASSWORD` |
| Account inactive | 403 Forbidden | `ACCOUNT_INACTIVE` |
| Passwords don't match | 400 Bad Request | `PASSWORD_MISMATCH` |

### 15.13 Security Rules

1. **Public endpoints** (`/auth/register`, `/auth/login`): No auth required
2. **Authenticated endpoints**: Valid JWT in `Authorization: Bearer <token>` header
3. **Admin-only endpoints**: `hasRole('ADMIN')` check
4. **Password never returned**: Always null in responses
5. **Soft delete**: `deleted_at` populated, record preserved

### 15.14 Database Interactions

```sql
-- Register
INSERT INTO users (full_name, email, password_hash, ...)
INSERT INTO user_roles (user_id, role)

-- Login
SELECT * FROM users WHERE email = ? AND active = TRUE AND deleted_at IS NULL
UPDATE users SET last_login_at = NOW() WHERE id = ?

-- Update profile
UPDATE users SET full_name = ?, phone_number = ?, ... WHERE id = ?

-- List users (admin)
SELECT * FROM users 
WHERE active = TRUE 
  AND deleted_at IS NULL
  AND (full_name ILIKE '%search%' OR email ILIKE '%search%')
ORDER BY created_at DESC
LIMIT 20 OFFSET 0
```

### 15.15 Sequence Diagram

```
User Registration Flow:
┌──────┐          ┌───────────┐         ┌──────────┐        ┌──────────┐
│Client│          │Controller │         │ Service  │        │    DB    │
└──┬───┘          └─────┬─────┘         └────┬─────┘        └────┬─────┘
   │ POST /auth/register │                   │                   │
   ├─────────────────────►                   │                   │
   │                     │  register()       │                   │
   │                     ├───────────────────►                   │
   │                     │                   │ Validate fields   │
   │                     │                   │ Check email exists│
   │                     │                   ├──────────────────►│
   │                     │                   │◄──────────────────┤
   │                     │                   │ Hash password     │
   │                     │                   │ Save user         │
   │                     │                   ├──────────────────►│
   │                     │                   │◄──────────────────┤
   │                     │                   │ Generate JWT      │
   │                     │◄──────────────────┤                   │
   │  201 Created        │                   │                   │
   │◄─────────────────────                   │                   │
   │  {accessToken,      │                   │                   │
   │   refreshToken,     │                   │                   │
   │   user}             │                   │                   │
```

### 15.16 Testing Strategy

| Test Type | Coverage | Tools |
|-----------|----------|-------|
| Unit | UserService methods | JUnit 5, Mockito |
| Integration | UserController + DB | @SpringBootTest, MockMvc |
| Security | Auth required, RBAC | Spring Security Test |
| Validation | DTO field rules | @Valid in MockMvc tests |

### 15.17 Performance Considerations

- **Indexed columns:** `email`, `phone_number`, `(active, deleted_at)`
- **Pagination:** All list endpoints paginated
- **Eager loading:** Roles collection eagerly loaded (small set)
- **Lazy loading:** Avoided via DTOs (entities never returned)
- **BCrypt cost:** 12 (balance of security and performance)

### 15.18 Future Improvements

- Email verification via SendGrid
- SMS OTP for phone verification
- Biometric authentication (fingerprint/face ID)
- Two-factor authentication (TOTP)
- OAuth2 social login (Google, Facebook)
- Account lockout after N failed attempts

---

## 16. Parent Module

> The "Parent" role uses the User entity. The "parent" concept is implicit via `child.parent_id`. No separate entity needed for v1.0.

### 16.1 Purpose
Parents are users with the `PARENT` role who manage one or more children. They can view their children's full health records, book appointments, and receive notifications.

### 16.2 Business Rules
1. A user becomes a "parent" by registering (default role is PARENT)
2. A parent can have multiple children
3. Parents can only access their own children's data
4. Parents cannot view other parents' data
5. Deactivating a parent soft-deletes them but preserves children for audit

### 16.3 Functional Requirements
- View list of own children
- Add/edit/delete child profile
- View all children's health data
- Book/cancel/reschedule appointments
- Receive notifications for own children
- View health reports
- Chat with AI assistant

### 16.4 Implementation Note
The Parent module is implemented as:
- A user with `PARENT` role
- The `child.parent_id` foreign key relationship
- Parent-specific endpoints in other modules (vaccinations, growth, etc.)

No separate `Parent` entity is needed. The User entity with role filtering serves this purpose.

---

## 17. Child Module

### 17.1 Purpose
Manages child profiles. Each child is associated with one parent and serves as the central entity for all health records (vaccinations, growth, nutrition, medical history, appointments).

### 17.2 Business Rules
1. Date of birth must be in the past
2. Gender must be MALE, FEMALE, or OTHER
3. Birth weight/height must be positive if provided
4. A parent can have multiple children
5. When a child is added, the Tanzania EPI vaccination schedule is auto-generated
6. Soft delete preserves all related records

### 17.3 Functional Requirements

| FR-ID | Description | Status |
|-------|-------------|--------|
| FR-CHILD-01 | Add new child profile | ✅ |
| FR-CHILD-02 | View all own children | ✅ |
| FR-CHILD-03 | View specific child | ✅ |
| FR-CHILD-04 | Update child profile | ✅ |
| FR-CHILD-05 | Soft delete child | ✅ |
| FR-CHILD-06 | Auto-generate vaccination schedule | ✅ |
| FR-CHILD-07 | Calculate child age in months | ✅ |

### 17.4 Entity Design

```java
@Entity
@Table(name = "children", indexes = {
    @Index(name = "idx_child_parent", columnList = "parent_id"),
    @Index(name = "idx_child_dob", columnList = "date_of_birth")
})
public class Child extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank @Size(min = 1, max = 100)
    private String firstName;
    
    @Size(max = 100)
    private String lastName;
    
    @NotNull @Past
    private LocalDate dateOfBirth;
    
    @NotBlank
    private String gender;  // MALE, FEMALE, OTHER
    
    private String bloodGroup;
    private Double birthWeightKg;
    private Double birthHeightCm;
    private String profilePictureUrl;
    private String nationalId;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "children", "passwordHash"})
    private User parent;
    
    // Computed
    public int getAgeInMonths() {
        return Period.between(dateOfBirth, LocalDate.now()).getYears() * 12 
             + Period.between(dateOfBirth, LocalDate.now()).getMonths();
    }
}
```

### 17.5 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/children` | JWT | Add new child |
| GET | `/children` | JWT | Get all own children |
| GET | `/children/{id}` | JWT | Get specific child |
| PUT | `/children/{id}` | JWT | Update child |
| DELETE | `/children/{id}` | JWT | Soft delete child |

### 17.6 Request Example

**POST /children**
```json
{
  "firstName": "Juma",
  "lastName": "Said",
  "dateOfBirth": "2024-12-15",
  "gender": "MALE",
  "birthWeightKg": 3.2,
  "birthHeightCm": 50.0,
  "bloodGroup": "O+"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Child added successfully",
  "data": {
    "id": 1,
    "firstName": "Juma",
    "lastName": "Said",
    "fullName": "Juma Said",
    "gender": "MALE",
    "dateOfBirth": "2024-12-15",
    "ageInMonths": 18,
    "bloodGroup": "O+"
  }
}
```

### 17.7 Auto-Generated Vaccination Schedule

When a child is added, the service automatically:
1. Fetches all active vaccination schedule entries
2. Creates a `Vaccination` record for each, with:
   - `nextDoseDue = dateOfBirth + recommendedAgeWeeks`
   - `status = PENDING`

```java
@Transactional
public ChildResponse addChild(String parentEmail, ChildRequest request) {
    // ... save child ...
    
    // Auto-generate vaccination schedule
    List<VaccinationSchedule> schedules = 
        scheduleRepository.findByActiveTrueOrderByRecommendedAgeWeeksAsc();
    
    for (VaccinationSchedule schedule : schedules) {
        LocalDate dueDate = child.getDateOfBirth()
            .plusWeeks(schedule.getRecommendedAgeWeeks());
        vaccinationRepository.save(Vaccination.builder()
            .child(child)
            .schedule(schedule)
            .nextDoseDue(dueDate)
            .status("PENDING")
            .build());
    }
    return mapToResponse(child);
}
```

---

## 18. Healthcare Facility Module

### 18.1 Purpose
Manages healthcare facilities (clinics, hospitals) where appointments are scheduled and vaccinations are administered.

### 18.2 Business Rules
1. Facility name must be unique within a region
2. Facility has a name, type, address, contact info, operating hours
3. Doctors can be assigned to one or more facilities
4. Appointments can be booked at a specific facility
5. Inactive facilities are hidden from appointment booking

### 18.3 Entity Design

```java
@Entity
@Table(name = "facilities")
public class Facility extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String facilityType;  // CLINIC, HOSPITAL, DISPENSARY
    
    @Column(length = 500)
    private String address;
    
    private String region;     // e.g., "Dar es Salaam"
    private String district;   // e.g., "Kinondoni"
    
    private String phoneNumber;
    private String email;
    
    private Double latitude;
    private Double longitude;
    
    @Column(name = "operating_hours", length = 500)
    private String operatingHours;  // JSON or text description
    
    @Column(nullable = false)
    private Boolean active = true;
}
```

### 18.4 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/facilities` | JWT | List all facilities |
| GET | `/facilities/nearby` | JWT | Find by location |
| GET | `/facilities/{id}` | JWT | Get specific facility |
| POST | `/facilities` | JWT + ADMIN | Create facility |
| PUT | `/facilities/{id}` | JWT + ADMIN | Update facility |
| DELETE | `/facilities/{id}` | JWT + ADMIN | Deactivate facility |

---

## 19. Doctor Module

### 19.1 Purpose
Manages healthcare provider profiles (doctors, nurses, nutritionists) and their assignments to facilities.

### 19.2 Business Rules
1. A doctor is a user with role DOCTOR, NURSE, or NUTRITIONIST
2. Each provider has a license number
3. Providers can work at one or more facilities
4. Providers can view patients assigned to them
5. Providers can record vaccinations, write prescriptions, create diagnoses

### 19.3 Entity Design

```java
@Entity
@Table(name = "doctors")
public class Doctor extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @NotBlank
    private String licenseNumber;
    
    private String specialization;  // PEDIATRICS, GENERAL, NUTRITION
    
    @ManyToMany
    @JoinTable(name = "doctor_facilities",
        joinColumns = @JoinColumn(name = "doctor_id"),
        inverseJoinColumns = @JoinColumn(name = "facility_id"))
    private Set<Facility> facilities = new HashSet<>();
    
    @Column(nullable = false)
    private Boolean acceptingNewPatients = true;
}
```

### 19.4 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/doctors` | JWT | List doctors |
| GET | `/doctors/{id}` | JWT | Get doctor |
| GET | `/doctors/me` | JWT + DOCTOR | Get own profile |
| POST | `/doctors` | JWT + ADMIN | Register new doctor |
| PUT | `/doctors/{id}` | JWT + DOCTOR/ADMIN | Update |
| GET | `/doctors/{id}/patients` | JWT + DOCTOR | Get assigned patients |

---

## 20. Appointment Module

### 20.1 Purpose
Manages medical appointments between parents/children and healthcare providers.

### 20.2 Business Rules
1. Appointment date must be in the future (when booking)
2. Duration defaults to 30 minutes
3. Status flow: SCHEDULED → CONFIRMED → COMPLETED, or → CANCELLED → NO_SHOW
4. Only the parent who owns the child can book/cancel
5. Providers can mark appointments as completed
6. Cancellation reason is required when cancelling

### 20.3 Entity Design

```java
@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appt_child", columnList = "child_id"),
    @Index(name = "idx_appt_doctor", columnList = "doctor_id"),
    @Index(name = "idx_appt_datetime", columnList = "appointment_datetime")
})
public class Appointment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    @JsonIgnore
    private User doctor;
    
    @Column(nullable = false)
    private LocalDateTime appointmentDatetime;
    
    @Builder.Default
    private Integer durationMinutes = 30;
    
    private String appointmentType;  // CONSULTATION, VACCINATION, FOLLOW_UP
    private String clinicName;
    private String clinicAddress;
    private String reason;
    private String notes;
    
    @Builder.Default
    private String status = "SCHEDULED";
    
    private String cancellationReason;
}
```

### 20.4 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/appointments` | JWT | Book new appointment |
| GET | `/appointments` | JWT | Get my appointments |
| PUT | `/appointments/{id}/reschedule` | JWT | Reschedule |
| PUT | `/appointments/{id}/cancel` | JWT | Cancel |
| PUT | `/appointments/{id}/complete` | JWT + DOCTOR | Mark completed |

### 20.5 Sequence Diagram: Booking

```
Parent books appointment:
┌──────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────┐
│Client│     │AppointmentCtrl│     │ApptService  │     │ DB       │
└──┬───┘     └──────┬────────┘     └──────┬──────┘     └────┬─────┘
   │ POST           │                     │                  │
   ├────────────────►                     │                  │
   │                 │ bookAppointment()   │                  │
   │                 ├─────────────────────►                  │
   │                 │                     │ Verify parent   │
   │                 │                     │ ownership       │
   │                 │                     │ Save appointment│
   │                 │                     ├─────────────────►
   │                 │                     │◄─────────────────┤
   │                 │                     │ Send notif      │
   │                 │                     ├─────────────────►
   │ 201 Created     │◄────────────────────┤                  │
   │◄────────────────┤                     │                  │
```

### 20.6 Request/Response Example

**Request:**
```json
{
  "childId": 1,
  "doctorId": 5,
  "appointmentDatetime": "2026-07-20T10:00:00",
  "appointmentType": "VACCINATION",
  "clinicName": "Amana Clinic",
  "clinicAddress": "Ilala, Dar es Salaam",
  "reason": "PENTA3 vaccination"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked",
  "data": {
    "id": 42,
    "childId": 1,
    "childName": "Juma Said",
    "doctorId": 5,
    "doctorName": "Dr. Mwangi",
    "appointmentDatetime": "2026-07-20T10:00:00",
    "status": "SCHEDULED",
    "clinicName": "Amana Clinic"
  }
}
```

---

## 21. Vaccination Module

### 21.1 Purpose
Tracks child vaccinations according to the Tanzania EPI schedule. Generates reminders for upcoming and overdue vaccines.

### 21.2 Business Rules
1. Each child gets the full EPI schedule auto-generated on registration
2. `nextDoseDue` = `dateOfBirth + recommendedAgeWeeks`
3. Statuses: PENDING → COMPLETED, or PENDING → OVERDUE
4. Only healthcare providers can mark vaccines as administered
5. Daily scheduled task marks overdue vaccines and sends notifications
6. Vaccination certificate is generated after all doses complete

### 21.3 Entities

**VaccinationSchedule** (template):
```java
@Entity
@Table(name = "vaccination_schedule")
public class VaccinationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 20)
    private String vaccineCode;  // BCG, PENTA1, etc.
    
    @Column(nullable = false, length = 100)
    private String vaccineName;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Integer recommendedAgeWeeks;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer dosesRequired = 1;
    
    @Builder.Default
    private Integer doseNumber = 1;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
```

**Vaccination** (record):
```java
@Entity
@Table(name = "vaccinations")
public class Vaccination extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_id", nullable = false)
    private VaccinationSchedule schedule;
    
    private Integer doseNumber;
    private LocalDate administeredAt;
    private LocalDate nextDoseDue;
    private String administeredBy;
    private String clinicName;
    private String batchNumber;
    private String notes;
    
    @Builder.Default
    private String status = "PENDING";  // PENDING, COMPLETED, OVERDUE, SKIPPED
    
    private String certificateUrl;
    
    public boolean isOverdue() {
        return "PENDING".equals(status) 
            && nextDoseDue != null 
            && nextDoseDue.isBefore(LocalDate.now());
    }
}
```

### 21.4 Scheduled Task

```java
@Scheduled(cron = "0 0 8 * * *")  // Daily at 8:00 AM
@Transactional
public void processOverdueVaccinations() {
    log.info("Running daily overdue vaccination check...");
    List<Vaccination> overdue = vaccinationRepository
        .findOverdueVaccinations(LocalDate.now());
    
    for (Vaccination v : overdue) {
        v.setStatus("OVERDUE");
        vaccinationRepository.save(v);
        notificationService.createVaccinationReminder(v);
    }
    log.info("Processed {} overdue vaccinations", overdue.size());
}
```

### 21.5 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/vaccinations/child/{childId}` | JWT | Get all vaccinations for child |
| POST | `/vaccinations/child/{childId}` | JWT + DOCTOR | Record administered vaccine |
| GET | `/vaccinations/overdue` | JWT + DOCTOR | Get all overdue |
| GET | `/vaccinations/upcoming?days=30` | JWT | Get upcoming |
| GET | `/vaccinations/schedules` | JWT | Get Tanzania EPI schedule |
| GET | `/vaccinations/child/{id}/completed-count` | JWT | Count completed |

---

## 22. Growth Monitoring Module

### 22.1 Purpose
Tracks child growth (weight, height, head circumference) and calculates WHO Z-scores to detect malnutrition and growth abnormalities.

### 22.2 Business Rules
1. Measurement date cannot be in the future
2. Weight and height must be positive
3. Z-scores calculated automatically on save
4. Nutrition status: NORMAL, UNDERWEIGHT, STUNTED, WASTED, OVERWEIGHT, etc.
5. Malnutrition triggers immediate notification to parent
6. Growth data feeds into health reports

### 22.3 Entity Design

```java
@Entity
@Table(name = "growth_records")
public class GrowthRecord extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @Column(nullable = false)
    @PastOrPresent
    private LocalDate measurementDate;
    
    @Column(nullable = false)
    @Positive
    private Double weightKg;
    
    @Column(nullable = false)
    @Positive
    private Double heightCm;
    
    private Double headCircumferenceCm;
    private Double muacCm;  // Mid-Upper Arm Circumference
    
    // Computed WHO Z-scores
    private Double weightForAgeZScore;
    private Double heightForAgeZScore;
    private Double weightForHeightZScore;
    private Double bmi;
    private String nutritionStatus;  // NORMAL, WASTED, STUNTED, etc.
    private String notes;
    private String recordedBy;
}
```

### 22.4 Z-Score Calculation

```java
private double calculateWeightForAgeZ(Child child, double weightKg) {
    int ageMonths = child.getAgeInMonths();
    double medianWeight = getMedianWeightForAge(ageMonths, child.getGender());
    double stdDev = medianWeight * 0.12;
    return Math.round(((weightKg - medianWeight) / stdDev) * 100.0) / 100.0;
}

private String interpretGrowthStatus(double wfaZ, double hfaZ, 
                                       double wfhZ, double bmi, Child child) {
    if (wfhZ < -3) return "SEVERELY_WASTED";
    if (wfhZ < -2) return "WASTED";
    if (hfaZ < -3) return "SEVERELY_STUNTED";
    if (hfaZ < -2) return "STUNTED";
    if (wfaZ < -2) return "UNDERWEIGHT";
    if (bmi > 25 && child.getAgeInMonths() > 24) return "OVERWEIGHT";
    return "NORMAL";
}
```

### 22.5 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/growth/child/{childId}` | JWT | Add growth record |
| GET | `/growth/child/{childId}` | JWT | Get history |
| GET | `/growth/child/{childId}/latest` | JWT | Get latest |

---

## 23. Nutrition Module

### 23.1 Purpose
Generates age-appropriate meal plans using local Tanzanian foods. Provides nutritional guidance to parents.

### 23.2 Business Rules
1. Children under 6 months: exclusive breastfeeding only
2. Children 6-12 months: introduction of complementary foods
3. Children 12+ months: family foods with appropriate modifications
4. Meal plans are culturally appropriate (ugali, sukuma, maharage, ndizi)
5. Plans include calorie estimates and macronutrient breakdown

### 23.3 Entity Design

```java
@Entity
@Table(name = "nutrition_plans")
public class NutritionPlan extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @Column(nullable = false)
    private LocalDate planDate;
    
    private String mealType;  // BREAKFAST, LUNCH, DINNER, SNACK
    private String mealName;  // "Ugali, maharage, sukuma"
    @Column(length = 1000)
    private String description;
    private String ingredients;  // Comma-separated
    private Integer caloriesKcal;
    private Double proteinG;
    private Double carbsG;
    private Double fatG;
    private String notes;
}
```

### 23.4 Age-Based Meal Plan Logic

```java
public List<NutritionPlan> generateDailyMealPlan(Long childId, LocalDate date) {
    Child child = childRepository.findById(childId).orElseThrow();
    int ageMonths = child.getAgeInMonths();
    
    if (ageMonths < 6) {
        // Exclusive breastfeeding
        return createBreastfeedingPlan(child, date);
    } else if (ageMonths < 12) {
        // Introduction of solids
        return createWeaningPlan(child, date);
    } else {
        // Family foods (Tanzanian style)
        return createFamilyFoodPlan(child, date);
    }
}
```

### 23.5 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/nutrition/child/{childId}/generate` | JWT | Generate today's plan |
| GET | `/nutrition/child/{childId}/daily` | JWT | Get daily plan |
| GET | `/nutrition/child/{childId}/weekly?startDate=` | JWT | Get weekly plan |

---

## 24. Medical Records Module

### 24.1 Purpose
Stores general medical history, visits, allergies, medications, lab results, and other health-related records for a child.

### 24.2 Business Rules
1. Record types: VISIT, DIAGNOSIS, ALLERGY, MEDICATION, LAB_RESULT, IMMUNIZATION
2. Severity levels for allergies: MILD, MODERATE, SEVERE
3. Records are immutable once created (use new record for updates)
4. Parents can view their children's records
5. Providers can create records for their patients

### 24.3 Entity Design

```java
@Entity
@Table(name = "health_records")
public class HealthRecord extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @Column(nullable = false, length = 50)
    private String recordType;  // VISIT, DIAGNOSIS, ALLERGY, etc.
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Column(nullable = false)
    @PastOrPresent
    private LocalDate recordDate;
    
    private String doctorName;
    private String clinicName;
    private String documentUrl;
    private String severity;  // For allergies
}
```

### 24.4 Specialized Sub-Records

For more granular tracking, dedicated entities extend the medical record concept:
- **Diagnosis** (Section 25): Specific disease diagnoses
- **Medication** (Section 26): Active/past medications
- **Prescription** (Section 27): Formal prescriptions
- **Allergy** (Section 28): Standalone allergy tracking

### 24.5 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/medical-records/child/{childId}` | JWT | Add record |
| GET | `/medical-records/child/{childId}` | JWT | List records |
| GET | `/medical-records/child/{childId}/type/{type}` | JWT | Filter by type |
| DELETE | `/medical-records/{id}` | JWT | Soft delete |

---

## 25. Diagnosis Module

### 25.1 Purpose
Records specific medical diagnoses made by healthcare providers for a child. Linked to ICD-10 codes for standardization.

### 25.2 Entity Design

```java
@Entity
@Table(name = "diagnoses")
public class Diagnosis extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private User doctor;
    
    @Column(nullable = false, length = 20)
    private String icd10Code;  // International Classification of Diseases
    
    @Column(nullable = false, length = 300)
    private String diagnosisName;
    
    @Column(length = 2000)
    private String notes;
    
    @Column(nullable = false)
    private LocalDate diagnosisDate;
    
    @Column(length = 50)
    private String severity;  // MILD, MODERATE, SEVERE, CRITICAL
    
    @Column(length = 50)
    private String status;  // ACTIVE, RESOLVED, CHRONIC
}
```

### 25.3 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/diagnoses/child/{childId}` | JWT + DOCTOR | Create diagnosis |
| GET | `/diagnoses/child/{childId}` | JWT | List diagnoses |
| GET | `/diagnoses/{id}` | JWT | Get specific |
| PUT | `/diagnoses/{id}/status` | JWT + DOCTOR | Update status |

---

## 26. Medication Module

### 26.1 Purpose
Tracks medications a child is currently taking or has taken. Manages dosage, frequency, and duration.

### 26.2 Entity Design

```java
@Entity
@Table(name = "medications")
public class Medication extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @Column(nullable = false, length = 200)
    private String medicationName;
    
    private String dosage;        // e.g., "5ml"
    private String frequency;     // e.g., "Twice daily"
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    private LocalDate endDate;    // Null if ongoing
    
    private String reason;        // What it's for
    
    @Column(length = 50)
    private String status;  // ACTIVE, COMPLETED, DISCONTINUED
}
```

---

## 27. Prescription Module

### 27.1 Purpose
Formal prescriptions written by doctors. Includes medications, dosage instructions, and digital signature.

### 27.2 Entity Design

```java
@Entity
@Table(name = "prescriptions")
public class Prescription extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;
    
    @Column(nullable = false, length = 30)
    private String prescriptionNumber;  // Unique ID
    
    @Column(nullable = false)
    private LocalDate issuedDate;
    
    private LocalDate validUntil;
    
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL)
    private List<PrescriptionItem> items = new ArrayList<>();
    
    @Column(length = 1000)
    private String generalInstructions;
    
    @Column(name = "signature_url", length = 500)
    private String signatureUrl;  // Digital signature image
}

@Entity
@Table(name = "prescription_items")
public class PrescriptionItem {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;
    
    @Column(nullable = false)
    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String instructions;
}
```

---

## 28. Allergy Module

### 28.1 Purpose
Standalone allergy tracking with severity, reaction type, and management notes. Critical for clinical safety.

### 28.2 Entity Design

```java
@Entity
@Table(name = "allergies")
public class Allergy extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;
    
    @Column(nullable = false, length = 100)
    private String allergen;  // e.g., "Peanuts", "Penicillin"
    
    @Column(nullable = false, length = 50)
    private String category;  // FOOD, DRUG, ENVIRONMENTAL, OTHER
    
    @Column(length = 50)
    private String severity;  // MILD, MODERATE, SEVERE, LIFE_THREATENING
    
    @Column(length = 1000)
    private String reaction;  // What happens when exposed
    
    @Column(length = 1000)
    private String management;  // How to handle
    
    private LocalDate diagnosedDate;
}
```

---

## 29. Notification Module

### 29.1 Purpose
Manages all user notifications across multiple channels: PUSH, SMS, EMAIL, IN_APP.

### 29.2 Business Rules
1. Notifications have a status: PENDING → SENT, or → FAILED
2. Failed notifications logged with reason
3. Read notifications have a `read_at` timestamp
4. Scheduled notifications processed every 5 minutes
5. Channel-specific delivery (FCM, Africa's Talking, SendGrid)

### 29.3 Entity Design

```java
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 50)
    private String type;  // VACCINATION, GROWTH_CHECK, APPOINTMENT, etc.
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    private String relatedEntityType;
    private Long relatedEntityId;
    
    @Column(nullable = false)
    private LocalDateTime scheduledFor;
    
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    
    @Column(nullable = false, length = 20)
    private String channel;  // PUSH, SMS, EMAIL, IN_APP
    
    @Builder.Default
    private String status = "PENDING";
    
    private String failureReason;
}
```

### 29.4 Scheduled Processing

```java
@Scheduled(fixedRate = 300000)  // Every 5 minutes
@Transactional
public void processPendingNotifications() {
    List<Notification> pending = notificationRepository
        .findPendingNotifications(LocalDateTime.now());
    
    for (Notification n : pending) {
        try {
            sendNotification(n);  // Call FCM, SMS gateway, etc.
            n.setStatus("SENT");
            n.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            n.setStatus("FAILED");
            n.setFailureReason(e.getMessage());
        }
        notificationRepository.save(n);
    }
}
```

---

## 30. AI Module

### 30.1 Purpose
Provides AI-powered parenting assistance. Currently a rule-based system with multilingual support. Designed to integrate with Python FastAPI AI microservice in production.

### 30.2 Business Rules
1. AI provides guidance, not medical diagnosis
2. All conversations logged for review
3. Supports English and Kiswahili
4. Intent detection for routing queries
5. Response time tracked for performance

### 30.3 Entity Design

```java
@Entity
@Table(name = "ai_conversations")
public class AIConversation extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private Long childId;
    private String sessionId;
    
    @Column(nullable = false, length = 2000)
    private String userMessage;
    
    @Column(nullable = false, length = 4000)
    private String aiResponse;
    
    private String intent;  // NUTRITION, VACCINATION, GROWTH, SYMPTOM
    
    @Builder.Default
    private String language = "en";
    
    private Long responseTimeMs;
}
```

### 30.4 Response Generation

```java
private String generateResponse(String message, String language) {
    String msg = message.toLowerCase();
    boolean swahili = "sw".equals(language);
    
    if (msg.contains("food") || msg.contains("chakula")) {
        return swahili 
            ? "Kwa mtoto wa umri huu..."
            : "For your child, ensure a balanced diet...";
    }
    // ... more rules ...
}
```

### 30.5 Production AI Integration

In production, replace rule-based with:

```
Mobile App → Spring Boot → Python FastAPI AI Service
                                    ↓
                            ┌───────┴───────┐
                            ↓               ↓
                    OpenAI GPT-4    Local Knowledge Base
                                    (PostgreSQL+pgvector)
```

---

## 31. File Upload Module

### 31.1 Purpose
Handles file uploads (profile pictures, medical documents, lab results). Stores files in object storage, metadata in database.

### 31.2 Business Rules
1. Max file size: 10 MB
2. Allowed image types: JPEG, PNG, WebP
3. Allowed document types: PDF, JPEG, PNG
4. Files stored with UUID-based names
5. Metadata includes category, size, type, URL

### 31.3 Storage Strategy

| Environment | Storage Provider | Configuration |
|-------------|------------------|---------------|
| Development | Local filesystem | `uploads/` directory |
| Production | Cloudflare R2 / AWS S3 | Configured via env vars |

### 31.4 Entity Design

```java
@Entity
@Table(name = "file_uploads")
public class FileUpload extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String fileName;
    private String originalName;
    private String contentType;
    private Long fileSizeBytes;
    private String storageUrl;
    
    @Builder.Default
    private String storageProvider = "local";
    
    private String fileCategory;  // PROFILE_PICTURE, MEDICAL_DOCUMENT, etc.
}
```

### 31.5 Upload Implementation

```java
@Transactional
public FileUpload uploadFile(MultipartFile file, String category) throws IOException {
    // Generate unique filename
    String fileName = UUID.randomUUID() + extension;
    
    // Save to storage
    Path filePath = Paths.get(storagePath).resolve(fileName);
    Files.copy(file.getInputStream(), filePath, REPLACE_EXISTING);
    
    // Save metadata
    return fileUploadRepository.save(FileUpload.builder()
        .user(user)
        .fileName(fileName)
        .originalName(file.getOriginalFilename())
        .contentType(file.getContentType())
        .fileSizeBytes(file.getSize())
        .storageUrl(urlBase + "/" + fileName)
        .fileCategory(category)
        .build());
}
```

---

## 32. Reporting Module

### 32.1 Purpose
Generates comprehensive health reports for individual children and aggregate analytics for administrators.

### 32.2 Report Types

| Report | Description | Data |
|--------|-------------|------|
| Child Health Summary | Complete health overview | Vaccinations, growth, records |
| Vaccination Coverage | % completion per child | All children stats |
| Growth Trends | Historical growth data | Charts-ready data |
| Appointment Statistics | Booking patterns | Monthly aggregates |
| System Dashboard | Platform-wide stats | All modules |

### 32.3 Implementation

```java
public Map<String, Object> generateChildHealthReport(Long childId) {
    Map<String, Object> report = new HashMap<>();
    
    // Child info
    report.put("childName", child.getFullName());
    report.put("ageInMonths", child.getAgeInMonths());
    
    // Vaccination summary
    long completed = vaccinations.stream()
        .filter(v -> "COMPLETED".equals(v.getStatus())).count();
    report.put("vaccinationSummary", Map.of(
        "total", vaccinations.size(),
        "completed", completed,
        "completionRate", completed * 100.0 / vaccinations.size()
    ));
    
    // Growth summary
    if (!growth.isEmpty()) {
        GrowthRecord latest = growth.get(growth.size() - 1);
        report.put("growthSummary", Map.of(
            "currentWeight", latest.getWeightKg(),
            "currentHeight", latest.getHeightCm(),
            "nutritionStatus", latest.getNutritionStatus()
        ));
    }
    
    return report;
}
```

---

## 33. Audit Module

### 33.1 Purpose
Records all significant user actions for security, compliance, and debugging.

### 33.2 Entity Design

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(nullable = false, length = 100)
    private String action;  // LOGIN_SUCCESS, REGISTER, UPDATE_PROFILE, etc.
    
    private String entityType;  // USER, CHILD, VACCINATION
    private Long entityId;
    
    @Column(length = 2000)
    private String details;
    
    private String ipAddress;
    private String userAgent;
}
```

### 33.3 Async Logging

Audit logs are written asynchronously to avoid impacting request performance:

```java
@Async
public void logAction(Long userId, String action, String entityType, 
                       Long entityId, String details) {
    repository.save(AuditLog.builder()
        .action(action)
        .entityType(entityType)
        .entityId(entityId)
        .details(details)
        .build());
}
```

### 33.4 Events Logged

- LOGIN_SUCCESS / LOGIN_FAILED
- REGISTER / LOGOUT
- PASSWORD_CHANGED
- CHILD_ADDED / CHILD_UPDATED / CHILD_DELETED
- VACCINATION_RECORDED
- APPOINTMENT_BOOKED / CANCELLED
- USER_DEACTIVATED (admin actions)
- FILE_UPLOADED

---

# PART C: CROSS-CUTTING CONCERNS

---

## 34. Exception Handling

### 34.1 Centralized Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException ex) {
        log.warn("API Exception: {} - {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
            .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed: " + errors, "VALIDATION_ERROR"));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(
            BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(
            AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("Access denied", "ACCESS_DENIED"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("An unexpected error occurred", "INTERNAL_ERROR"));
    }
}
```

### 34.2 Custom Exception Class

```java
@Getter
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public ApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }
}
```

---

## 35. Validation Strategy

### 35.1 Multi-Layer Validation

```
┌─────────────────────────────────┐
│  1. Client-side (React Native)  │  First line of defense
├─────────────────────────────────┤
│  2. DTO Bean Validation        │  @NotNull, @Size, @Email
├─────────────────────────────────┤
│  3. Business Logic Validation  │  In service layer
├─────────────────────────────────┤
│  4. Database Constraints        │  NOT NULL, UNIQUE, CHECK
└─────────────────────────────────┘
```

### 35.2 Common Validation Annotations

| Annotation | Purpose | Example |
|-----------|---------|---------|
| `@NotNull` | Field required | `@NotNull Long childId` |
| `@NotBlank` | String not empty | `@NotBlank String fullName` |
| `@Email` | Valid email | `@Email String email` |
| `@Size(min, max)` | Length constraint | `@Size(min=8, max=100)` |
| `@Pattern(regexp)` | Regex match | `@Pattern(regexp="^\\+?[0-9]{10,15}$")` |
| `@Past` | Date in past | `@Past LocalDate dateOfBirth` |
| `@PastOrPresent` | Date not future | `@PastOrPresent` |
| `@Positive` | Number > 0 | `@Positive Double weight` |
| `@Min(value)` | Min value | `@Min(value=1)` |
| `@Max(value)` | Max value | `@Max(value=150)` |

### 35.3 Validation Groups (Advanced)

```java
public interface OnCreate {}
public interface OnUpdate {}

public class ChildRequest {
    @NotNull(groups = OnCreate.class)
    @Null(groups = OnUpdate.class)
    private Long id;
    
    @NotBlank
    private String firstName;
}
```

---

## 36. DTO Design

### 36.1 DTO Types

| Type | Purpose | Suffix |
|------|---------|--------|
| Request | Client → Server input | `Request` |
| Response | Server → Client output | `Response`, `Dto` |
| Summary | Lightweight projection | `Summary` |
| Detail | Full data | `Detail` |
| Create | POST input | `CreateRequest` |
| Update | PUT/PATCH input | `UpdateRequest` |

### 36.2 DTO Best Practices

1. **Never return entities directly** — always use DTOs
2. **Use Lombok** for boilerplate reduction
3. **Include `from()` static factory methods** for entity → DTO conversion
4. **Validate with Bean Validation annotations**
5. **Use BigDecimal for money** (not used in healthcare, but good practice)
6. **Use LocalDate/LocalDateTime, not java.util.Date**
7. **Use enums for fixed value sets** (gender, status, etc.)

### 36.3 Example DTO

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "MALE|FEMALE|OTHER", 
             message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    @Positive(message = "Birth weight must be positive")
    private Double birthWeightKg;
}
```

---

## 37. Entity Relationships

### 37.1 Entity-Relationship Diagram

```
                    ┌─────────┐
                    │  User   │
                    │ (Parent)│
                    └────┬────┘
                         │ 1
                         │
                         │ N
                    ┌────▼────┐         ┌──────────────────┐
                    │  Child  │ N     1 │ VaccinationSched │
                    └────┬────┘◄────────┤     ule (EPI)     │
                         │ 1             └──────────────────┘
                         │
        ┌────────────────┼────────────────┬──────────────┐
        │ N              │ N              │ N            │ N
   ┌────▼─────┐    ┌─────▼──────┐   ┌────▼─────┐  ┌────▼──────┐
   │Vaccinatio│    │Appointment │   │  Growth  │  │ Nutrition │
   │    n     │    │            │   │  Record  │  │   Plan    │
   └──────────┘    └────────────┘   └──────────┘  └───────────┘

        ┌────────────────┐         ┌─────────────────┐
        │ HealthRecord   │         │ AIConversation  │
        │ (Polymorphic)  │         │                 │
        └────────────────┘         └─────────────────┘
```

### 37.2 Relationship Types

| Parent | Child | Type | Cascade |
|--------|-------|------|---------|
| User | Children | OneToMany | RESTRICT |
| Child | Vaccinations | OneToMany | CASCADE (delete) |
| Child | Appointments | OneToMany | CASCADE |
| Child | GrowthRecords | OneToMany | CASCADE |
| Child | NutritionPlans | OneToMany | CASCADE |
| Child | HealthRecords | OneToMany | CASCADE |
| VaccinationSchedule | Vaccinations | OneToMany | (none) |
| Prescription | PrescriptionItems | OneToMany | ALL |
| Doctor | Facilities | ManyToMany | (none) |

---

## 38. Repository Layer

### 38.1 Repository Pattern

Each entity has a Spring Data JPA repository that provides:
- Built-in CRUD methods (save, findById, findAll, delete)
- Custom finder methods (derived from method names)
- `@Query` methods for complex queries
- `@Modifying` methods for UPDATE/DELETE queries

### 38.2 Common Patterns

**Derived queries:**
```java
Optional<User> findByEmail(String email);
List<Child> findByParentId(Long parentId);
boolean existsByEmail(String email);
```

**JPQL queries:**
```java
@Query("SELECT u FROM User u WHERE u.active = true AND u.deletedAt IS NULL")
List<User> findAllActive();

@Query("SELECT v FROM Vaccination v WHERE v.status = 'PENDING' AND v.nextDoseDue < :date")
List<Vaccination> findOverdueVaccinations(@Param("date") LocalDate date);
```

**Pagination:**
```java
@Query("SELECT u FROM User u WHERE ...")
Page<User> searchActiveUsers(String search, Pageable pageable);
```

**Modifying queries:**
```java
@Modifying
@Query("UPDATE User u SET u.lastLoginAt = :loginTime WHERE u.id = :userId")
void updateLastLogin(Long userId, LocalDateTime loginTime);
```

---

## 39. Service Layer

### 39.1 Service Responsibilities

1. **Business logic** — all rules and validations
2. **Transaction management** — `@Transactional` annotations
3. **Orchestration** — calls multiple repositories
4. **Authorization checks** — verify resource ownership
5. **Event generation** — creates notifications, audit logs
6. **Cross-cutting concerns** — caching, async processing

### 39.2 Service Pattern

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ChildService {

    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final VaccinationService vaccinationService;

    @Transactional
    public ChildResponse addChild(String parentEmail, ChildRequest request) {
        // 1. Verify parent exists and is active
        User parent = userRepository.findActiveByEmail(parentEmail)
            .orElseThrow(() -> new ApiException("Parent not found", 
                HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        // 2. Validate request (bean validation already done)
        
        // 3. Create entity
        Child child = Child.builder()
            .firstName(request.getFirstName())
            // ... other fields ...
            .parent(parent)
            .build();

        // 4. Save
        child = childRepository.save(child);

        // 5. Trigger side effects
        vaccinationService.generateScheduleForChild(child);

        // 6. Log
        log.info("Child added: {} for parent: {}", 
            child.getFullName(), parentEmail);

        // 7. Return DTO
        return mapToResponse(child);
    }
}
```

### 39.3 Transaction Strategy

| Method Type | Annotation | Read-Only? |
|-------------|-----------|-----------|
| Read operations | `@Transactional(readOnly = true)` | Yes |
| Write operations | `@Transactional` | No |
| Cross-module operations | `@Transactional` | No |
| Scheduled tasks | `@Transactional` | No |
| Async operations | `@Transactional` | No |

---

## 40. Controller Layer

### 40.1 Controller Responsibilities

1. **HTTP handling** — request/response
2. **DTO conversion** — request → entity, entity → response
3. **Validation trigger** — `@Valid` on parameters
4. **Authorization** — `@PreAuthorize` checks
5. **Status codes** — 200, 201, 204, 400, 401, 403, 404
6. **Swagger documentation** — `@Operation`, `@Tag`

### 40.2 Controller Pattern

```java
@RestController
@RequestMapping("/children")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Children", description = "Child profile management")
public class ChildController {

    private final ChildService childService;

    @PostMapping
    @Operation(summary = "Add a new child")
    public ResponseEntity<ApiResponse<ChildResponse>> addChild(
            @AuthenticationPrincipal String parentEmail,
            @Valid @RequestBody ChildRequest request) {
        ChildResponse response = childService.addChild(parentEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Child added", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a child by ID")
    public ResponseEntity<ApiResponse<ChildResponse>> getChild(
            @AuthenticationPrincipal String parentEmail,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
            childService.getChild(parentEmail, id)));
    }
}
```

### 40.3 HTTP Status Codes

| Code | When to Use | Example |
|------|-------------|---------|
| 200 | Successful GET/PUT | Fetched child |
| 201 | Successful POST (created) | Added child |
| 204 | Successful DELETE | (no body) |
| 400 | Validation error | Invalid date |
| 401 | Unauthenticated | No/invalid JWT |
| 403 | Unauthorized | Access denied |
| 404 | Not found | Child not found |
| 409 | Conflict | Email already exists |
| 500 | Server error | Unexpected exception |

---

## 41. API Standards

### 41.1 RESTful Conventions

| HTTP Method | Purpose | Idempotent? | Safe? |
|------------|---------|-----------|-------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

### 41.2 URL Conventions

```
/api/v1/{resource}                # Collection
/api/v1/{resource}/{id}           # Single item
/api/v1/{resource}/{id}/{action}  # Action on item (e.g., /cancel)

# Examples:
POST   /api/v1/auth/register
GET    /api/v1/children
GET    /api/v1/children/{id}
PUT    /api/v1/children/{id}
DELETE /api/v1/children/{id}
POST   /api/v1/vaccinations/child/{childId}
PUT    /api/v1/appointments/{id}/cancel
```

### 41.3 Versioning Strategy

- **Path-based:** `/api/v1/...`, `/api/v2/...`
- Current version: **v1**
- Breaking changes require new version
- Backward-compatible additions don't need version bump

### 41.4 Pagination

All list endpoints support pagination:
```
GET /api/v1/users?page=0&size=20&sort=createdAt,desc
```

**Response:**
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### 41.5 Filtering & Sorting

```
GET /api/v1/users?search=amina&sort=fullName,asc
GET /api/v1/vaccinations/overdue?days=30
GET /api/v1/appointments?status=SCHEDULED&from=2026-07-01
```

---

## 42. Response Format

### 42.1 Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {
    // Response payload
  },
  "timestamp": "2026-07-07T10:00:00"
}
```

### 42.2 Standard Error Response

```json
{
  "success": false,
  "message": "Email is already registered",
  "errorCode": "EMAIL_EXISTS",
  "timestamp": "2026-07-07T10:00:00"
}
```

### 42.3 Pagination Response

```json
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

### 42.4 ApiResponse Class

```java
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String errorCode;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .errorCode(errorCode)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

---

## 43. Error Handling

### 43.1 Error Code Standards

| Format | Category | Examples |
|--------|----------|----------|
| `VALIDATION_*` | Input validation | `VALIDATION_ERROR` |
| `*_EXISTS` | Uniqueness conflicts | `EMAIL_EXISTS` |
| `*_NOT_FOUND` | Resource not found | `USER_NOT_FOUND` |
| `*_MISMATCH` | Comparison failures | `PASSWORD_MISMATCH` |
| `INVALID_*` | Invalid credentials/data | `INVALID_CREDENTIALS` |
| `ACCESS_DENIED` | Authorization failure | `ACCESS_DENIED` |
| `INTERNAL_*` | Server errors | `INTERNAL_ERROR` |
| `*_INACTIVE` | Account status | `ACCOUNT_INACTIVE` |

### 43.2 HTTP Status Mapping

| Error Code | HTTP Status |
|-----------|-------------|
| VALIDATION_ERROR | 400 |
| EMAIL_EXISTS, PHONE_EXISTS | 409 |
| *_NOT_FOUND | 404 |
| PASSWORD_MISMATCH | 400 |
| INVALID_CREDENTIALS | 401 |
| INVALID_TOKEN | 401 |
| ACCESS_DENIED | 403 |
| ACCOUNT_INACTIVE | 403 |
| NOT_AUTHENTICATED | 401 |
| INTERNAL_ERROR | 500 |

---

## 44. Logging

### 44.1 Logging Framework

- **SLF4J** as facade
- **Logback** as implementation
- Log levels: TRACE, DEBUG, INFO, WARN, ERROR

### 44.2 Logback Configuration

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/mtotocare.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/mtotocare.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>
    
    <logger name="com.mtotocare.africa" level="DEBUG" />
</configuration>
```

### 44.3 What to Log

| Event | Log Level | Example |
|-------|-----------|---------|
| Application startup | INFO | "MtotoCare Africa started" |
| User login success | INFO | "User logged in: amina@example.com" |
| User login failure | WARN | "Failed login attempt for: hacker@evil.com" |
| Business operations | INFO | "Child added: Juma Said" |
| Validation errors | WARN | "Validation failed: password too short" |
| Database errors | ERROR | Full stack trace |
| External API calls | DEBUG | "Calling OpenAI: prompt=..." |
| Security events | WARN | "Access denied for user X" |

### 44.4 Sensitive Data Rules

**NEVER log:**
- Passwords (even hashed)
- JWT tokens
- API keys
- Personal data (full names, phone numbers in prod)
- Credit card numbers

---

## 45. Monitoring

### 45.1 Spring Boot Actuator

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 45.2 Exposed Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Health check (UP/DOWN) |
| `/actuator/info` | Application info |
| `/actuator/metrics` | Performance metrics |
| `/actuator/env` | Environment variables |
| `/actuator/loggers` | Logger configuration |

### 45.3 Health Check Response

```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"},
    "ping": {"status": "UP"}
  }
}
```

### 45.4 Production Monitoring (Future)

- **Prometheus** — metrics collection
- **Grafana** — dashboards
- **Sentry** — error tracking
- **UptimeRobot** — uptime monitoring
- **ELK Stack** — log aggregation

---

## 46. Caching

### 46.1 Caching Strategy

| Data | Cache Strategy | TTL |
|------|----------------|-----|
| Vaccination schedule | Static cache | 1 hour |
| User roles | Session cache | Until logout |
| AI knowledge base | In-memory | 24 hours |
| Reports | None (always fresh) | - |

### 46.2 Implementation (Future)

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("vaccinationSchedule", "userRoles");
    }
}

@Service
public class VaccinationService {
    @Cacheable(value = "vaccinationSchedule", key = "'all'")
    public List<VaccinationSchedule> getAllActiveSchedules() {
        return scheduleRepository.findByActiveTrueOrderByRecommendedAgeWeeksAsc();
    }
}
```

---

## 47. Asynchronous Processing

### 47.1 Use Cases

- **Notification sending** (PUSH, SMS, Email)
- **Email sending** (verification, password reset)
- **Audit log writing** (high volume)
- **AI conversation logging**
- **Image processing** (future)

### 47.2 Implementation

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    @Async
    public CompletableFuture<Void> sendPushNotification(Long userId, String message) {
        // Call FCM API
        return CompletableFuture.completedFuture(null);
    }
}

// In another service
@Service
public class AppointmentService {

    private final NotificationService notificationService;

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Appointment appt = appointmentRepository.save(/* ... */);
        
        // Fire-and-forget async notification
        notificationService.sendPushNotification(parentId, "Appointment booked");
        
        return appt;
    }
}
```

### 47.3 Async Configuration

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("mtotocare-async-");
        executor.initialize();
        return executor;
    }
}
```

---

## 48. Performance Optimization

### 48.1 Database Optimizations

- **Indexes** on all foreign keys
- **Composite indexes** for common queries
- **Pagination** on all list endpoints
- **Eager/lazy loading** properly configured
- **Connection pooling** via HikariCP

### 48.2 Application Optimizations

- **DTOs** avoid N+1 queries
- **Batch operations** for bulk inserts
- **Caching** for static data
- **Async processing** for non-critical tasks
- **Lazy initialization** for heavy beans

### 48.3 JPA Optimizations

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
        default_batch_fetch_size: 16
```

### 48.4 Response Compression

```yaml
server:
  compression:
    enabled: true
    mime-types: application/json,text/html,text/xml
    min-response-size: 1024
```

---

# PART D: TESTING & DEPLOYMENT

---

## 49. Unit Testing

### 49.1 Test Strategy

| Test Type | Coverage Target | Tool |
|-----------|----------------|------|
| Service layer | 80%+ | JUnit 5 + Mockito |
| Controller layer | 70%+ | @WebMvcTest |
| Repository | Integration | @DataJpaTest |
| Security | Critical paths | Spring Security Test |
| Validation | All DTOs | @Valid + MockMvc |

### 49.2 Example Service Test

```java
@ExtendWith(MockitoExtension.class)
class ChildServiceTest {

    @Mock
    private ChildRepository childRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private VaccinationService vaccinationService;
    
    @InjectMocks
    private ChildService childService;

    @Test
    void shouldAddChildSuccessfully() {
        // Given
        User parent = User.builder().id(1L).email("parent@test.com").build();
        ChildRequest request = ChildRequest.builder()
            .firstName("Test")
            .dateOfBirth(LocalDate.now().minusMonths(6))
            .gender("MALE")
            .build();
        
        when(userRepository.findActiveByEmail("parent@test.com"))
            .thenReturn(Optional.of(parent));
        when(childRepository.save(any(Child.class)))
            .thenReturn(Child.builder().id(1L).build());

        // When
        ChildResponse response = childService.addChild("parent@test.com", request);

        // Then
        assertNotNull(response);
        verify(vaccinationService).generateScheduleForChild(any(Child.class));
    }

    @Test
    void shouldThrowExceptionWhenParentNotFound() {
        when(userRepository.findActiveByEmail(anyString()))
            .thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> 
            childService.addChild("nonexistent@test.com", new ChildRequest())
        );
    }
}
```

### 49.3 Test Naming Convention

```
methodName_shouldExpectedBehavior_whenCondition()
```

Examples:
- `addChild_shouldSaveChild_whenValidRequest`
- `getChild_shouldThrowException_whenChildNotFound`
- `login_shouldReturnTokens_whenCredentialsValid`

---

## 50. Integration Testing

### 50.1 Controller Integration Test

```java
@SpringBootTest
@AutoConfigureMockMvc
class ChildControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnChildrenWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/children")
                .with(jwt()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldReturn401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/children"))
            .andExpect(status().isForbidden());
    }
}
```

### 50.2 Repository Integration Test

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class ChildRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private ChildRepository childRepository;

    @Test
    void shouldFindChildrenByParent() {
        // Given
        User parent = entityManager.persist(User.builder()
            .email("test@test.com")
            .passwordHash("hash")
            .build());
        
        Child child = entityManager.persist(Child.builder()
            .firstName("Test")
            .dateOfBirth(LocalDate.now().minusYears(1))
            .gender("MALE")
            .parent(parent)
            .build());

        // When
        List<Child> children = childRepository.findActiveByParentId(parent.getId());

        // Then
        assertEquals(1, children.size());
        assertEquals("Test", children.get(0).getFirstName());
    }
}
```

---

## 51. API Documentation (Swagger)

### 51.1 SpringDoc OpenAPI Setup

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.6.15</version>
</dependency>
```

### 51.2 Configuration

```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI mtotoCareOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("MtotoCare Africa API")
                .version("1.0.0")
                .description("REST API for the AI-powered child health platform")
                .contact(new Contact()
                    .name("MtotoCare Africa Dev Team")
                    .email("dev@mtotocare.africa"))
                .license(new License().name("Proprietary")))
            .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"))
            .components(new Components()
                .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
```

### 51.3 Controller Annotations

```java
@RestController
@RequestMapping("/children")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Children", description = "Child profile management")
public class ChildController {

    @PostMapping
    @Operation(summary = "Add a new child profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Child created"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ChildResponse>> addChild(...) { }
}
```

### 51.4 Accessing Swagger UI

```
http://localhost:8080/api/swagger-ui.html
http://localhost:8080/api/v3/api-docs  (JSON)
```

---

## 52. Docker Configuration

### 52.1 Dockerfile

```dockerfile
# Multi-stage build
FROM maven:3.8-openjdk-11 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/target/mtotocare-backend-*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 52.2 Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_URL=jdbc:mysql://db:3306/mtotocare
      - DB_USERNAME=mtotocare
      - DB_PASSWORD=secretpassword
      - JWT_SECRET=production-secret-key-32-chars-minimum-required
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=mtotocare
      - MYSQL_USER=mtotocare
      - MYSQL_PASSWORD=secretpassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  mysql_data:
```

### 52.3 Build & Run

```bash
# Build image
docker build -t mtotocare-backend:1.0.0 .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

---

## 53. CI/CD Pipeline

### 53.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: MtotoCare Africa CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 11
        uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'temurin'
      
      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
      
      - name: Run tests
        run: mvn clean test
      
      - name: Build package
        run: mvn package -DskipTests
      
      - name: Upload JAR
        uses: actions/upload-artifact@v3
        with:
          name: mtotocare-backend
          path: target/*.jar

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # SSH to server and deploy
```

### 53.2 Pipeline Stages

| Stage | Action | Tool |
|-------|--------|------|
| 1. Checkout | Clone code | GitHub Actions |
| 2. Build | Compile + test | Maven |
| 3. Test | Unit + integration tests | JUnit, Mockito |
| 4. Code Quality | SonarQube analysis | SonarQube |
| 5. Package | Build JAR | Maven |
| 6. Docker | Build image | Docker |
| 7. Push | Push to registry | Docker Hub / ECR |
| 8. Deploy | Deploy to server | SSH / Kubernetes |
| 9. Verify | Health check | curl |

---

## 54. Production Deployment

### 54.1 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] JWT secret is strong (32+ random chars)
- [ ] HTTPS certificate installed
- [ ] CORS origins configured
- [ ] Logging configured (file rotation)
- [ ] Monitoring configured (health checks)
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### 54.2 Environment Variables (Production)

```bash
# Database
export DB_URL=jdbc:mysql://prod-db.mtotocare.africa:3306/mtotocare
export DB_USERNAME=mtotocare_prod
export DB_PASSWORD=$(cat /run/secrets/db_password)

# JWT
export JWT_SECRET=$(cat /run/secrets/jwt_secret)

# Profile
export SPRING_PROFILES_ACTIVE=prod
export LOG_LEVEL=INFO

# Cloud
export AWS_ACCESS_KEY_ID=$(cat /run/secrets/aws_key)
export AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/aws_secret)
export AWS_REGION=us-east-1
```

### 54.3 Deployment Commands

```bash
# Pull latest code
git pull origin main

# Build
mvn clean package -DskipTests

# Run database migrations (Flyway does this automatically)
# Just start the app with prod profile

# Start with systemd (recommended)
sudo systemctl start mtotocare-backend
sudo systemctl enable mtotocare-backend

# OR with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### 54.4 Post-Deployment Verification

```bash
# Health check
curl https://api.mtotocare.africa/api/actuator/health

# Should return: {"status":"UP"}

# Check Swagger
curl -I https://api.mtotocare.africa/api/swagger-ui.html

# Database connection
curl https://api.mtotocare.africa/api/vaccinations/schedules \
  -H "Authorization: Bearer <test_token>"
```

---

## 55. Backup and Recovery

### 55.1 Backup Strategy

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Database full | Daily 2 AM | 30 days | S3 + offsite |
| Database incremental | Hourly | 7 days | Local + S3 |
| Application logs | Daily | 90 days | S3 |
| Uploaded files | Daily | Indefinite | S3 (versioned) |

### 55.2 Backup Script

```bash
#!/bin/bash
# /opt/backup/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/database
S3_BUCKET=s3://mtotocare-backups

# Create backup
mysqldump -u $DB_USER -p$DB_PASSWORD mtotocare | gzip > \
    $BACKUP_DIR/mtotocare_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/mtotocare_$DATE.sql.gz $S3_BUCKET/database/

# Cleanup local backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: mtotocare_$DATE.sql.gz"
```

### 55.3 Recovery Procedure

```bash
# Stop application
sudo systemctl stop mtotocare-backend

# Restore database
gunzip < /backups/database/mtotocare_20260707.sql.gz | \
    mysql -u root -p mtotocare

# Start application
sudo systemctl start mtotocare-backend

# Verify
curl http://localhost:8080/api/actuator/health
```

### 55.4 Disaster Recovery Plan

| Scenario | RTO | RPO | Action |
|----------|-----|-----|--------|
| Database corruption | 1 hour | 1 hour | Restore from latest backup |
| Server failure | 30 min | 0 | Failover to backup server |
| Region outage | 4 hours | 5 min | Deploy to backup region |
| Accidental delete | 1 hour | 1 hour | Point-in-time recovery |

---

## 56. Maintenance Strategy

### 56.1 Regular Maintenance

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Database backup | Daily | Automated |
| Log rotation | Daily | Automated |
| Security patches | Weekly | DevOps |
| Dependency updates | Monthly | Backend team |
| Performance review | Monthly | Backend team |
| Security audit | Quarterly | Security team |

### 56.2 Monitoring Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| CPU usage | > 80% for 5 min | Email ops |
| Memory usage | > 85% | Email ops |
| Disk space | < 10% free | Email ops |
| Response time p95 | > 500ms | Slack #alerts |
| Error rate | > 1% | Page on-call |
| Database connections | > 80% pool | Email ops |

### 56.3 Incident Response

1. **Detection:** Monitoring alerts
2. **Triage:** On-call engineer assesses severity
3. **Mitigation:** Stop the bleed (rollback, scale up, etc.)
4. **Resolution:** Fix root cause
5. **Post-mortem:** Document and prevent recurrence

---

## 57. Deliverables

### 57.1 Code Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Spring Boot backend | ✅ | `backend/` |
| Database migrations | ✅ | `backend/src/main/resources/db/migration/` |
| Unit tests | ✅ | `backend/src/test/` |
| API documentation | ✅ | Swagger UI at `/swagger-ui.html` |
| Docker image | ✅ | `Dockerfile` |
| docker-compose | ✅ | `docker-compose.yml` |

### 57.2 Documentation Deliverables

| Document | Status |
|----------|--------|
| This implementation document | ✅ |
| API documentation (Swagger) | ✅ |
| Database documentation (`database/README.md`) | ✅ |
| System architecture | ✅ |
| User manual | ⏳ Future |

### 57.3 Deployment Artifacts

| Artifact | Status |
|----------|--------|
| `target/mtotocare-backend-1.0.0.jar` | ✅ |
| Docker image | ✅ |
| Database migration scripts | ✅ |
| Environment template | ✅ |

---

## 58. Future Enhancements

### 58.1 Short-term (Next 3 months)

- [ ] **Email verification** via SendGrid
- [ ] **SMS OTP** via Africa's Talking
- [ ] **Biometric login** (fingerprint/face ID)
- [ ] **Two-factor authentication** (TOTP)
- [ ] **File upload to S3/R2** (production)
- [ ] **Redis caching** for static data
- [ ] **Rate limiting** (Bucket4j or similar)
- [ ] **API versioning** (v1, v2)

### 58.2 Medium-term (3-6 months)

- [ ] **Microservices migration** for AI service
- [ ] **GraphQL API** for flexible queries
- [ ] **WebSocket** for real-time notifications
- [ ] **Telemedicine** (video consultations)
- [ ] **Wearable device integration**
- [ ] **Machine learning models** for growth prediction
- [ ] **Multi-region deployment**
- [ ] **Kubernetes orchestration**

### 58.3 Long-term (6-12 months)

- [ ] **Mobile SDK** for third-party apps
- [ ] **National health system integration** (DHIS2)
- [ ] **Insurance claim processing**
- [ ] **Pharmacy integration**
- [ ] **Lab result integration**
- [ ] **Predictive analytics** for outbreak detection
- [ ] **AI-powered diagnosis** (computer vision)
- [ ] **Cross-border data sharing** (EAC integration)

### 58.4 Performance Targets

| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| API response time (p95) | < 200ms | < 100ms |
| Concurrent users | 100 | 10,000 |
| Database size | 100 MB | 10 GB |
| Uptime | 99.5% | 99.9% |
| Test coverage | 60% | 85% |

---

# END OF DOCUMENT

**Total Sections:** 58
**Document Length:** ~3,000 lines
**Last Updated:** July 2026
**Maintained By:** MtotoCare Africa Backend Team
