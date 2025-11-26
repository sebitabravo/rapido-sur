# Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur

Sistema web completo para la gestión de mantenimiento de la flota vehicular de Rápido Sur. Desarrollado con NestJS (backend) y React + TypeScript (frontend).

## 🎯 Objetivo del Proyecto

Reducir las fallas por mantenimiento atrasado en un 40% durante el primer año mediante la digitalización completa del proceso de mantenimiento vehicular.

## 🏗️ Arquitectura

- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Base de Datos**: PostgreSQL 15
- **Deployment**: Docker con docker-compose en servidor Hostinger gestionado por Dokploy

## 📋 Alcance del MVP

1. Gestión completa de vehículos con historial
2. Ciclo completo de órdenes de trabajo (preventivas/correctivas)
3. Sistema de alertas preventivas con notificaciones por email
4. Autenticación con roles (Admin, Jefe de Mantenimiento, Mecánico)
5. Reportes básicos exportables a CSV

## 📦 Prerequisitos

- Node.js 20 LTS
- Docker y Docker Compose
- npm o yarn
- Git

## 🚀 Instalación y Configuración

### ⚡ Quick Start - Monorepo (Recomendado para Desarrollo)

La forma **más rápida** para desarrollar:

```bash
# 1. Instalar todas las dependencias
npm run install:all

# 2. Configurar variables de entorno
cp .env.example .env
cd backend && cp .env.example .env && cd ..
cd frontend && cp .env.example .env.local && cd ..

# 3. Levantar TODO (DB + Backend + Frontend)
npm run dev
```

**Servicios iniciados**:
- ✅ PostgreSQL en Docker (puerto 5432)
- ✅ Backend con hot-reload (puerto 3000)
- ✅ Frontend con hot-reload (puerto 3000 por defecto, configurable vía FRONTEND_PORT)

**Acceso**:
- Frontend: http://localhost:3000 (o el puerto configurado en FRONTEND_PORT)
- Backend API: http://localhost:3000/api (o el puerto configurado en BACKEND_PORT)

**Ventajas**:
- ⚡ Muy rápido - inicia en segundos
- 🔥 Hot-reload automático en backend y frontend
- 💻 Consume menos recursos que Docker completo
- 🐛 Fácil para debugging

📖 **Guía completa de monorepo**: [MONOREPO.md](./MONOREPO.md)

---

### 🐋 Opción Docker (Para Demos/Testing)

Si prefieres todo en contenedores:

```bash
# Levantar stack completo
docker-compose up -d
# O usar el script helper
./docker.sh start
```

**Servicios incluidos**:
- ✅ PostgreSQL (puerto 5432)
- ✅ Backend (puerto configurable vía BACKEND_PORT, default 3000)
- ✅ Frontend (puerto configurable vía FRONTEND_PORT, default 3000)

📖 **Guía completa de Docker**: [DOCKER.md](./DOCKER.md)

#### 1. Levantar solo PostgreSQL con Docker:
```bash
docker-compose up -d postgres
```

#### 2. Configurar y correr Backend:

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en modo desarrollo con hot-reload
npm run start:dev
```

Backend disponible en: http://localhost:3000

#### 3. Configurar y correr Frontend:

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local (normalmente no necesita cambios)

# Iniciar en modo desarrollo con hot-reload
npm run dev
```

Frontend disponible en: http://localhost:3000 (o el puerto configurado)

---

### 📋 Scripts de Monorepo

El proyecto incluye scripts para facilitar el desarrollo:

| Script | Descripción |
|--------|-------------|
| `npm run dev` | ⚡ **Levanta TODO** (DB + Backend + Frontend) |
| `npm run dev:backend` | Solo Backend + DB |
| `npm run dev:frontend` | Solo Frontend |
| `npm run build` | Build completo (backend + frontend) |
| `npm run docker:up` | Stack completo en Docker |
| `npm run db:start` | Solo PostgreSQL |
| `npm run clean` | Limpiar node_modules y builds |

Ver todos los scripts en [MONOREPO.md](./MONOREPO.md)

---

### 3. Configurar Variables de Entorno

#### Backend (.env)

El backend estará disponible en http://localhost:3000

#### Si usas docker-compose.full.yml:

