# 🚗 Rápido Sur - Backend API

Sistema de gestión de mantenimiento vehicular para la flota de Rápido Sur (45 vehículos).

**Objetivo:** Reducir en un 40% los fallos por mantenimiento atrasado durante el primer año de operación.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución Local](#ejecución-local)
- [Testing](#testing)
- [Build para Producción](#build-para-producción)
- [Documentación API](#documentación-api)
- [Arquitectura](#arquitectura)
- [Equipo](#equipo)

---

## ✨ Características

### Core Funcional
- ✅ **Gestión de Vehículos**: CRUD completo con validación de patente chilena
- ✅ **Órdenes de Trabajo**: Flujo completo (Crear → Asignar → Ejecutar → Cerrar)
- ✅ **Usuarios y Roles**: RBAC con 3 roles (Administrador, Jefe de Mantenimiento, Mecánico)
- ✅ **Alertas Preventivas**: Sistema automático por kilometraje o tiempo
- ✅ **Reportes**: Costos de mantenimiento y tiempos de inactividad
- ✅ **Notificaciones Email**: Alertas automáticas al jefe de mantenimiento

### Seguridad
- ✅ JWT Authentication con expiración de 24 horas
- ✅ Passwords con bcrypt (cost factor 12)
- ✅ Rate limiting (5 intentos/minuto en login)
- ✅ Helmet security headers
- ✅ CORS configurado
- ✅ Validación completa con class-validator

### Calidad
- ✅ 90 tests unitarios (Jest)
- ✅ Tests E2E para flujos críticos
- ✅ TypeScript strict mode
- ✅ Swagger/OpenAPI documentation

---

## 🛠️ Tecnologías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Runtime** | Node.js | 20 LTS |
| **Framework** | NestJS | 11.x |
| **Language** | TypeScript | 5.7+ |
| **Database** | PostgreSQL | 15 |
| **ORM** | TypeORM | 0.3.27 |
| **Auth** | JWT + bcrypt | Latest |
| **API Docs** | Swagger/OpenAPI | 3.0 |
| **Testing** | Jest | 30.x |

---

## 📦 Requisitos Previos

- **Node.js** 20 LTS o superior
- **npm** 9+
- **PostgreSQL** 15+
- **Docker** (opcional)

---

## 🚀 Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd rapido-sur/backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Crear base de datos
createdb rapido_sur_dev
```

---

## ⚙️ Configuración

Edita `.env` con tus valores:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=rapido_sur_dev

JWT_SECRET=genera_secret_seguro
JWT_EXPIRATION=24h

FRONTEND_URL=http://localhost:5173
```

**Generar JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 💻 Ejecución Local

```bash
# Desarrollo (hot-reload)
npm run start:dev

# La API estará en:
# http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

---

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e
```

**Cobertura Actual:**
- ✅ 90+ tests unitarios
- ✅ Coverage > 80% en servicios críticos

---

## 🏗️ Build para Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar producción
npm run start:prod
```

---

## 📚 Documentación API

### Swagger/OpenAPI

**Desarrollo:** http://localhost:3000/api/docs

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Login
- `POST /auth/register` - Registro (Admin only)
- `GET /auth/profile` - Perfil

#### Usuarios
- `GET /usuarios` - Listar usuarios
- `POST /usuarios` - Crear usuario
- `PATCH /usuarios/:id` - Actualizar
- `DELETE /usuarios/:id` - Desactivar

#### Vehículos
- `GET /vehiculos` - Listar (paginado)
- `POST /vehiculos` - Crear
- `GET /vehiculos/:id/historial` - Historial completo

#### Órdenes de Trabajo
- `POST /ordenes-trabajo` - Crear orden
- `PATCH /ordenes-trabajo/:id/asignar` - Asignar mecánico
- `PATCH /ordenes-trabajo/:id/registrar-trabajo` - Registrar trabajo
- `PATCH /ordenes-trabajo/:id/cerrar` - Cerrar orden

---

## 🏛️ Arquitectura

### Patrón: N-Tier

```
┌─────────────────────────────────┐
│   Controllers (Presentation)    │
├─────────────────────────────────┤
│   Services (Business Logic)     │
├─────────────────────────────────┤
│   TypeORM (Data Access)         │
├─────────────────────────────────┤
│   PostgreSQL (Database)         │
└─────────────────────────────────┘
```

### Módulos

```
src/modules/
├── auth/              # JWT Authentication
├── users/             # User management
├── vehicles/          # Vehicle CRUD
├── work-orders/       # Work orders (core)
├── tasks/             # Tasks
├── parts/             # Parts catalog
├── preventive-plans/  # Maintenance plans
├── alerts/            # Alert system
└── reports/           # Reports generation
```

---

## 🔒 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso total, gestión de usuarios |
| **Jefe de Mantenimiento** | Crear/cerrar OT, ver reportes, alertas |
| **Mecánico** | Ver OT asignadas, registrar trabajo |

---

## 📊 Scripts Disponibles

```bash
npm run start:dev          # Desarrollo con hot-reload
npm run build              # Compilar TypeScript
npm run start:prod         # Producción
npm test                   # Tests unitarios
npm run test:e2e           # Tests E2E
npm run migration:run      # Ejecutar migraciones
npm run lint               # ESLint
npm run format             # Prettier
```

---

## 👥 Equipo

**Proyecto de Ingeniería Civil en Informática**

- Rubilar
- Bravo
- Loyola
- Aguayo

**Cliente:** Rápido Sur
**Año:** 2025

---

## 📝 Documentación Adicional

- [CLAUDE.md](../CLAUDE.md) - Memoria completa del proyecto
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Guía de deployment
- [Swagger](http://localhost:3000/api/docs) - API interactiva

---

**¡Backend listo para reducir el 40% de fallos por mantenimiento atrasado! 🚀**
