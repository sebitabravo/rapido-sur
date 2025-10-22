# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This file contains the complete project memory to guide development. Read this entire document before making any code changes.

## 🎯 PROJECT CONTEXT

### Who We Are
Team of four Computer Engineering students developing a real system for the transportation company Rápido Sur.

### The Problem We're Solving
Rápido Sur operates forty-five vehicles (buses and vans) and currently manages maintenance manually with paper and Excel. This causes frequent mechanical failures, high repair costs, and significant vehicle downtime.

### Our Solution
Vehicle maintenance management web system that completely digitalizes the current process. The measurable goal is to reduce failures due to delayed maintenance by forty percent during the first year.

### MVP Goal
Deliver a functional system in fifteen weeks that allows managing vehicles, creating and executing work orders, receiving automatic preventive alerts, and generating cost and availability reports.

## 🏗️ TECHNICAL ARCHITECTURE

### DEFINITIVE Tech Stack
- **Frontend**: React 18 with TypeScript 5
- **Backend**: Node.js 20 LTS with NestJS 10
- **Database**: PostgreSQL 15
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (jsonwebtoken) with bcrypt
- **Emails**: Nodemailer with Gmail SMTP or SendGrid
- **Deployment**: Docker with docker-compose on Hostinger server managed by Dokploy

### Critical Architectural Decisions

**Decision One - Modular Monolith**: We chose modular monolithic architecture instead of microservices because our team is small, the deadline is tight, and the domain is cohesive. NestJS allows us logical separation by modules without distributed services overhead.

**Decision Two - No AWS**: Originally planned AWS but was discarded due to costs. We purchased a VPS on Hostinger and use Dokploy to manage deployments. This gives us total control, predictable costs, and sufficient scalability for ten concurrent users.

**Decision Three - End-to-End TypeScript**: All code is TypeScript, both frontend and backend. This reduces development-time errors and improves maintainability.

**Decision Four - Docker from Development**: Although we work with local development, PostgreSQL always runs in Docker. Complete dockerization is critical because Dokploy deploys using docker-compose.

### Architecture Pattern
Three-tier (N-Tier) architecture with clear separation of responsibilities:

**Presentation Layer (Frontend)**: React with functional components and hooks. Handles only UI logic, client validations, and local state. Never contains business logic.

**Business Logic Layer (Backend)**: NestJS with modular structure. Each module encapsulates a domain (vehicles, work orders, users, etc). Controllers validate input and authorize. Services contain all business logic. Repositories access data.

**Data Layer**: PostgreSQL with TypeORM. Relational model normalized in third normal form. Referential integrity enforced by foreign keys. Audit with automatic timestamps.

## 📁 PROJECT STRUCTURE

```
rapido-sur/
├── docker-compose.yml          # Services orchestration
├── .gitignore                  # Never upload node_modules, .env, dist/
├── README.md                   # Project documentation
├── CLAUDE.md                   # Project memory and guidelines
│
├── backend/
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # JWT authentication module
│   │   │   ├── users/          # User and role management
│   │   │   ├── vehicles/       # Vehicle CRUD
│   │   │   ├── preventive-plans/ # Maintenance plans
│   │   │   ├── work-orders/    # System core - Work Orders
│   │   │   ├── tasks/          # Tasks within WO
│   │   │   ├── parts/          # Parts catalog
│   │   │   ├── part-details/   # Many-to-many relationship
│   │   │   ├── alerts/         # Preventive alerts system
│   │   │   └── reports/        # Report generation
│   │   ├── common/             # Guards, decorators, pipes
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Application entry point
│   ├── test/                   # E2E tests
│   ├── .env                    # Environment variables (DO NOT commit)
│   ├── .env.example            # Variables template (DO commit)
│   ├── Dockerfile              # Docker image for backend
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/         # Reusable components
    │   ├── pages/              # Complete pages per route
    │   ├── services/           # API calls with axios
    │   ├── context/            # AuthContext and other contexts
    │   ├── hooks/              # Custom hooks
    │   ├── types/              # TypeScript interfaces
    │   ├── utils/              # Utility functions
    │   └── App.tsx             # Root component
    ├── public/                 # Static assets
    ├── Dockerfile              # Multi-stage with nginx
    └── package.json
```

**Important Notes:**
- All module/folder names are in English for professional standards
- Entity names in TypeScript remain in Spanish (Usuario, Vehiculo, OrdenTrabajo, etc.) as defined in data model
- API endpoints can be in Spanish (/api/usuarios, /api/vehiculos) for consistency with client requirements
- Comments and documentation in code should be in English
- User-facing messages and error messages are in Spanish