El backend ya está corriendo en Docker. Ver logs:

```bash
docker-compose -f docker-compose.full.yml logs -f backend
```

### 4. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en http://localhost:5173

## 📁 Estructura del Proyecto

```
rapido-sur/
├── docker-compose.yml               # Para PRODUCCIÓN (Dokploy)
├── docker-compose.dev.yml           # Para desarrollo local (solo BD)
├── docker-compose.full.yml          # Stack completo dockerizado
├── DOCKER_GUIDE.md                  # Guía completa de Docker
├── .gitignore                       # Archivos ignorados por Git
├── README.md                        # Documentación general
├── CLAUDE.md                        # Memoria del proyecto
│
├── backend/                         # API NestJS
│   ├── src/
│   │   ├── modules/                 # Módulos funcionales
│   │   │   ├── auth/                # Autenticación JWT
│   │   │   ├── users/               # Gestión de usuarios y roles
│   │   │   ├── vehicles/            # CRUD de vehículos
│   │   │   ├── preventive-plans/    # Planes de mantenimiento
│   │   │   ├── work-orders/         # Órdenes de trabajo (CORE)
│   │   │   ├── tasks/               # Tareas dentro de OT
│   │   │   ├── parts/               # Catálogo de repuestos
│   │   │   ├── part-details/        # Relación many-to-many tareas-repuestos
│   │   │   ├── alerts/              # Sistema de alertas preventivas
│   │   │   └── reports/             # Generación de reportes
│   │   ├── common/                  # Guards, decorators, pipes
│   │   ├── app.module.ts            # Módulo raíz
│   │   └── main.ts                  # Punto de entrada de la aplicación
│   ├── test/                        # Tests E2E
│   ├── .env                         # Variables de entorno (NO subir a Git)
│   ├── .env.example                 # Template de variables (SÍ subir)
│   ├── Dockerfile                   # Imagen Docker para backend
│   └── package.json                 # Dependencias del backend
│
└── frontend/                        # Aplicación React
    ├── src/
    │   ├── components/              # Componentes reutilizables
    │   ├── pages/                   # Páginas completas por ruta
    │   ├── services/                # Llamadas a API con axios
    │   ├── context/                 # AuthContext y otros contextos
    │   ├── hooks/                   # Custom hooks
    │   ├── types/                   # Interfaces TypeScript
    │   ├── utils/                   # Funciones auxiliares
    │   └── App.tsx                  # Componente raíz
    ├── public/                      # Assets estáticos
    ├── .env                         # Variables de entorno (NO subir)
    ├── .env.example                 # Template de variables (SÍ subir)
    ├── Dockerfile                   # Multi-stage build con nginx
    └── package.json                 # Dependencias del frontend
```

## 👥 Roles y Permisos

- **Administrador**: Gestión completa del sistema
- **Jefe de Mantenimiento**: Crea y supervisa órdenes de trabajo
- **Mecánico**: Ve y trabaja en órdenes asignadas

## 🔑 Credenciales de Prueba

Para probar el sistema con datos de ejemplo:

- **Admin**: `admin@rapidosur.cl` / `Admin123!`
- **Jefe de Mantenimiento**: `carlos.rodriguez@rapidosur.cl` / `Manager123!`
- **Mecánico**: `juan.perez@rapidosur.cl` / `Mechanic123!`

> **Nota**: Estas credenciales se generan automáticamente con el seeding inicial de la base de datos. Para uso en producción, cambiar estas credenciales inmediatamente.

## 🧪 Testing

### Backend

```bash
cd backend
npm run test              # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Cobertura de tests
```

### Frontend

```bash
cd frontend
npm run test              # Tests con Vitest
```

## 🏗️ Build para Producción

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
# Los archivos estarán en dist/
```

---

## 🚀 Deployment en Producción con Dokploy

### Preparación para Deployment

#### 1. Generar Secrets Seguros

Antes de hacer deploy, genera tus secrets de producción:

```bash
cd backend
npm run secrets:generate
```

Este comando generará:
- ✅ JWT_SECRET (128 caracteres)
- ✅ DB_PASSWORD (32 caracteres)
- ✅ SESSION_SECRET
- ✅ API_KEY

**Copia y guarda estos valores en un lugar seguro.**

#### 2. Configurar Variables de Entorno en Dokploy

Dokploy automáticamente usa las variables de entorno que configures. Usa el archivo `.env.production.example` como guía.

**Variables CRÍTICAS que DEBES cambiar:**

```bash
# Seguridad
NODE_ENV=production
JWT_SECRET=<el_que_generaste_con_el_script>

