# ⚡ Quick Start - Deployment en Dokploy

Resumen ejecutivo para desplegar Rápido Sur Backend en Dokploy en 10 minutos.

## 🎯 Checklist Rápido

### 1️⃣ Crear PostgreSQL en Dokploy (5 min)

```
Service → PostgreSQL → Create
Name: rapido-sur-postgres
Version: 15-alpine
Database: rapido_sur_prod
Username: postgres
Password: [GENERAR_SEGURA]
✅ Persistent Storage
```

Guardar: `DB_HOST=rapido-sur-postgres`

---

### 2️⃣ Crear Aplicación Backend (3 min)

```
Applications → Docker Compose → Create
Name: rapido-sur-backend
Repository: [TU_REPO_GIT]
Branch: main
Build Path: /backend
Compose File: docker-compose.prod.yml
```

---

### 3️⃣ Variables de Entorno CRÍTICAS (2 min)

**Copiar y pegar en Dokploy Environment Variables:**

```bash
# Database (usar datos del paso 1)
DB_HOST=rapido-sur-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[TU_PASSWORD_POSTGRES]
DB_DATABASE=rapido_sur_prod

# JWT (generar nuevo)
JWT_SECRET=[EJECUTAR: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
JWT_EXPIRATION=24h

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.com

# Email SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=[APP_SPECIFIC_PASSWORD]
MAIL_FROM=noreply@rapidosur.cl

# Alertas
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
ENABLE_CRON=true

# Logs
LOG_LEVEL=info
```

---

### 4️⃣ Deploy y Verificar

```bash
# 1. Click "Deploy" en Dokploy
# 2. Esperar a que el build termine
# 3. Verificar logs que no haya errores

# 4. Probar health check:
curl https://api.rapidosur.com/health

# 5. Ejecutar seed desde consola Dokploy:
npm run seed

# 6. Probar login:
curl -X POST https://api.rapidosur.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rapidosur.cl","password":"Admin123!"}'
```

---

## 🔐 Usuarios por Defecto (Seed)

Después de ejecutar `npm run seed`:

| Email | Password | Rol |
|-------|----------|-----|
| `admin@rapidosur.cl` | `Admin123!` | Administrador |
| `jefe.mantenimiento@rapidosur.cl` | `Manager123!` | Jefe de Mantenimiento |
| `mecanico@rapidosur.cl` | `Mechanic123!` | Mecánico |

⚠️ **CAMBIAR CONTRASEÑAS INMEDIATAMENTE**

---

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"
- Verificar que `DB_HOST=rapido-sur-postgres` (nombre del servicio)
- Confirmar que PostgreSQL está corriendo
- Revisar credenciales

### Error: "Unauthorized"
- Verificar que JWT_SECRET tenga mínimo 32 caracteres
- Confirmar que el seed se ejecutó correctamente

### Error: CORS
- Verificar `FRONTEND_URL` (sin trailing slash)
- Debe ser URL completa: `https://app.rapidosur.com`

---

## 📚 Documentación Completa

Para más detalles: [DEPLOYMENT_DOKPLOY.md](./DEPLOYMENT_DOKPLOY.md)

---

**Tiempo total estimado**: ⏱️ 10 minutos