## 🗄️ DATA MODEL

### Main Entities

**Usuario (User)**: Represents anyone who uses the system.
- Critical fields: email (unique), password_hash (bcrypt cost 12), nombre_completo, rol (enum), activo (boolean)
- Allowed roles: Administrador, JefeMantenimiento, Mecanico
- NEVER store plain-text passwords

**Vehiculo (Vehicle)**: Each fleet vehicle.
- Critical fields: patente (unique, VARCHAR 10 to support current and new Chile format), modelo, kilometraje_actual, anno, ultima_revision
- Relationships: has one PlanPreventivo, has many OrdenTrabajo

**PlanPreventivo (Preventive Plan)**: Defines maintenance intervals per vehicle.
- Critical fields: tipo_intervalo (enum: KM or Tiempo), intervalo (int), descripcion, activo
- Important logic: Automatically recalculated when a preventive WO is closed

**OrdenTrabajo (Work Order)**: The system's heart. Represents each maintenance event.
- Critical fields: numero_ot (unique, format OT-2025-00001), tipo (enum: Preventivo or Correctivo), estado (enum: Pendiente, Asignada, EnProgreso, Finalizada), fecha_creacion, fecha_cierre
- Allowed states: Pendiente → Asignada → EnProgreso → Finalizada (unidirectional flow)
- Critical logic: Cannot be closed if it has incomplete tasks

**Tarea (Task)**: Specific work within a WO.
- Critical fields: descripcion, fecha_vencimiento, completada (boolean), mecanico_asignado (FK to Usuario)
- Relationship: belongs to one OrdenTrabajo, uses many Repuestos

**Repuesto (Part)**: Parts and materials catalog.
- Critical fields: nombre, precio_unitario, cantidad_stock
- Validation: stock cannot be negative

**DetalleRepuesto (Part Detail)**: Many-to-many intermediate table between Tarea and Repuesto.
- Critical fields: cantidad_usada, precio_unitario_momento (we store historical price for accurate reports)
- Logic: When registering, deducts from part stock

### Integrity Rules
- Every foreign key must have ON DELETE RESTRICT to prevent accidental deletions
- All enums must be validated in both backend and database
- All entities have automatic created_at and updated_at
- Money fields are DECIMAL(10,2) to avoid rounding issues

## 🔐 SECURITY - INVIOLABLE RULES

### Authentication
- ALWAYS use bcrypt with cost factor 12 for passwords
- NEVER store plain-text passwords under any circumstance
- JWT expires in 24 hours, configured in JWT_EXPIRATION environment variable
- JWT secret must be different in development and production, NEVER hardcoded

### Authorization (RBAC - Role Based Access Control)

**Administrador (Admin)** can:
- Manage users (create, edit, deactivate)
- View all reports
- Export data to CSV
- Access all functionalities

**JefeMantenimiento (Maintenance Manager)** can:
- Create work orders
- Assign mechanics to WO
- View all WO and their status
- Close WO after review
- View preventive alerts
- Generate reports

**Mecanico (Mechanic)** can:
- View ONLY WO assigned to them
- Register tasks in their WO
- Mark tasks as completed
- Register used parts
- View history of vehicle being repaired

**Implementation**: Use NestJS guards (@UseGuards) and custom decorators (@Roles). Validate role on EVERY protected endpoint.

### Data Validation
- ALL user input must be validated with class-validator in DTOs
- Sanitize inputs to prevent SQL injection (parameterized TypeORM helps)
- Validate data types, ranges, formats
- Error messages should never reveal sensitive system information

