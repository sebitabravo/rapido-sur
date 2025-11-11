# 🚀 Guía Rápida de Deployment en Dokploy

Esta guía te ayudará a hacer deploy de Rápido Sur en producción usando Dokploy en menos de 15 minutos.

## ⚡ Resumen Rápido

1. **Genera secrets** → `npm run secrets:generate`
2. **Configura .env en Dokploy** → Copia `.env.production.example`
3. **Conecta GitHub** → Dokploy hace todo automático
4. **Verifica** → `curl https://tu-dominio.com/health`

---

## 📋 Pre-requisitos

- ✅ Cuenta de Dokploy configurada
- ✅ Servidor VPS (Hostinger) con Docker instalado
- ✅ Repositorio en GitHub
- ✅ Dominio configurado (opcional pero recomendado)
- ✅ Gmail con App Password para emails

---

## 🔐 Paso 1: Generar Secrets (5 minutos)

### En tu computadora local:

```bash
cd backend
npm run secrets:generate
```

**Salida del comando:**
```
🔐 Generating Secure Secrets for Production
======================================================================

📝 JWT_SECRET (copy this to Dokploy):
──────────────────────────────────────────────────────────────────────
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...
──────────────────────────────────────────────────────────────────────

🗄️  DB_PASSWORD (strong database password):
──────────────────────────────────────────────────────────────────────
Xk9m2P7qR4tY8wE3nA5s...
──────────────────────────────────────────────────────────────────────
```

**📝 IMPORTANTE:**
- Copia estos valores
- Guárdalos en un lugar seguro (LastPass, 1Password, etc.)
- NO los subas a GitHub
- Los necesitarás en el siguiente paso

---

## ⚙️ Paso 2: Configurar Variables en Dokploy (5 minutos)

### 1. Abre el archivo `.env.production.example`

Este archivo tiene todas las variables que necesitas configurar con comentarios explicativos.

### 2. Crea tu .env de producción

Copia `.env.production.example` y reemplaza todos los valores marcados con `<CAMBIAR_AQUI>`:

```bash
# ============================================
# VARIABLES CRÍTICAS - DEBES CAMBIARLAS
# ============================================

NODE_ENV=production
PORT=3000

# Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<PEGA_AQUI_EL_DB_PASSWORD_GENERADO>  # 👈 Del script
DB_DATABASE=rapido_sur

# JWT Authentication - CRÍTICO
JWT_SECRET=<PEGA_AQUI_EL_JWT_SECRET_GENERADO>  # 👈 Del script (mínimo 64 chars)
JWT_EXPIRATION=24h

# URLs - Cambia con tus dominios reales
FRONTEND_URL=https://rapidosur.com  # 👈 Tu dominio frontend
NEXT_PUBLIC_API_URL=https://api.rapidosur.com/api  # 👈 Tu dominio backend + /api

# Email - Gmail App Password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=sistema@rapidosur.com  # 👈 Tu email
MAIL_PASSWORD=abcd efgh ijkl mnop  # 👈 App Password de Gmail
MAIL_FROM=noreply@rapidosur.cl
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl  # 👈 Email del jefe

# Sistema
ENABLE_CRON=true
ALERTS_CRON_SCHEDULE=0 6 * * *
ENABLE_SEEDING=false  # 👈 true solo la primera vez
LOG_LEVEL=log
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 3. Pegar en Dokploy

1. Ingresa a tu panel de Dokploy
2. Ve a tu proyecto → **Environment Variables**
3. Pega todas las variables (cada línea)
4. Guarda cambios

---

## 🎯 Paso 3: Conectar GitHub y Deploy (3 minutos)

### En Dokploy:

1. **Crear Proyecto:**
   - Click en "New Project"
   - Nombre: "Rapido Sur"

2. **Conectar Repositorio:**
   - Source: GitHub
   - Repositorio: `tu-usuario/rapido-sur`
   - Branch: `main`

3. **Configurar Build:**
   - Build Type: Docker Compose
   - Dokploy detectará automáticamente `docker-compose.yml`

4. **Deploy:**
   - Click en "Deploy"
   - Espera 3-5 minutos mientras:
     - ✅ Clona el repo
     - ✅ Build del backend
     - ✅ Build del frontend
     - ✅ Levanta servicios

---

## ✅ Paso 4: Verificar Deployment (2 minutos)

### 1. Ver Logs en Dokploy

Mientras hace deploy, ve los logs en tiempo real:

```
[Backend] [Bootstrap] ✅ All required environment variables are set
[Backend] [Bootstrap] ✅ JWT_SECRET validated for production
[Backend] [Bootstrap] 🚀 Application is running on: http://localhost:3000
[Backend] [Bootstrap] 📚 API Documentation: http://localhost:3000/api/docs
[Backend] [Bootstrap] 🌍 Environment: production
```

Si ves esos mensajes con ✅, todo está bien!

### 2. Verificar Health Check

```bash
# Verifica que el backend esté funcionando
curl https://api.tu-dominio.com/health

# Respuesta esperada:
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2025-01-10T22:00:00.000Z"
}
```

### 3. Verificar Endpoints

```bash
# Status detallado
curl https://api.tu-dominio.com/api/status

