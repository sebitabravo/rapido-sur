# 📘 Backend Documentation - Rápido Sur

Documentación completa del backend NestJS del sistema de gestión de mantenimiento vehicular.

---

## 🗂️ Índice de Documentación

### 📡 API
Documentación de endpoints y servicios REST.

- **[API Reference](./api/API_REFERENCE.md)** - Referencia completa de todos los endpoints
- **[Authentication](./api/AUTHENTICATION.md)** - Sistema de autenticación JWT y guards
- **[Error Handling](./api/ERROR_HANDLING.md)** - Manejo de errores y códigos HTTP

### 🏗️ Architecture
Estructura y diseño del backend.

- **[Module Structure](./architecture/MODULE_STRUCTURE.md)** - Organización de módulos NestJS
- **[Database Schema](./architecture/DATABASE_SCHEMA.md)** - Esquema de PostgreSQL y relaciones
- **[Business Logic](./architecture/BUSINESS_LOGIC.md)** - Reglas de negocio críticas

### 🚀 Deployment
Guías de despliegue y configuración.

- **[Deployment Dokploy](./deployment/DEPLOYMENT_DOKPLOY.md)** - Deploy con Dokploy en producción
- **[Quick Start](./deployment/DEPLOYMENT_QUICK_START.md)** - Inicio rápido de deployment
- **[Changelog](./deployment/CHANGELOG_DEPLOYMENT.md)** - Historial de deployments

### 🧪 Testing
Pruebas y calidad de código.

- **[Testing Guide](./testing/TESTS.md)** - Guía completa de testing
- **[Test Coverage](./testing/TEST_COVERAGE.md)** - Cobertura de tests

### ✅ Compliance
Cumplimiento y validación.

- **[Compliance Report](./compliance/COMPLIANCE_REPORT.md)** - Reporte de cumplimiento
- **[Validation Guide](./compliance/VALIDATION_GUIDE.md)** - Guía de validación de datos

---

## 🚀 Quick Start

### Instalación
```bash
cd backend
npm install
```

### Configuración
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### Ejecutar en Desarrollo
```bash
npm run start:dev
```

### Ejecutar Tests
```bash
npm run test
npm run test:e2e
```

---

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 10
- **Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL 15
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI

---

## 📦 Módulos Principales

| Módulo | Descripción | Endpoint Base |
|--------|-------------|---------------|
| **auth** | Autenticación y autorización | `/api/auth` |
| **users** | Gestión de usuarios y roles | `/api/usuarios` |
| **vehicles** | CRUD de vehículos | `/api/vehiculos` |
| **preventive-plans** | Planes preventivos | `/api/planes-preventivos` |
| **work-orders** | Órdenes de trabajo (core) | `/api/ordenes-trabajo` |
| **tasks** | Tareas de OT | `/api/tareas` |
| **parts** | Catálogo de repuestos | `/api/repuestos` |
| **alerts** | Sistema de alertas | `/api/alertas` |
| **reports** | Generación de reportes | `/api/reportes` |

---

## 🔗 Enlaces Relacionados

- [Documentación General del Proyecto](../../README.md)
- [CLAUDE.md - Memoria del Proyecto](../../CLAUDE.md)
- [Frontend Documentation](../../frontend/docs/README.md)
- [Docker Guide](../../DOCKER_GUIDE.md)

---

**Última actualización**: Noviembre 2025
**Equipo**: Rápido Sur Development Team