### Communication
- HTTPS mandatory in production (Dokploy manages Let's Encrypt certificates)
- Security headers (CORS configured, helmet installed)
- Tokens never in URLs, always in Authorization headers

## ⚙️ CORE FUNCTIONAL REQUIREMENTS

**FR-01: Work Order Management**
The system allows creating a WO with unique auto-generated number, automatic opening date, associated vehicle via selector, and preventive or corrective type. The manager can assign the WO to a specific mechanic. The mechanic registers performed tasks, parts with quantities, and hours worked. Closure only proceeds when all mandatory tasks are completed.

**FR-02: Alerts and Notifications**
The system generates automatic alert when a vehicle approaches its next preventive maintenance. The criterion is one thousand kilometers before or one week before according to the plan's interval type. Sends email to maintenance manager with list of alerted vehicles. Recalculates next maintenance date when a preventive WO is closed.

**FR-03: Reports**
The system generates downtime report by calculating difference between fecha_creacion and fecha_cierre of WO. Generates cost report by summing used parts by their prices plus labor. Allows filtering by vehicle and date range. Admin can export any report to CSV.

## 📊 CRITICAL NON-FUNCTIONAL REQUIREMENTS

**NFR-01: Performance**
- Data queries respond in less than three seconds
- Simple report generation in less than ten seconds
- Minimum support of ten concurrent users without degradation
- Index foreign keys and frequently searched fields

**NFR-02: Security**
- Username and password required for access
- Passwords encrypted with bcrypt cost 12
- Restrictive role-based authorization
- HTTPS in production
- Comply with basic OWASP Top 10

**NFR-03: Traceability**
- Track any change to its user and date
- Use created_at and updated_at on all entities
- Consider soft deletes instead of hard deletes for auditing

**NFR-04: Usability**
- Intuitive interface for workshop personnel without technical experience
- Clear error messages in Spanish
- Confirmations before destructive actions
- Responsive design functional on tablets

## 🔄 CRITICAL BUSINESS FLOWS

### Flow: Work Order Creation and Execution

**Step One - Creation by Manager**: Maintenance manager identifies maintenance need, either from preventive alert or failure report. Creates WO in system by selecting vehicle, specifying type (preventive or corrective), adding initial observations. System automatically generates consecutive numero_ot with format OT-YYYY-NNNNN. Initial state is Pendiente.

**Step Two - Assignment**: Manager reviews mechanic availability and assigns WO to a specific one. System changes state to Asignada. Optionally can send notification to mechanic (email or in-app).

**Step Three - Execution**: Mechanic sees assigned WO on their dashboard. Reviews description and vehicle. Changes state to EnProgreso when starting. Registers each performed task (description, time invested). For each task using parts, registers which part and quantity. System automatically deducts from stock and saves precio_unitario_momento to maintain accurate history. Marks tasks as completed as work progresses.

**Step Four - Review and Closure**: When mechanic finishes, notifies manager. Manager reviews that all tasks are completed. System validates no pending tasks remain. If everything correct, manager closes WO. System automatically executes: updates vehicle's ultima_revision with current date, if WO is preventive recalculates next maintenance by adding interval to mileage or current date according to tipo_intervalo, calculates total cost by summing parts and labor, changes state to Finalizada, saves fecha_cierre.

**Critical Validations**: Don't allow closing WO with incomplete tasks. Don't allow registering parts with quantity greater than available stock. Don't allow mechanic to edit WO that doesn't belong to them. Validate that WO's vehicle exists and is active.

### Flow: Preventive Alerts System

**Daily Execution**: A cron job runs every day at six in the morning. Iterates over all active vehicles. For each vehicle obtains its active preventive plan.

**Mileage Alert Calculation**: If tipo_intervalo is KM, calculates kilometros_desde_ultima_revision by subtracting ultima_revision from kilometraje_actual. If kilometros_desde_ultima_revision is greater than or equal to intervalo minus one thousand, generates alert. Example: interval ten thousand km, alert at nine thousand km.

**Time Alert Calculation**: If tipo_intervalo is Tiempo, calculates dias_desde_ultima_revision between ultima_revision and today. If dias_desde_ultima_revision is greater than or equal to intervalo minus seven days, generates alert. Example: interval six months (180 days), alert at 173 days.

**Email Sending**: Groups all generated alerts. Formats email with HTML table containing: patente, modelo, alert reason (X km or X days since last service), quick button to create WO. Sends to maintenance manager's email configured in system. Logs that email was sent with timestamp.

## 💻 CODE CONVENTIONS

### Naming
- **Files**: kebab-case (orden-trabajo.entity.ts)
- **Classes**: PascalCase (OrdenTrabajo)
- **Variables and functions**: camelCase (numeroOt, crearOrdenTrabajo)
- **Constants**: UPPER_SNAKE_CASE (JWT_SECRET)
- **TypeScript Interfaces**: prefix I (IUsuario) or no prefix but clearly descriptive
- **DTOs**: suffix Dto (CreateOrdenTrabajoDto)
- **Entities**: optional Entity suffix (OrdenTrabajoEntity or simply OrdenTrabajo)

### NestJS Module Structure
Each module must have:
- `entities/`: table definitions
- `dto/`: create, update, and custom DTOs
- `[name].controller.ts`: REST endpoints
- `[name].service.ts`: business logic
- `[name].module.ts`: module configuration

### Comments
- Comment the "why", not the "what"
- Complex business logic must have explanatory comments
- Non-obvious algorithms must be documented
- NEVER leave commented code in commits, use Git for history

### Error Handling
- Use NestJS exceptions (NotFoundException, BadRequestException, etc.)
- Error messages in Spanish for end user
- Detailed logs in English for debugging
- Never expose stack traces to client in production

### Testing
- Unit tests for services with complex logic
- E2E tests for critical flows
- Mock external dependencies (database, emails)
- Descriptive test names: "should create WO with consecutive number"

## 🚫 WHAT NOT TO DO

### Never Hardcode
- Passwords or secrets in code
- API URLs
- Environment-specific configurations
- Database credentials
- EVERYTHING must come from environment variables

### Never Skip Validations
- All user input is validated
- All database operations are verified
- All state changes are authorized
- All foreign keys are validated to exist

### Never Do N+1 Queries
- Use eager loading when relationships are needed
- Consider indexes on search columns
- Review queries generated by TypeORM with logging

### Never Mix Responsibilities
- Controllers don't have business logic
- Services don't handle HTTP requests directly
- React components don't make direct API calls (use custom hooks)
- Business logic never in frontend

### Never Commit
- node_modules
- .env with real values
- dist or build
- Personal IDE configuration files
- Logs

## 🐋 DOCKERIZATION

### docker-compose.yml for Development
Three services: postgres, backend (optional in dev), frontend (optional in dev). PostgreSQL must expose port 5432. Persistent volume for data. Shared network for inter-container communication.

### docker-compose.yml for Production
Same stack but:
- Production environment variables (from .env.production)
- Configured healthchecks
- Restart policies set to always
- Logs configured with json-file driver and rotation
- Don't expose unnecessary ports

### Backend Dockerfile
Multi-stage if possible. Build stage: install dependencies, compile TypeScript. Production stage: only compiled files and production dependencies. Non-root user for security. EXPOSE 3000.

### Frontend Dockerfile
Multi-stage mandatory. Build stage: npm install, npm run build. Production stage: nginx alpine, copy build, configure nginx.conf for single page app (all routes to index.html). EXPOSE 80.

## 📦 DEPLOYMENT ON HOSTINGER WITH DOKPLOY

### Server Preparation
- VPS with Ubuntu 20 or 22
- Docker and docker-compose installed
- Dokploy installed following official documentation
- Firewall configured: allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Dokploy Configuration
- Create Rápido Sur project
- Connect GitHub repository
- Configure auto-deploy on push to main branch
- Production environment variables in Dokploy interface
- Enable SSL with Let's Encrypt if domain available

### Production Environment Variables
- DB_HOST must point to postgres service within Docker network
- JWT_SECRET different from development
- SMTP configured with real credentials
- NODE_ENV=production

### Backups
- Daily PostgreSQL backup script
- Store backups off-server (Google Drive, Dropbox)
- Test backup restoration periodically

## 📚 RESOURCES AND DOCUMENTATION

### Official Documentation
- NestJS: https://docs.nestjs.com
- React: https://react.dev
- TypeORM: https://typeorm.io
- PostgreSQL: https://www.postgresql.org/docs
- Dokploy: https://dokploy.com/docs

### Standards We Follow
- IEEE 830-1998 for requirements specification
- ISO/IEC 25010:2011 for software quality
- OWASP Top 10:2021 for security

## 🎓 LEARNING AND CONTINUOUS IMPROVEMENT

As trainee students, we recognize that:
- It's normal to get stuck, but not more than one hour without asking for help
- Errors are learning opportunities, not failures
- Perfect code doesn't exist, functional and maintainable code does
- Documentation is part of development, not an extra
- Tests save time in the long run

When you encounter an error or bug:
1. Reproduce the error consistently
2. Read the complete error message
3. Research in official documentation
4. Search Stack Overflow for similar problems
5. If after one hour no progress, document what was tried and ask for help

## ✅ CHECKLIST BEFORE EACH COMMIT
- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] No forgotten console.logs
- [ ] Sensitive environment variables are not hardcoded
- [ ] Code follows naming conventions
- [ ] Changes are documented if they add new functionality
- [ ] Commit message is descriptive

## ✅ CHECKLIST BEFORE EACH PULL REQUEST
- [ ] Branch is updated with main
- [ ] All tests pass
- [ ] Functionality was manually tested
- [ ] No merge conflicts
- [ ] Code was reviewed by at least one teammate
- [ ] Documentation was updated if necessary

---

**Last updated**: October 2025
**Document version**: 1.0
**Team**: Rubilar, Bravo, Loyola, Aguayo

This document is the project's source of truth. When in doubt, consult here first. If anything in the code contradicts this document, the document is right and the code must be corrected.
