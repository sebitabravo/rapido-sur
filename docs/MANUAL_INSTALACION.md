# MANUAL DE INSTALACIÓN
## Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur

---

**Versión del Sistema**: 1.0
**Fecha**: Diciembre 2025
**Audiencia**: Técnicos, administradores de sistemas, DevOps

---

## Tabla de Contenidos

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Instalación en Desarrollo](#2-instalación-en-desarrollo)
3. [Instalación en Producción](#3-instalación-en-producción)
4. [Configuración de Variables de Entorno](#4-configuración-de-variables-de-entorno)
5. [Inicialización de Base de Datos](#5-inicialización-de-base-de-datos)
6. [Verificación de Instalación](#6-verificación-de-instalación)
7. [Configuración de Emails](#7-configuración-de-emails)
8. [Configuración de SSL/HTTPS](#8-configuración-de-sslhttps)
9. [Troubleshooting](#9-troubleshooting)
10. [Actualización del Sistema](#10-actualización-del-sistema)
11. [Backups y Restore](#11-backups-y-restore)

---

## 1. Requisitos del Sistema

### 1.1 Requisitos de Software

#### Para Desarrollo Local

**Obligatorios**:
- **Node.js**: v20 LTS (recomendado 20.10.0 o superior)
- **npm**: v10.x (incluido con Node.js)
- **Docker**: v24.x o superior
- **Docker Compose**: v2.x o superior
- **Git**: v2.x o superior

**Opcionales** (recomendados):
- **PostgreSQL Client**: `psql` para debugging
- **Postman** o **Insomnia**: Para probar APIs
- **Visual Studio Code**: Editor recomendado con extensiones:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

**Verificar instalación**:

```bash
node --version       # v20.10.0 o superior
npm --version        # v10.x
docker --version     # v24.x o superior
docker compose version  # v2.x o superior
git --version        # v2.x
```

#### Para Producción (Servidor VPS)

**Obligatorios**:
- **Sistema Operativo**: Ubuntu 20.04 LTS o Ubuntu 22.04 LTS
- **Docker Engine**: v24.x o superior
- **Docker Compose**: v2.x o superior
- **Git**: v2.x
- **Dokploy**: Última versión estable (opcional pero recomendado)

**Recursos mínimos del servidor**:
- **CPU**: 2 cores (recomendado 4 cores)
- **RAM**: 4 GB (recomendado 8 GB)
- **Disco**: 40 GB SSD (mínimo 20 GB libres)
- **Ancho de banda**: Ilimitado o al menos 1 TB/mes
- **Sistema operativo**: Linux 64-bit (Ubuntu recomendado)

### 1.2 Puertos Requeridos

**Desarrollo**:
- `5432`: PostgreSQL
- `3000`: Backend (NestJS)
- `5173`: Frontend (Vite dev server)

**Producción**:
- `80`: HTTP (redirige a HTTPS)
- `443`: HTTPS (frontend + backend)
- `22`: SSH (administración)
- `5432`: PostgreSQL (solo interno, NO expuesto)

### 1.3 Requisitos de Red

- **Conexión a internet** estable (para npm install, Docker pulls, etc.)
- **Firewall** configurado:
  - Desarrollo: Puertos locales abiertos
  - Producción: Solo 22 (SSH), 80 (HTTP), 443 (HTTPS) abiertos al público

---

## 2. Instalación en Desarrollo

### 2.1 Clonar el Repositorio

```bash
# Crear directorio de proyectos
mkdir -p ~/proyectos
cd ~/proyectos

# Clonar repositorio
git clone https://github.com/tu-organizacion/rapido-sur.git
cd rapido-sur

# Verificar estructura
ls -la
# Deberías ver: backend/, frontend/, docker-compose.yml, README.md, etc.
```

### 2.2 Instalación de Dependencias

#### Opción A: Instalar todo de una vez (Recomendado)

```bash
# Desde la raíz del proyecto
npm run install:all
```

Este comando ejecuta:
1. `npm install` en la raíz
2. `npm install` en `backend/`
3. `npm install` en `frontend/`

#### Opción B: Instalar manualmente

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

**Tiempo estimado**: 3-5 minutos (depende de tu conexión a internet)

### 2.3 Configurar Variables de Entorno

#### Backend

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```bash
# Entorno
NODE_ENV=development

# Puerto del servidor
PORT=3000

# Base de Datos (PostgreSQL en Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=rapido_sur_db

# JWT
JWT_SECRET=dev_jwt_secret_change_in_production_min_64_chars_12345678901234567890
JWT_EXPIRATION=24h

# URLs
FRONTEND_URL=http://localhost:5173

# Email (opcional en desarrollo, puedes usar valores dummy)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
```

#### Frontend

```bash
cd ../frontend
cp .env.example .env.local
```

Edita el archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Importante**: El frontend usa variables con prefijo `NEXT_PUBLIC_` para exponerlas al navegador.

### 2.4 Levantar Base de Datos (Docker)

#### Opción A: Usar docker-compose.dev.yml (Solo PostgreSQL)

```bash
# Desde la raíz del proyecto
docker compose -f docker-compose.dev.yml up -d

# Verificar que PostgreSQL está corriendo
docker ps
# Deberías ver un contenedor "rapido-sur-postgres-dev"

# Ver logs de PostgreSQL
docker logs rapido-sur-postgres-dev
```

#### Opción B: Usar PostgreSQL local

Si prefieres instalar PostgreSQL localmente (no recomendado):

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE rapido_sur_db;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE rapido_sur_db TO postgres;
\q

# Actualiza .env del backend con:
DB_HOST=localhost
DB_PORT=5432
```

### 2.5 Ejecutar Migraciones

```bash
cd backend

# Generar migraciones (si hay cambios en entities)
npm run migration:generate -- -n InitialSchema

# Ejecutar migraciones
npm run migration:run

# Verificar migraciones aplicadas
npm run migration:show
```

**Resultado esperado**: Todas las tablas creadas en la BD.

### 2.6 Seed de Datos Iniciales

```bash
# Desde backend/
npm run seed

# Este comando crea:
# - Usuario administrador inicial
# - Algunos vehículos de ejemplo
# - Repuestos de ejemplo
# - Datos de prueba
```

**Importante**: Anota las credenciales del usuario admin que se muestran en consola.

### 2.7 Iniciar Servidores de Desarrollo

#### Opción A: Iniciar todo desde la raíz (Recomendado)

```bash
# Desde la raíz del proyecto
npm run dev
```

Este comando inicia:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5173`

#### Opción B: Iniciar servicios por separado

**Terminal 1 - Backend**:
```bash
cd backend
npm run start:dev

# Deberías ver:
# [Bootstrap] ✅ All required environment variables are set
# [Bootstrap] 🚀 Application is running on: http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev

# Deberías ver:
#   VITE v5.x.x  ready in X ms
#
#   ➜  Local:   http://localhost:5173/
```

### 2.8 Verificar Instalación

Abre tu navegador y visita:

1. **Frontend**: http://localhost:5173
   - Deberías ver la página de login
2. **Backend API Docs**: http://localhost:3000/api/docs
   - Deberías ver Swagger UI con todos los endpoints
3. **Health Check**: http://localhost:3000/health
   - Respuesta: `{"status":"OK","database":"connected"}`

**Credenciales de prueba** (del seed):
- Email: `admin@rapidosur.cl`
- Contraseña: (ver en logs del seed)

---

## 3. Instalación en Producción

### 3.1 Preparación del Servidor VPS

#### Conectar al servidor

```bash
ssh usuario@tu-servidor-ip

# Ejemplo:
ssh root@192.168.1.100
```

#### Actualizar sistema

```bash
sudo apt update
sudo apt upgrade -y
```

#### Instalar Docker

```bash
# Instalar Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar instalación
docker --version

# Habilitar Docker al inicio
sudo systemctl enable docker
sudo systemctl start docker

# Agregar tu usuario al grupo docker (opcional, evita usar sudo)
sudo usermod -aG docker $USER
# Cierra sesión y vuelve a entrar para aplicar cambios
```

#### Instalar Docker Compose

```bash
# Docker Compose v2 viene incluido con Docker Desktop
# Para Linux:
sudo apt install docker-compose-plugin

# Verificar
docker compose version
```

#### Configurar Firewall

```bash
# Habilitar UFW (Uncomplicated Firewall)
sudo ufw enable

# Permitir SSH (CRÍTICO: Hazlo antes de habilitar el firewall)
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver reglas activas
sudo ufw status
```

### 3.2 Instalar Dokploy (Recomendado)

Dokploy simplifica el deployment con Docker.

```bash
# Instalar Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# Acceder a Dokploy
# Abre en tu navegador: http://tu-ip:3000
```

**Configuración inicial de Dokploy**:
1. Crea una cuenta de admin
2. Conecta tu repositorio de GitHub
3. Configura el dominio (opcional)

### 3.3 Deployment con Dokploy

#### Paso 1: Generar Secrets

**En tu máquina local** (no en el servidor):

```bash
cd backend
npm run secrets:generate
```

Guarda los valores generados:
- `JWT_SECRET` (128 caracteres)
- `DB_PASSWORD` (segura)

#### Paso 2: Configurar Variables de Entorno en Dokploy

1. Panel de Dokploy → **Crear Proyecto** → "Rápido Sur"
2. **Conectar Repositorio** → Selecciona tu repo de GitHub
3. **Environment Variables** → Pega las siguientes variables:

```bash
# Entorno
NODE_ENV=production

# Puertos
PORT=3000

# Base de Datos (dentro de Docker network)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<pega_tu_db_password_aqui>  # Del script secrets:generate
DB_DATABASE=rapido_sur_prod

# JWT
JWT_SECRET=<pega_tu_jwt_secret_aqui>  # Del script secrets:generate (min 64 chars)
JWT_EXPIRATION=24h

# URLs (reemplaza con tu dominio)
FRONTEND_URL=https://rapidosur.ejemplo.com
NEXT_PUBLIC_API_URL=https://api.rapidosur.ejemplo.com/api

# Email (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=<app_password_de_gmail>
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
```

**Importante**: Reemplaza `<...>` con valores reales.

#### Paso 3: Deploy

1. En Dokploy, haz clic en **Deploy**
2. Espera 3-5 minutos mientras:
   - Clona el repositorio
   - Hace build del backend y frontend
   - Levanta todos los servicios
3. Verifica en **Logs** que no haya errores

#### Paso 4: Configurar SSL (Let's Encrypt)

1. En Dokploy → **Dominios**
2. Agrega tu dominio: `rapidosur.ejemplo.com`
3. Habilita **SSL automático** (Let's Encrypt)
4. Dokploy configurará HTTPS automáticamente

### 3.4 Deployment Manual (Sin Dokploy)

Si no usas Dokploy, puedes hacer deployment manual con Docker Compose.

#### Clonar repositorio en el servidor

```bash
# En el servidor VPS
cd /opt
sudo mkdir rapido-sur
sudo chown $USER:$USER rapido-sur
cd rapido-sur

git clone https://github.com/tu-organizacion/rapido-sur.git .
```

#### Configurar variables de entorno

```bash
# Backend
cd backend
cp .env.production.example .env
nano .env  # Edita con valores de producción

# Frontend
cd ../frontend
cp .env.production.example .env.local
nano .env.local  # Edita con valores de producción
```

#### Build de imágenes

```bash
# Desde la raíz del proyecto
docker compose build

# Esto puede tardar 5-10 minutos
```

#### Levantar servicios

```bash
docker compose up -d

# Verificar que todos los servicios estén corriendo
docker ps

# Deberías ver:
# - rapido-sur-postgres
# - rapido-sur-backend
# - rapido-sur-frontend
```

#### Ver logs

```bash
# Logs del backend
docker logs -f rapido-sur-backend

# Logs del frontend
docker logs -f rapido-sur-frontend

# Logs de PostgreSQL
docker logs -f rapido-sur-postgres
```

---

## 4. Configuración de Variables de Entorno

### 4.1 Variables del Backend

**Archivo**: `backend/.env`

| Variable | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-------------|--------------------|--------------------|
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |
| `PORT` | Puerto del servidor | `3000` | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` | `postgres` (nombre del servicio Docker) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` | `5432` |
| `DB_USERNAME` | Usuario de BD | `postgres` | `postgres` |
| `DB_PASSWORD` | Contraseña de BD | `postgres123` | `<segura generada>` |
| `DB_DATABASE` | Nombre de la BD | `rapido_sur_db` | `rapido_sur_prod` |
| `JWT_SECRET` | Clave secreta para JWT | `dev_jwt_secret_...` (min 64 chars) | `<128 chars generados>` |
| `JWT_EXPIRATION` | Duración del token | `24h` | `24h` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:5173` | `https://rapidosur.com` |
| `MAIL_HOST` | Servidor SMTP | `smtp.gmail.com` | `smtp.gmail.com` |
| `MAIL_PORT` | Puerto SMTP | `587` | `587` |
| `MAIL_SECURE` | TLS para email | `false` | `false` |
| `MAIL_USER` | Usuario de email | `tu-email@gmail.com` | `alertas@rapidosur.cl` |
| `MAIL_PASSWORD` | Contraseña de app Gmail | `<app password>` | `<app password>` |
| `MAINTENANCE_MANAGER_EMAIL` | Email del jefe de mantenimiento | `jefe@rapidosur.cl` | `jefe@rapidosur.cl` |

### 4.2 Variables del Frontend

**Archivo**: `frontend/.env.local` (desarrollo) o `frontend/.env` (producción)

| Variable | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-------------|--------------------|--------------------|
| `NEXT_PUBLIC_API_URL` | URL de la API backend | `http://localhost:3000/api` | `https://api.rapidosur.com/api` |

**Importante**:
- En Next.js, solo las variables con prefijo `NEXT_PUBLIC_` son accesibles desde el navegador
- NO incluyas secretos en variables `NEXT_PUBLIC_` (son públicas)

### 4.3 Validaciones Automáticas

El sistema valida automáticamente las variables en el inicio:

**Backend (`main.ts`)**:
- ✅ Verifica que todas las variables requeridas estén presentes
- ✅ En producción, valida que `JWT_SECRET` tenga mínimo 64 caracteres
- ✅ Rechaza secrets inseguros (`dev_`, `secret_key`, etc.)
- ❌ Si falta alguna variable o es insegura, la aplicación NO arranca

**Mensaje de error típico**:
```
[ERROR] Missing required environment variables: JWT_SECRET, DB_PASSWORD
[ERROR] Application failed to start
```

### 4.4 Generar Secrets Seguros

Usa el script incluido:

```bash
cd backend
npm run secrets:generate
```

**Output**:
```
🔐 PRODUCTION SECRETS GENERATED

JWT_SECRET (128 chars):
a9f3k2m4n6p8q1r3s5t7u9v0w2x4y6z8a1b3c5d7e9f1g3h5i7j9k1l3m5n7o9p1q3r5s7t9u1v3w5x7y9z1a3b5c7d9e1f3g5h7i9j1k3l5m7n9o1p3q5r7s9t1u3v5w7x9y1z3a5b7c9d1e3f5g7h9

DB_PASSWORD (32 chars):
x7K9mN2pQ5tY8wZ1aD4gJ6lO0rU3vX5b

💾 Save these in a secure password manager!
⚠️  NEVER commit these to Git
```

**Copia estos valores** a tu gestor de contraseñas y luego a las variables de entorno.

---

## 5. Inicialización de Base de Datos

### 5.1 Migraciones de TypeORM

Las migraciones crean y actualizan la estructura de la base de datos.

#### Ejecutar migraciones existentes

```bash
cd backend

# Ejecutar migraciones
npm run migration:run

# Verificar migraciones aplicadas
npm run migration:show
```

**Output esperado**:
```
✅ InitialSchema - Applied
✅ AddVehiclesTable - Applied
✅ AddWorkOrdersTable - Applied
...
```

#### Revertir última migración (si hay error)

```bash
npm run migration:revert
```

#### Generar nueva migración (desarrolladores)

Cuando cambies entities:

```bash
npm run migration:generate -- -n DescripcionDelCambio

# Ejemplo:
npm run migration:generate -- -n AddPhoneToUsuarios
```

### 5.2 Seed de Datos Iniciales

El seed puebla la base de datos con datos de ejemplo.

```bash
cd backend
npm run seed
```

**El seed crea**:
1. **Usuario Administrador**:
   - Email: `admin@rapidosur.cl`
   - Contraseña: Generada aleatoriamente (se muestra en consola)
   - Rol: Administrador

2. **Usuario Jefe de Mantenimiento**:
   - Email: `jefe@rapidosur.cl`
   - Contraseña: Generada aleatoriamente
   - Rol: JefeMantenimiento

3. **Usuario Mecánico**:
   - Email: `mecanico@rapidosur.cl`
   - Contraseña: Generada aleatoriamente
   - Rol: Mecanico

4. **Vehículos de ejemplo**: 5-10 vehículos con diferentes características
5. **Repuestos de ejemplo**: Catálogo básico de repuestos comunes
6. **Planes preventivos**: Configuración de mantenimiento para cada vehículo

**IMPORTANTE - Producción**:
```bash
# En producción, guarda las credenciales generadas
npm run seed | tee seed-output.txt

# Cambia las contraseñas inmediatamente después del primer login
```

### 5.3 Reset Completo de Base de Datos (Solo Desarrollo)

**⚠️ ADVERTENCIA: Esto ELIMINA todos los datos**

```bash
cd backend

# Revertir todas las migraciones
npm run migration:revert

# Ejecutar migraciones nuevamente
npm run migration:run

# Re-seed
npm run seed
```

---

## 6. Verificación de Instalación

### 6.1 Verificar Servicios

#### Desarrollo

```bash
# Backend
curl http://localhost:3000/health

# Respuesta esperada:
# {"status":"OK","database":"connected"}

# Frontend
curl http://localhost:5173

# Respuesta: HTML de la página
```

#### Producción

```bash
# Health check
curl https://api.rapidosur.com/health

# Respuesta:
# {"status":"OK","database":"connected"}

# Frontend
curl https://rapidosur.com

# Respuesta: HTML de la página
```

### 6.2 Verificar Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it rapido-sur-postgres psql -U postgres -d rapido_sur_db

# Dentro de psql:
\dt      # Listar tablas
\d usuarios  # Describir tabla usuarios
SELECT * FROM usuarios;  # Ver usuarios
\q       # Salir
```

**Tablas esperadas**:
- `usuarios`
- `vehiculos`
- `planes_preventivos`
- `ordenes_trabajo`
- `tareas`
- `repuestos`
- `detalles_repuestos`
- `migrations` (tabla interna de TypeORM)

### 6.3 Verificar Logs

#### Backend

```bash
# Desarrollo
cd backend
npm run start:dev

# Busca en la salida:
# ✅ All required environment variables are set
# ✅ JWT_SECRET validated for production
# 🚀 Application is running on: http://localhost:3000
# ✅ Database connected successfully
```

#### Docker (Producción)

```bash
# Logs del backend
docker logs rapido-sur-backend

# Logs en tiempo real
docker logs -f rapido-sur-backend

# Últimas 100 líneas
docker logs --tail 100 rapido-sur-backend
```

### 6.4 Verificar Endpoints de la API

Usa Postman, Insomnia, o curl:

**1. Health Check**:
```bash
curl http://localhost:3000/health
```

**2. Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rapidosur.cl",
    "password": "tu-password-del-seed"
  }'

# Respuesta esperada:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 1,
#     "email": "admin@rapidosur.cl",
#     "rol": "Administrador"
#   }
# }
```

**3. Obtener vehículos** (autenticado):
```bash
# Usa el token del login anterior
curl http://localhost:3000/api/vehiculos \
  -H "Authorization: Bearer <tu-access-token>"
```

### 6.5 Verificar Frontend

1. Abre el navegador en `http://localhost:5173` (desarrollo) o tu dominio (producción)
2. Deberías ver la **página de login**
3. Ingresa credenciales del seed
4. Deberías ver el **dashboard** correspondiente a tu rol
5. Navega por los módulos para verificar que todo funciona

**Checklist de funcionalidades básicas**:
- ✅ Login funciona
- ✅ Dashboard carga correctamente
- ✅ Puedes ver la lista de vehículos
- ✅ Puedes ver órdenes de trabajo
- ✅ Logout funciona

---

## 7. Configuración de Emails

El sistema envía emails para:
- Alertas de mantenimiento preventivo (diariamente a las 6:00 AM)
- Recuperación de contraseña
- Notificaciones a mecánicos (opcional)

### 7.1 Configuración con Gmail

#### Paso 1: Habilitar verificación en 2 pasos

1. Ve a https://myaccount.google.com
2. **Seguridad** → **Verificación en 2 pasos**
3. Sigue las instrucciones para habilitarla

#### Paso 2: Generar App Password

1. En https://myaccount.google.com
2. **Seguridad** → Busca **"Contraseñas de aplicaciones"**
3. Selecciona:
   - **App**: Mail
   - **Device**: Other (Custom name) → "Rápido Sur Sistema"
4. Haz clic en **Generar**
5. **Copia el password** (formato: `abcd efgh ijkl mnop`)

#### Paso 3: Configurar variables de entorno

```bash
# En .env del backend
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop  # Sin espacios
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
```

### 7.2 Configuración con SendGrid (Alternativa)

Si prefieres SendGrid:

1. Crea cuenta en https://sendgrid.com
2. Genera un API Key
3. Configura:

```bash
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey  # Literal "apikey"
MAIL_PASSWORD=<tu-sendgrid-api-key>
```

### 7.3 Probar envío de emails

```bash
# Desde backend/
npm run test:email

# O ejecuta manualmente:
cd backend
npx ts-node src/scripts/test-email.ts
```

**Si el email no llega**:
- Verifica que las credenciales sean correctas
- Revisa la carpeta de spam
- Verifica logs del backend para errores
- Confirma que el firewall no bloquee el puerto 587

---

## 8. Configuración de SSL/HTTPS

### 8.1 Con Dokploy (Automático)

Dokploy configura SSL automáticamente con Let's Encrypt:

1. Panel de Dokploy → **Dominios**
2. Agrega tu dominio: `rapidosur.ejemplo.com`
3. Habilita **"SSL automático (Let's Encrypt)"**
4. Dokploy:
   - Solicita certificado SSL
   - Configura renovación automática cada 90 días
   - Redirige HTTP → HTTPS automáticamente

**Dominios necesarios**:
- `rapidosur.com` (frontend)
- `api.rapidosur.com` (backend)

### 8.2 Con Certbot (Manual)

Si no usas Dokploy:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d rapidosur.com -d api.rapidosur.com

# Certbot configurará nginx automáticamente

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 8.3 Verificar SSL

```bash
# Verifica que HTTPS funcione
curl https://rapidosur.com

# Verifica la validez del certificado
openssl s_client -connect rapidosur.com:443 -servername rapidosur.com
```

**Herramientas online**:
- https://www.ssllabs.com/ssltest/ → Debería obtener calificación A o A+

---

## 9. Troubleshooting

### 9.1 Backend no arranca

**Síntoma**: `npm run start:dev` falla

**Causas comunes**:

1. **Variables de entorno faltantes**:
   ```
   Error: Missing required environment variables: JWT_SECRET
   ```
   **Solución**: Verifica que `.env` existe y tiene todas las variables

2. **Puerto ya en uso**:
   ```
   Error: listen EADDRINUSE: address already in use :::3000
   ```
   **Solución**:
   ```bash
   # Encuentra el proceso usando el puerto 3000
   lsof -i :3000
   # Mata el proceso
   kill -9 <PID>
   ```

3. **PostgreSQL no está corriendo**:
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   **Solución**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

### 9.2 Frontend no arranca

**Síntoma**: `npm run dev` falla en frontend

**Causas comunes**:

1. **Puerto ya en uso**:
   ```bash
   # Usa otro puerto
   npm run dev -- --port 5174
   ```

2. **Dependencias no instaladas**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### 9.3 Problemas de conexión Frontend → Backend

**Síntoma**: Frontend no puede hacer login o fetch de datos

**Causas comunes**:

1. **URL de API incorrecta**:
   - Verifica `NEXT_PUBLIC_API_URL` en `frontend/.env.local`
   - Debe incluir `/api` al final: `http://localhost:3000/api`

2. **CORS bloqueado**:
   - Verifica `FRONTEND_URL` en `backend/.env`
   - Debe coincidir con la URL del frontend

3. **Backend no está corriendo**:
   ```bash
   # Verifica health check
   curl http://localhost:3000/health
   ```

### 9.4 Migraciones fallan

**Síntoma**: `npm run migration:run` falla

**Soluciones**:

```bash
# Revertir última migración
npm run migration:revert

# Verificar conexión a la BD
npm run migration:show

# Si nada funciona, reset completo (SOLO desarrollo)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
npm run migration:run
npm run seed
```

### 9.5 Docker Compose falla

**Síntoma**: `docker compose up -d` falla

**Soluciones**:

```bash
# Ver logs detallados
docker compose logs

# Rebuild forzado
docker compose build --no-cache
docker compose up -d

# Limpiar todo Docker (CUIDADO)
docker system prune -a --volumes
```

### 9.6 JWT_SECRET inseguro en producción

**Síntoma**:
```
[ERROR] JWT_SECRET is insecure for production
[ERROR] Application failed to start
```

**Solución**:
```bash
cd backend
npm run secrets:generate
# Copia el JWT_SECRET generado (128 chars) a tu .env de producción
```

---

## 10. Actualización del Sistema

### 10.1 Actualización en Desarrollo

```bash
# 1. Hacer pull de cambios
git pull origin main

# 2. Actualizar dependencias
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Ejecutar nuevas migraciones (si las hay)
cd backend
npm run migration:run

# 4. Reiniciar servicios
# (Ctrl+C en los terminales y volver a ejecutar npm run dev)
```

### 10.2 Actualización en Producción con Dokploy

**Auto-deploy** (si está configurado):
1. Haces push a `main` en GitHub
2. Dokploy detecta el cambio automáticamente
3. Hace re-deploy automático

**Manual**:
1. Panel de Dokploy → Tu proyecto
2. Haz clic en **"Re-deploy"**
3. Espera a que termine el proceso

### 10.3 Actualización Manual en Producción

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor

# 2. Ir al directorio del proyecto
cd /opt/rapido-sur

# 3. Hacer pull de cambios
git pull origin main

# 4. Rebuild de imágenes
docker compose build

# 5. Actualizar servicios (sin downtime)
docker compose up -d

# 6. Ejecutar migraciones (si las hay)
docker exec -it rapido-sur-backend npm run migration:run

# 7. Verificar que todo funciona
docker ps
docker logs rapido-sur-backend
```

---

## 11. Backups y Restore

### 11.1 Backup de Base de Datos

#### Manual

```bash
# Crear backup
docker exec rapido-sur-postgres pg_dump -U postgres rapido_sur_db > backup-$(date +%Y%m%d).sql

# Comprimir
gzip backup-$(date +%Y%m%d).sql

# Resultado: backup-20251209.sql.gz
```

#### Script Automático

Crea un script `/opt/rapido-sur/backup.sh`:

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/opt/rapido-sur/backups"
CONTAINER="rapido-sur-postgres"
DB_NAME="rapido_sur_db"
DB_USER="postgres"
DATE=$(date +%Y%m%d-%H%M%S)
FILENAME="backup-$DATE.sql"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Hacer backup
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/$FILENAME

# Comprimir
gzip $BACKUP_DIR/$FILENAME

# Eliminar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +30 -delete

echo "Backup completado: $BACKUP_DIR/$FILENAME.gz"
```

**Hacer ejecutable**:
```bash
chmod +x /opt/rapido-sur/backup.sh
```

**Configurar cron para backup diario**:
```bash
# Editar crontab
crontab -e

# Agregar línea (backup diario a las 2 AM)
0 2 * * * /opt/rapido-sur/backup.sh >> /var/log/rapido-sur-backup.log 2>&1
```

### 11.2 Restore de Base de Datos

```bash
# Descomprimir backup
gunzip backup-20251209.sql.gz

# Restore
docker exec -i rapido-sur-postgres psql -U postgres -d rapido_sur_db < backup-20251209.sql

# Verificar
docker exec -it rapido-sur-postgres psql -U postgres -d rapido_sur_db -c "SELECT COUNT(*) FROM usuarios;"
```

### 11.3 Backup de Archivos del Proyecto

```bash
# Backup completo del código (sin node_modules)
tar --exclude='node_modules' --exclude='dist' --exclude='.git' \
    -czf rapido-sur-code-$(date +%Y%m%d).tar.gz /opt/rapido-sur

# Subir a almacenamiento externo (Google Drive, Dropbox, S3, etc.)
# Ejemplo con rclone (si está configurado):
rclone copy rapido-sur-code-$(date +%Y%m%d).tar.gz remote:backups/
```

### 11.4 Disaster Recovery

**En caso de pérdida total del servidor**:

1. **Nuevo servidor VPS**:
   - Instalar Docker y Docker Compose
   - Configurar firewall

2. **Restaurar código**:
   ```bash
   git clone https://github.com/tu-organizacion/rapido-sur.git /opt/rapido-sur
   cd /opt/rapido-sur
   ```

3. **Configurar variables de entorno**:
   - Restaurar archivos `.env` desde backup seguro

4. **Restaurar base de datos**:
   ```bash
   # Levantar solo PostgreSQL
   docker compose up -d postgres

   # Esperar a que PostgreSQL esté listo
   sleep 10

   # Crear base de datos
   docker exec rapido-sur-postgres psql -U postgres -c "CREATE DATABASE rapido_sur_db;"

   # Restaurar desde backup
   docker exec -i rapido-sur-postgres psql -U postgres -d rapido_sur_db < backup-mas-reciente.sql
   ```

5. **Levantar todos los servicios**:
   ```bash
   docker compose up -d
   ```

6. **Verificar**:
   ```bash
   curl http://tu-nueva-ip/health
   ```

---

## Anexo A: Comandos Útiles

### NPM Scripts

```bash
# Backend
npm run start:dev        # Inicia backend en modo desarrollo
npm run start:prod       # Inicia backend en modo producción
npm run build            # Compila TypeScript a JavaScript
npm run migration:run    # Ejecuta migraciones
npm run migration:revert # Revierte última migración
npm run seed             # Puebla BD con datos de ejemplo
npm run test             # Ejecuta tests unitarios
npm run test:e2e         # Ejecuta tests end-to-end

# Frontend
npm run dev              # Inicia frontend en modo desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build de producción
npm run lint             # Linter (ESLint)
```

### Docker Commands

```bash
# Ver contenedores corriendo
docker ps

# Ver logs
docker logs <container-name>
docker logs -f <container-name>  # Follow (tiempo real)

# Entrar a un contenedor
docker exec -it <container-name> /bin/bash

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker compose down -v

# Rebuild de imágenes
docker compose build --no-cache

# Ver uso de recursos
docker stats
```

### PostgreSQL Commands

```bash
# Conectar a PostgreSQL
docker exec -it rapido-sur-postgres psql -U postgres -d rapido_sur_db

# Dentro de psql:
\l           # Listar bases de datos
\c dbname    # Conectar a una base de datos
\dt          # Listar tablas
\d tablename # Describir tabla
\q           # Salir
```

---

## Anexo B: Estructura de Archivos de Configuración

```
rapido-sur/
├── .env.example                    # Template de variables globales
├── docker-compose.yml              # Producción (3 servicios)
├── docker-compose.dev.yml          # Desarrollo (solo PostgreSQL)
├── docker-compose.full.yml         # Stack completo dockerizado
│
├── backend/
│   ├── .env                        # Variables del backend (NO commit)
│   ├── .env.example                # Template (SÍ commit)
│   ├── .env.production.example     # Template de producción (SÍ commit)
│   ├── Dockerfile                  # Build de imagen del backend
│   ├── tsconfig.json               # Configuración de TypeScript
│   └── nest-cli.json               # Configuración de NestJS CLI
│
└── frontend/
    ├── .env.local                  # Variables del frontend (NO commit)
    ├── .env.example                # Template (SÍ commit)
    ├── .env.production.example     # Template de producción (SÍ commit)
    ├── Dockerfile                  # Multi-stage build con nginx
    ├── next.config.js              # Configuración de Next.js
    └── vite.config.ts              # Configuración de Vite (si aplica)
```

---

**Fin del Manual de Instalación**

*Versión 1.0 - Diciembre 2025*
*Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur*
*Desarrollado por: Rubilar, Bravo, Loyola, Aguayo*