# Base de Datos
DB_PASSWORD=<password_seguro>

# URLs
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api

# Email (Gmail App Password)
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=<tu_app_password_de_gmail>
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
```

#### 3. Checklist Pre-Deploy

Verifica que has configurado todas estas variables:

```bash
✅ NODE_ENV=production
✅ JWT_SECRET (mínimo 64 caracteres, generado con script)
✅ DB_PASSWORD (cambiado del valor por defecto)
✅ FRONTEND_URL (tu dominio de producción)
✅ NEXT_PUBLIC_API_URL (URL del backend + /api)
✅ MAIL_USER y MAIL_PASSWORD (Gmail App Password)
✅ MAINTENANCE_MANAGER_EMAIL
```

### Proceso de Deployment en Dokploy

#### Paso 1: Conectar Repositorio

1. Ingresa a tu panel de Dokploy
2. Crea un nuevo proyecto: **"Rápido Sur"**
3. Conecta tu repositorio de GitHub
4. Selecciona la rama: **main**

#### Paso 2: Configurar Environment Variables

En Dokploy, ve a **Environment Variables** y pega todas las variables del `.env.production.example` con tus valores reales.

**Ejemplo de configuración:**

```
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=TuPasswordSeguro123!@#
DB_DATABASE=rapido_sur
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
JWT_EXPIRATION=24h
FRONTEND_URL=https://rapidosur.com
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=sistema@rapidosur.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_FROM=noreply@rapidosur.cl
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
ENABLE_CRON=true
ALERTS_CRON_SCHEDULE=0 6 * * *
ENABLE_SEEDING=false
LOG_LEVEL=log
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
NEXT_PUBLIC_API_URL=https://api.rapidosur.com/api
```

#### Paso 3: Configurar Docker Compose

Dokploy detectará automáticamente tu `docker-compose.yml`. Asegúrate de que esté configurado correctamente (ya lo está ✅).

El archivo `docker-compose.yml` incluye:
- ✅ PostgreSQL con persistencia de datos
- ✅ Backend con healthchecks
- ✅ Frontend con Nginx
- ✅ Networks aisladas
- ✅ Resource limits
- ✅ Log rotation

#### Paso 4: Deploy Automático

1. En Dokploy, haz clic en **Deploy**
2. Dokploy hará automáticamente:
   - ✅ Pull del código desde GitHub
   - ✅ Build de las imágenes Docker
   - ✅ Levanta los servicios (postgres → backend → frontend)
   - ✅ Aplica healthchecks
   - ✅ Configura SSL con Let's Encrypt (si tienes dominio)

#### Paso 5: Verificar Deployment

Una vez completado el deploy, verifica que todo funcione:

```bash
# 1. Verificar health del backend
curl https://api.tu-dominio.com/health
# Debería retornar: {"status":"OK","database":"connected",...}

# 2. Verificar status detallado
curl https://api.tu-dominio.com/api/status

# 3. Acceder a Swagger Docs
# Abre: https://api.tu-dominio.com/api/docs

