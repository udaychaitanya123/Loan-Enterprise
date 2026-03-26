# 🏦 Enterprise Loan Management SPA

![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![Angular](https://img.shields.io/badge/Angular-17-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## One-Line Description
A multi-tenant, SaaS-based Loan Management platform used by banks and financial institutions. Each tenant (bank) operates in a fully isolated workspace with dynamic form schemas, role-based access control, EMI calculators, and real-time repayment tracking — all configurable at runtime without code changes.

## 🚀 Visual Showcase

| Login Page | Applicant Dashboard | Admin Dashboard |
| :---: | :---: | :---: |
| ![Login Page](./docs/screenshots/login_page.png) | ![Applicant Dashboard](./docs/screenshots/applicant_dashboard.png) | ![Admin Dashboard](./docs/screenshots/admin_dashboard.png) |

| Dynamic Loan Form | Global EMI Calculator | Schema Editor (No-Code Form Builder) |
| :---: | :---: | :---: |
| ![Loan Form](./docs/screenshots/loan_application_form.png) | ![EMI Calculator](./docs/screenshots/loan_calculator_full.png) | ![Schema Editor](./docs/screenshots/admin_schema_editor.png) |

## Business Use Case
Digitalizing loan processing is a major challenge for banks and financial institutions. Often, they require a solution that can be white-labeled and tailored to their specific needs without requiring constant code updates for every form change. This platform addresses this by providing a robust, multi-tenant architecture.

In our multi-tenancy model, banks like **Alpha Bank** and **Beta Finance** share the same underlying infrastructure and code but remain completely isolated at the data level. One bank's staff or customers can never see or interact with the data of another bank. 

The primary users of the system include:
*   **Applicants (Borrowers):** Register and apply for various loan types through a guided wizard.
*   **Loan Officers:** Review applications, request more information (refer), and approve or reject based on internal policies.
*   **Finance Officers:** Handle the final disbursement of funds for approved loans.
*   **Tenant Admins:** Manage their bank's user base, roles, and crucially, their loan application forms.
*   **Super Admins (Future):** Manage the overall platform and onboard new tenants.

What sets this platform apart is its dynamic extensibility. Using **JSON schema-driven forms**, a bank can redesign their entire application form for a "Personal Loan" or "Mortgage" directly through the admin panel. These changes are reflected immediately for new applicants without a single line of code being committed or a server being restarted.

## Full Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Angular | 17 | SPA, standalone components |
| **Language (FE)** | TypeScript | 5.4 | Strict mode throughout |
| **Styling** | SCSS + Angular Material | latest | Component styles + Material CDK |
| **State Management** | Angular Signals + RxJS | — | Signals for local state, RxJS for HTTP streams |
| **Forms** | Angular Reactive Forms | — | Dynamically built from JSON schema at runtime |
| **HTTP Client** | Angular HttpClient | — | Functional interceptors for auth + errors |
| **Backend Framework** | Spring Boot | 3.2 | REST API, embedded Tomcat |
| **Language (BE)** | Java | 21 | Virtual threads ready |
| **ORM** | Spring Data JPA + Hibernate | 6 | PostgreSQL dialect |
| **Database** | PostgreSQL | 16 | Row-level tenant isolation via `tenant_id` scoping |
| **Security** | Spring Security + JWT | 6 / 0.12.3 | Stateless, role-based, refresh token flow |
| **Schema Migration** | Flyway | latest | All DDL managed via versioned scripts |
| **Build Tool (BE)** | Maven | 3.9 | Dependency management + packaging |
| **Containerization** | Docker + Docker Compose | — | Single command startup |
| **Web Server** | Nginx (Alpine) | latest | Serves Angular build, proxies `/api/` to Spring Boot |
| **Password Hashing** | BCrypt | strength 12 | Secure credential storage |

## Architecture Diagram

```text
Browser (localhost:4200)
        │
        ▼
  ┌─────────────┐
  │  Nginx:80   │  ← serves Angular SPA
  │  (Docker)   │  ← proxies /api/* → Spring Boot
  └──────┬──────┘
         │ /api/v1/*
         ▼
  ┌─────────────────┐
  │  Spring Boot    │  ← JWT Auth, Tenant Context, REST APIs
  │  :8080 (Docker) │  ← Role-based endpoint guards
  └──────┬──────────┘
         │ JPA/Hibernate
         ▼
  ┌─────────────┐
  │ PostgreSQL  │  ← Row-level tenant isolation
  │ :5432       │  ← Flyway managed schema
  └─────────────┘
```

## Prerequisites
*   **Docker Desktop** 4.x+
*   **Docker Compose** v2+
*   **Git**
*(No Node.js, Java, or Maven needed locally — Docker handles all builds)*

## Quick Start
```bash
git clone <your-repo-url>
cd loan-management
cp .env.example .env        # Review and update secrets if desired
docker-compose up --build   # First build: ~3–5 minutes
```

| Service | URL | Notes |
| :--- | :--- | :--- |
| Frontend App | [http://localhost:4200](http://localhost:4200) | Angular SPA via Nginx |
| Backend API | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) | Spring Boot REST |
| Database | `localhost:5432` | DB: `loandb` |

## Demo Credentials

| Email | Password | Role | Tenant |
| :--- | :--- | :--- | :--- |
| `admin@alphabank.com` | `password123` | `TENANT_ADMIN` | Alpha Bank |
| `officer@alphabank.com` | `password123` | `LOAN_OFFICER` | Alpha Bank |
| `applicant@alphabank.com` | `password123` | `APPLICANT` | Alpha Bank |
| `admin@betafinance.com` | `password123` | `TENANT_ADMIN` | Beta Finance |

## Common Docker Commands
```bash
# Rebuild after code changes
docker-compose up --build --force-recreate

# Stop all containers
docker-compose down

# Wipe database volume and start fresh
docker-compose down -v && docker-compose up --build

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Access database directly
docker exec -it loanapp-db psql -U loanapp -d loandb
```

## Project Structure Overview
```text
loan-management/
├── docker-compose.yml    ← Orchestrates all 3 services
├── .env                  ← Environment secrets (gitignore in production)
├── README.md             ← You are here
├── frontend/             ← Angular 17 SPA (see frontend/README.md)
└── backend/              ← Spring Boot 3.2 API (see backend/README.md)
```

## Detailed Documentation Links

> [!IMPORTANT]
> For deep-dive documentation on each layer, navigate into the respective folder and read its README:
> *   📁 [frontend/README.md](./frontend/README.md) → Full UI screen guide, component map, Angular architecture
> *   📁 [backend/README.md](./backend/README.md) → API reference, service layer, DB schema, security model

## Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_USER` | `loanapp` | PostgreSQL username |
| `DATABASE_PASSWORD` | `loanpass123` | PostgreSQL password |
| `JWT_SECRET` | `(change this!)` | Min 256-bit secret for JWT signing |

## Multi-Tenancy Model Explanation
Our implementation ensures hard isolation between commercial entities while maintaining high scalability.
*   **Data Isolation:** Every `users`, `loan_applications`, and `form_schemas` row carries a `tenant_id` UUID.
*   **JWT Claims:** The JWT token embeds the `tenantId` as a claim upon successful authentication.
*   **Security Filter:** `JwtAuthenticationFilter` extracts the `tenantId` and sets a `TenantContext` (ThreadLocal) for every incoming request.
*   **Query Enforcement:** All repository layer queries automatically filter by `TenantContext.get()`, preventing cross-tenant data leakage by design.
*   **User Scoping:** A user belonging to Alpha Bank is architecturally barred from reading, writing, or even inferring the existence of data belonging to Beta Finance.
