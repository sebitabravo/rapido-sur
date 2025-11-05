# 🚀 Guía de Deployment en Dokploy - Rápido Sur Backend

Esta guía detalla paso a paso cómo desplegar el backend de Rápido Sur en Dokploy/Hostinger.

## 📋 Prerrequisitos

- [ ] Cuenta en Hostinger con VPS activo
- [ ] Dokploy instalado y configurado en el VPS
- [ ] Acceso al panel de Dokploy (generalmente en `http://tu-ip:3000`)
- [ ] Repositorio Git del proyecto (GitHub/GitLab)
- [ ] Dominio configurado (opcional, pero recomendado para producción)

## 🔧 Paso 1: Preparar el Servidor PostgreSQL en Dokploy

### 1.1. Crear Servicio de PostgreSQL

1. En Dokploy, ve a **"Services"** → **"Create Service"**
2. Selecciona **"PostgreSQL"**
3. Configura:
   - **Name**: `rapido-sur-postgres`
   - **Version**: `15-alpine`
   - **Database Name**: `rapido_sur_prod`
   - **Username**: `postgres`
   - **Password**: **[Genera una contraseña segura]**
   - **Port**: `5432` (interno)
   - **Persistent Storage**: ✅ Activado (importante para no perder datos)

4. Guarda y espera a que el servicio esté en estado **"Running"**

### 1.2. Obtener Datos de Conexión

Una vez creado, Dokploy te proporcionará:
- **Internal Host**: `rapido-sur-postgres` (usar este para DB_HOST)
- **Port**: `5432`
- **Connection String**: Anótala, la necesitarás más adelante

⚠️ **IMPORTANTE**: Guarda estos datos de forma segura. Los necesitarás para configurar el backend.

---

## 🐳 Paso 2: Configurar el Backend en Dokploy

### 2.1. Crear Aplicación Docker Compose

1. En Dokploy, ve a **"Applications"** → **"Create Application"**
2. Selecciona **"Docker Compose"**
3. Configura:
   - **Name**: `rapido-sur-backend`
   - **Repository**: URL de tu repositorio Git
   - **Branch**: `main` (o la rama que uses para producción)
   - **Build Path**: `/backend`
   - **Compose File**: `docker-compose.prod.yml`

### 2.2. Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega todas las siguientes variables:

#### 🔐 Aplicación

```bash
NODE_ENV=production
PORT=3000
```

#### 🗄️ Base de Datos (usar datos del Paso 1)

```bash
DB_HOST=rapido-sur-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[tu_contraseña_postgresql_segura]
DB_DATABASE=rapido_sur_prod
```

#### 🔑 Autenticación JWT

```bash
JWT_SECRET=[genera_string_aleatorio_minimo_64_caracteres]
JWT_EXPIRATION=24h
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 🌐 CORS

```bash
FRONTEND_URL=https://tu-dominio-frontend.com
```

⚠️ **IMPORTANTE**: Reemplaza con tu dominio real de frontend (sin trailing slash)

#### 📧 Email (SMTP)

**Opción 1: Gmail** (recomendado para desarrollo)
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=[app_specific_password]
MAIL_FROM=noreply@rapidosur.cl
```

**Opción 2: SendGrid** (recomendado para producción)
```bash
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASSWORD=[tu_sendgrid_api_key]
MAIL_FROM=noreply@rapidosur.cl
```

#### 🔔 Alertas de Mantenimiento

```bash
MAINTENANCE_MANAGER_EMAIL=jefe.mantenimiento@rapidosur.cl
ENABLE_CRON=true
ALERTS_CRON_SCHEDULE=0 6 * * *
```

#### 📊 Logging y Rate Limiting

```bash
LOG_LEVEL=info
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

### 2.3. Configurar Dominio (Opcional pero Recomendado)

1. En la sección **"Domains"**, agrega tu dominio:
   - **Domain**: `api.rapidosur.com` (o el subdominio que elijas)
   - **Enable SSL**: ✅ Activado (Let's Encrypt automático)
   - **Port**: `3000`

2. Dokploy configurará automáticamente el certificado SSL con Let's Encrypt

### 2.4. Deploy

1. Haz clic en **"Deploy"**
2. Dokploy ejecutará:
   - ✅ Clone del repositorio
   - ✅ Build de la imagen Docker
   - ✅ Inicio del contenedor
   - ✅ Health checks

3. Monitorea los logs en tiempo real en la pestaña **"Logs"**

---

## 🗄️ Paso 3: Configurar la Base de Datos

### 3.1. Ejecutar Migraciones (Primera vez)

**Opción A: Desde tu máquina local**

1. Configura un archivo `.env.production` local con los datos de Dokploy:

```bash
DB_HOST=[IP_del_VPS]
DB_PORT=5432  # Asegúrate de exponer el puerto en Dokploy si es necesario
DB_USERNAME=postgres
DB_PASSWORD=[tu_contraseña]
DB_DATABASE=rapido_sur_prod
```

2. Ejecuta las migraciones:

```bash
npm run migration:run
```

**Opción B: Desde el contenedor en Dokploy**

1. En Dokploy, ve a **"Console"** de tu aplicación
2. Ejecuta:

```bash
npm run migration:run
```

### 3.2. Poblar Datos Iniciales (Seed)

**Crear usuarios administradores iniciales:**

1. Desde el contenedor o localmente, ejecuta:

```bash
npm run seed
```

Esto creará:
- ✅ Admin: `admin@rapidosur.cl` / `Admin123!`
- ✅ Jefe de Mantenimiento: `jefe.mantenimiento@rapidosur.cl` / `Manager123!`
- ✅ Mecánico de prueba: `mecanico@rapidosur.cl` / `Mechanic123!`

⚠️ **IMPORTANTE**: Cambia estas contraseñas inmediatamente después del primer login.

---

## ✅ Paso 4: Verificación del Deployment

### 4.1. Health Check

Verifica que el backend esté funcionando:

```bash
curl https://api.rapidosur.com/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4.2. Swagger Documentation