# 4. Acceder al frontend
# Abre: https://tu-dominio.com
```

### Validaciones Automáticas en Producción

El sistema incluye validaciones automáticas que evitarán que arranque si algo está mal configurado:

#### ✅ Validación de JWT_SECRET

Si el JWT_SECRET es inseguro, verás este error en los logs:

```
[Environment] ❌ JWT_SECRET is insecure in production environment
[Environment] Requirements:
[Environment]   - Must NOT contain 'dev_' or 'secret_key'
[Environment]   - Must be at least 64 characters long
[Bootstrap] Failed to validate environment variables
```

**Solución:** Genera un nuevo secret con `npm run secrets:generate`

#### ✅ Validación de Variables Requeridas

Si falta alguna variable, el servidor no arrancará:

```
[Environment] ❌ Missing required environment variables: JWT_SECRET, DB_PASSWORD
```

**Solución:** Configura todas las variables en Dokploy

### Logs y Monitoring

#### Ver Logs en Dokploy

Dokploy te permite ver logs en tiempo real:

1. Ve a tu proyecto en Dokploy
2. Selecciona el servicio (backend/frontend/postgres)
3. Haz clic en **Logs**

#### Logs del Backend

Los logs rotarán automáticamente (configurado en docker-compose.yml):
- Tamaño máximo por archivo: 10MB
- Archivos mantenidos: 5
- Compresión automática

### Troubleshooting

#### Problema: Backend no arranca

**Verificar:**
```bash
# Ver logs del backend en Dokploy
# Busca errores de validación de environment variables
```

**Soluciones comunes:**
- JWT_SECRET no configurado o muy corto
- DB_PASSWORD incorrecto
- Variables requeridas faltantes

#### Problema: Frontend no puede conectar al backend

**Verificar:**
```bash
# NEXT_PUBLIC_API_URL debe apuntar al backend
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
#                                              ^^^^ debe incluir /api
```

#### Problema: Base de datos no conecta

**Verificar:**
```bash
# En Dokploy, verifica que postgres esté corriendo
# Verifica DB_PASSWORD en las variables de entorno
```

### Re-deployment

Para actualizar el sistema después de hacer cambios:

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin main
   ```

2. **Dokploy hace auto-deploy:**
   - Si configuraste auto-deploy, Dokploy detectará el push
   - Hará re-build y re-deploy automáticamente

3. **O deploy manual en Dokploy:**
   - Ve a tu proyecto
   - Haz clic en **Re-deploy**

### Backups de Base de Datos

**IMPORTANTE:** Configura backups regulares de PostgreSQL.

```bash
# Backup manual (ejecutar en el servidor)
docker exec rapido-sur-db pg_dump -U postgres rapido_sur > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i rapido-sur-db psql -U postgres rapido_sur < backup_20250110.sql
```

**Recomendación:** Configura backups automáticos diarios y guárdalos fuera del servidor.

### Monitoreo Post-Deploy

#### Health Checks

Los servicios incluyen healthchecks automáticos:
- ✅ Backend verifica DB cada 30 segundos
- ✅ Frontend verifica servidor cada 30 segundos
- ✅ Postgres verifica conexión cada 10 segundos

Si un servicio falla, Docker intentará reiniciarlo automáticamente (restart: always).

#### Endpoints de Monitoreo

```bash
# Health check simple
GET /health
→ {"status":"OK","database":"connected"}

# Status detallado
GET /api/status
→ Información completa del sistema

# API Docs (para verificar endpoints)
GET /api/docs
→ Swagger UI
```

---

## 📜 Scripts Útiles

### Backend

- `npm run start:dev` - Inicia en modo desarrollo con hot-reload
- `npm run start:debug` - Inicia en modo debug
- `npm run build` - Compila el proyecto
- `npm run format` - Formatea el código con Prettier
- `npm run lint` - Ejecuta ESLint

### Frontend

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa del build de producción
- `npm run lint` - Ejecuta ESLint

## 🗄️ Base de Datos

La base de datos PostgreSQL incluye:

- Gestión de vehículos y su historial
- Órdenes de trabajo (preventivas y correctivas)
- Usuarios y roles
- Registro de tareas y repuestos
- Logs de auditoría

## ✅ Estado Actual

✓ Estructura del proyecto configurada
✓ Backend con NestJS inicializado
✓ Frontend con React + Vite inicializado
✓ Base de datos PostgreSQL en Docker
✓ Configuración de TypeORM
✓ Validación global configurada
✓ CORS habilitado

## 📝 Próximos Pasos

1. Implementar entidades del sistema (Vehicle, WorkOrder, User, etc.)
2. Crear módulos de autenticación y autorización
3. Desarrollar endpoints REST para cada módulo
4. Implementar interfaz de usuario en React
5. Configurar sistema de alertas por email
6. Implementar generación de reportes
7. Testing exhaustivo
8. Deployment en Hostinger con Dokploy

## 👨‍💻 Equipo

Proyecto universitario para Rápido Sur

## 📄 Licencia

MIT

## 💬 Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.
