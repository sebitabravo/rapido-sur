# 🚀 Guía de Deployment - Rápido Sur

Deploy de Rápido Sur en producción usando Dokploy. **Tiempo estimado: 15 minutos.**

## ⚡ Antes de Empezar

Requisitos:
- ✅ Cuenta de Dokploy configurada
- ✅ Servidor VPS con Docker instalado
- ✅ Repositorio en GitHub
- ✅ Dominio (opcional pero recomendado)

---

## 📋 Paso 1: Generar Secrets (2 minutos)

**En tu computadora local:**

```bash
cd backend
npm run secrets:generate
```

**Guarda estos valores en un lugar seguro:**
- `JWT_SECRET` (128 caracteres)
- `DB_PASSWORD` (segura)

---

## ⚙️ Paso 2: Configurar Variables en Dokploy (5 minutos)

### Abre `.env.production.example`

Este archivo tiene todas las variables. Reemplaza los valores entre `<>`:

**Variables CRÍTICAS a cambiar:**

```bash
# Seguridad
NODE_ENV=production
JWT_SECRET=<pega_tu_jwt_secret_aqui>  # Del script anterior

# Base de Datos
DB_PASSWORD=<pega_tu_db_password_aqui>  # Del script anterior

# URLs (cambia con tus dominios)
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api

# Email (Gmail)
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=<app_password_de_gmail>
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
```

### Configurar en Dokploy

1. Panel de Dokploy → Tu proyecto
2. **Environment Variables**
3. Pega todas las variables
4. Guarda cambios

---

## 🎯 Paso 3: Conectar GitHub (3 minutos)

En Dokploy:

1. **Crear Proyecto** → Nombre: "Rápido Sur"
2. **Conectar Repositorio** → GitHub
3. **Seleccionar:** rama `main`
4. **Build Type:** Docker Compose (auto-detectado)

---

## ✅ Paso 4: Deploy (3 minutos)

1. Click en **Deploy**
2. Espera 3-5 minutos
3. Dokploy automáticamente:
   - ✅ Clona repo
   - ✅ Build backend + frontend
   - ✅ Levanta servicios

---

## 🔍 Paso 5: Verificar (2 minutos)

### Ver logs en tiempo real

En Dokploy → Logs → Backend

Deberías ver:
```
[Bootstrap] ✅ All required environment variables are set
[Bootstrap] ✅ JWT_SECRET validated for production
[Bootstrap] 🚀 Application is running...
```

### Verificar Health Check

```bash
curl https://api.tu-dominio.com/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "database": "connected"
}
```

### Acceder al Sistema

- **Frontend:** `https://tu-dominio.com`
- **API Docs:** `https://api.tu-dominio.com/api/docs`

---

## 🆘 Si Algo Sale Mal

### Error: JWT_SECRET is insecure

```bash
cd backend
npm run secrets:generate
```

Copia el JWT_SECRET nuevo a Dokploy y re-deploy.

### Error: Database connection failed

1. Ve a Dokploy → Logs → postgres
2. Verifica que postgres esté "Running"
3. Verifica `DB_PASSWORD` en variables de entorno

### Error: Frontend no conecta al backend

Verifica `NEXT_PUBLIC_API_URL` en variables:
```bash
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
                                               ^^^^ importante: /api
```

---

## 🔄 Actualizaciones Futuras

Cuando hagas cambios:

```bash
git add .
git commit -m "feat: cambio"
git push origin main
```

Dokploy detecta el push y hace re-deploy automático (si está configurado).

**O manual:** En Dokploy → Click en **Re-deploy**

---

## 📧 Gmail App Password

1. https://myaccount.google.com
2. **Seguridad** → **Verificación en 2 pasos** (activar si no está)
3. Busca **"Contraseñas de aplicaciones"**
4. Selecciona: App: "Mail", Device: "Other"
5. Copia el password (formato: `abcd efgh ijkl mnop`)
6. Pega en `MAIL_PASSWORD` en Dokploy

---

## ✅ Checklist Final

```
✅ JWT_SECRET generado (mínimo 64 caracteres)
✅ DB_PASSWORD seguro (no default)
✅ FRONTEND_URL configurado
✅ NEXT_PUBLIC_API_URL configurado (con /api)
✅ MAIL_USER y MAIL_PASSWORD configurados
✅ NODE_ENV=production
✅ /health retorna OK
✅ Frontend carga correctamente
✅ Login funciona
✅ Puedes crear vehículos/órdenes de trabajo
```

---

## 📚 Más Información

- [README.md](./README.md) - Documentación general
- [CLAUDE.md](./CLAUDE.md) - Arquitectura y decisiones
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Errores comunes