Accede a la documentación interactiva de la API:

```
https://api.rapidosur.com/api/docs
```

### 4.3. Probar Login

**Request:**
```bash
curl -X POST https://api.rapidosur.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rapidosur.cl",
    "password": "Admin123!"
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@rapidosur.cl",
    "nombre_completo": "Administrador del Sistema",
    "rol": "Administrador"
  }
}
```

---

## 🔄 Paso 5: Configurar Auto-Deploy

### 5.1. Webhook de GitHub (Recomendado)

1. En Dokploy, copia la URL del webhook de tu aplicación
2. Ve a tu repositorio en GitHub → **Settings** → **Webhooks**
3. Agrega un nuevo webhook:
   - **Payload URL**: [URL del webhook de Dokploy]
   - **Content type**: `application/json`
   - **Events**: Push events en la rama `main`
4. Guarda

**Ahora cada push a `main` desplegará automáticamente** 🚀

---

## 🛠️ Troubleshooting

### Problema: El contenedor no inicia

**Solución:**
1. Revisa los logs en Dokploy
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que PostgreSQL esté running

### Problema: Error de conexión a la base de datos

**Solución:**
1. Verifica que `DB_HOST` sea el nombre interno del servicio de PostgreSQL en Dokploy
2. Confirma que PostgreSQL esté en la misma red que el backend
3. Revisa las credenciales

### Problema: Error 502 Bad Gateway

**Solución:**
1. Verifica que el puerto `3000` esté expuesto en `docker-compose.prod.yml`
2. Asegúrate de que el health check esté pasando
3. Revisa que no haya errores en los logs de la aplicación

### Problema: CORS errors desde el frontend

**Solución:**
1. Verifica que `FRONTEND_URL` esté configurado correctamente
2. Asegúrate de que **NO** tenga trailing slash
3. Debe ser la URL completa con protocolo: `https://app.rapidosur.com`

---

## 🔐 Seguridad Post-Deployment

### ✅ Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto de usuarios
- [ ] Verificar que `JWT_SECRET` sea único y aleatorio (mínimo 64 caracteres)
- [ ] Confirmar que `NODE_ENV=production`
- [ ] Asegurar que las credenciales de SMTP sean correctas y seguras
- [ ] Configurar SSL/TLS con Let's Encrypt (Dokploy lo hace automáticamente)
- [ ] Revisar que los logs no expongan información sensible
- [ ] Configurar backups automáticos de la base de datos en Dokploy
- [ ] Limitar acceso al panel de Dokploy solo a IPs conocidas (opcional)

---

## 📊 Monitoreo y Mantenimiento

### Logs

**Ver logs en tiempo real:**
1. En Dokploy, ve a tu aplicación
2. Click en **"Logs"**
3. Filtra por nivel: `error`, `warn`, `info`

### Backups de Base de Datos

**Configurar backup automático en Dokploy:**
1. Ve al servicio PostgreSQL
2. Sección **"Backups"**
3. Configura:
   - **Schedule**: Diario a las 2 AM
   - **Retention**: 7 días
   - **Storage**: Volumen persistente

**Backup manual:**
```bash
docker exec rapido-sur-postgres pg_dump -U postgres rapido_sur_prod > backup.sql
```

### Actualización del Backend

**Para actualizar a una nueva versión:**

1. Haz push de los cambios a la rama `main`
2. Si tienes webhook configurado, el deploy es automático
3. Si no, en Dokploy click en **"Redeploy"**
4. Si hay migraciones nuevas, ejecútalas desde la consola del contenedor

---

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. **Revisa los logs** en Dokploy primero
2. **Consulta CLAUDE.md** para decisiones arquitectónicas
3. **Revisa .env.example** para verificar variables requeridas
4. **Contacta al equipo**: Rubilar, Bravo, Loyola, Aguayo

---

## 📚 Referencias

- [Documentación de Dokploy](https://dokploy.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/faq/deployment)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Última actualización**: Enero 2025
**Versión del documento**: 1.0
**Equipo**: Rubilar, Bravo, Loyola, Aguayo