# API Docs (abre en navegador)
https://api.tu-dominio.com/api/docs

# Frontend (abre en navegador)
https://tu-dominio.com
```

### 4. Verificar Base de Datos

En Dokploy:
- Ve a Logs → postgres
- Deberías ver: `database system is ready to accept connections`

---

## 🔍 Troubleshooting

### ❌ Error: JWT_SECRET is insecure

**Logs:**
```
[Environment] ❌ JWT_SECRET is insecure in production environment
[Environment]   - Must be at least 64 characters long
```

**Solución:**
1. Genera nuevo secret: `npm run secrets:generate`
2. Copia el JWT_SECRET (tiene 128 caracteres)
3. Actualiza en Dokploy Environment Variables
4. Re-deploy

---

### ❌ Error: Missing required environment variables

**Logs:**
```
[Environment] ❌ Missing required environment variables: DB_PASSWORD
```

**Solución:**
1. Ve a Dokploy → Environment Variables
2. Verifica que TODAS las variables estén configuradas
3. Compara con `.env.production.example`
4. Re-deploy

---

### ❌ Error: Frontend no conecta al backend

**Síntoma:** Frontend carga pero no muestra datos.

**Solución:**
1. Verifica `NEXT_PUBLIC_API_URL` en Dokploy
2. Debe incluir `/api` al final:
   ```
   NEXT_PUBLIC_API_URL=https://api.rapidosur.com/api
   #                                              ^^^^ importante
   ```
3. Re-deploy del frontend

---

### ❌ Error: Database connection failed

**Logs:**
```
[TypeORM] Unable to connect to the database
```

**Solución:**
1. Ve a Logs → postgres en Dokploy
2. Verifica que postgres esté corriendo
3. Verifica `DB_PASSWORD` en Environment Variables
4. Si cambias DB_PASSWORD, debes re-crear el volumen:
   ```bash
   docker volume rm rapido-sur-postgres-data
   ```

---

## 🔄 Re-deployment (Actualizaciones)

Cuando hagas cambios al código:

### Opción 1: Auto-deploy (Recomendado)

1. En Dokploy, configura **Auto Deploy** desde GitHub
2. Haz push a main:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin main
   ```
3. Dokploy detecta el push y hace re-deploy automáticamente

### Opción 2: Deploy Manual

1. Push a GitHub
2. En Dokploy → Click en "Re-deploy"
3. Espera a que termine

---

## 📧 Cómo Obtener Gmail App Password

Para que el sistema pueda enviar emails de alertas:

1. **Ve a tu cuenta de Google:**
   - https://myaccount.google.com/

2. **Seguridad → Verificación en 2 pasos:**
   - Activa la verificación en 2 pasos (si no está activa)

3. **App Passwords:**
   - Busca "Contraseñas de aplicaciones"
   - Selecciona: App: "Mail", Device: "Other (Rápido Sur)"
   - Genera contraseña

4. **Copia el password:**
   - Se verá como: `abcd efgh ijkl mnop`
   - Pégalo en `MAIL_PASSWORD` en Dokploy

**IMPORTANTE:** NO uses tu contraseña normal de Gmail, usa el App Password.

---

## 🎯 Checklist Final

Antes de considerar el deployment completo:

```
✅ JWT_SECRET generado y configurado (mínimo 64 caracteres)
✅ DB_PASSWORD configurado (no usar valor por defecto)
✅ FRONTEND_URL configurado con tu dominio
✅ NEXT_PUBLIC_API_URL configurado con /api al final
✅ MAIL_USER y MAIL_PASSWORD configurados (Gmail App Password)
✅ MAINTENANCE_MANAGER_EMAIL configurado
✅ NODE_ENV=production
✅ /health retorna {"status":"OK","database":"connected"}
✅ /api/docs accesible (Swagger UI)
✅ Frontend carga correctamente
✅ Login funciona
✅ Puedes crear vehículos/órdenes de trabajo
✅ Emails de alertas funcionan (espera cron a las 6 AM o prueba manualmente)
```

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa logs en Dokploy:**
   - Backend logs
   - Frontend logs
   - Postgres logs

2. **Verifica variables de entorno:**
   - Compara con `.env.production.example`
   - Asegúrate de no tener typos

3. **Health checks:**
   ```bash
   curl https://api.tu-dominio.com/health
   curl https://api.tu-dominio.com/api/status
   ```

4. **Verifica servicios en Dokploy:**
   - Postgres debe estar "Running"
   - Backend debe estar "Running"
   - Frontend debe estar "Running"

---

## 📦 Archivos de Referencia

- `.env.production.example` - Template de variables para producción
- `docker-compose.yml` - Configuración de servicios
- `README.md` - Documentación completa
- `CLAUDE.md` - Memoria del proyecto y arquitectura

---

## 🎉 ¡Listo!

Tu sistema está en producción. Ahora puedes:

- ✅ Acceder al sistema desde tu dominio
- ✅ Crear usuarios, vehículos, órdenes de trabajo
- ✅ Recibir alertas automáticas por email
- ✅ Generar reportes
- ✅ Ver la API en Swagger Docs

**¡Felicitaciones! 🚀**
