# 🚀 Guía de Deployment - Rápido Sur Backend

Esta guía explica cómo desplegar el backend de Rápido Sur en Hostinger usando Dokploy.

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Configuración Inicial](#configuración-inicial)
- [Deployment Local (Testing)](#deployment-local-testing)
- [Deployment en Hostinger con Dokploy](#deployment-en-hostinger-con-dokploy)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [Mantenimiento](#mantenimiento)

---

## 📦 Prerequisitos

### En Tu Máquina Local

- **Docker Desktop** instalado y corriendo
- **Node.js 20 LTS** instalado
- **Git** configurado con acceso al repositorio
- **Acceso al servidor Hostinger** (credenciales VPS)

### En Hostinger

- **VPS contratado** (mínimo 2GB RAM, 1 CPU, 50GB SSD)
- **Dokploy instalado** en el VPS
- **PostgreSQL database** creada
- **Dominio configurado** (opcional pero recomendado)

---

## ⚙️ Configuración Inicial

### 1. Preparar Variables de Entorno

```bash
# En tu máquina local, copia el archivo ejemplo
cd backend
cp .env.example .env

# Edita .env con tus valores de desarrollo
# Asegúrate de NO commitear este archivo
```

### 2. Generar Secrets Seguros

```bash
# JWT Secret (mínimo 32 caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Password seguro
openssl rand -base64 24
```

**Guarda estos valores en un lugar seguro** (1Password, LastPass, etc.)

---

## 🏠 Deployment Local (Testing)

### Opción A: Sin Docker (Desarrollo)

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Iniciar PostgreSQL con Docker
docker-compose up postgres -d

# 3. Ejecutar migraciones (cuando estén disponibles)
npm run migration:run

# 4. Iniciar servidor en modo desarrollo
npm run start:dev

# 5. Verificar que funciona
curl http://localhost:3000/health
```

### Opción B: Con Docker Compose (Testing Production Build)

```bash
# 1. Desde la raíz del proyecto
docker-compose up --build

# 2. Ver logs
docker-compose logs -f backend

# 3. Verificar health
curl http://localhost:3000/health

# 4. Detener todo
docker-compose down
```

### Verificación Local

```bash
# Health check
curl http://localhost:3000/health
# Debe retornar: {"status":"OK","timestamp":"..."}

# Login (requiere usuario seed)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@rapidosur.cl","password":"password123"}'
```

---

## 🌐 Deployment en Hostinger con Dokploy

### Paso 1: Configurar Base de Datos

1. **Crear PostgreSQL Database en Hostinger**
   - Accede al panel de control de Hostinger
   - Ve a "Databases" → "Create Database"
   - Nombre: `rapido_sur_prod`
   - Usuario: Crea uno nuevo con contraseña segura
   - **Guarda estas credenciales**:
     - `DB_HOST`: (ejemplo: `localhost` o IP del servidor)
     - `DB_PORT`: `5432`
     - `DB_USERNAME`: el usuario creado
     - `DB_PASSWORD`: la contraseña
     - `DB_DATABASE`: `rapido_sur_prod`

### Paso 2: Conectar GitHub a Dokploy

1. **En tu repositorio GitHub**:
   - Asegúrate de que el código está en la rama `main`
   - Verifica que `.env` está en `.gitignore`
   - El `Dockerfile` debe estar en `backend/`

2. **En Dokploy**:
   - Accede a tu panel de Dokploy
   - Click en "New Project"
   - Nombre: `rapido-sur`
   - Selecciona "GitHub" como source
   - Autoriza a Dokploy a acceder a tu repositorio
   - Selecciona el repositorio `rapido-sur`
   - Branch: `main`
   - Build context: `./backend`
   - Dockerfile path: `./Dockerfile`

### Paso 3: Configurar Variables de Entorno en Dokploy

En la sección "Environment Variables" de Dokploy, agrega:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database (usa los valores de Paso 1)
DB_HOST=tu_db_host
DB_PORT=5432
DB_USERNAME=tu_db_user
DB_PASSWORD=tu_db_password_seguro
DB_DATABASE=rapido_sur_prod

# JWT (genera con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=tu_jwt_secret_super_seguro_minimo_64_caracteres
JWT_EXPIRATION=24h

# Frontend (tu dominio de producción)
FRONTEND_URL=https://rapidosur.com

# Email SMTP (configura según tu proveedor)
# Opción 1: Gmail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password
MAIL_FROM=noreply@rapidosur.cl

# Opción 2: SendGrid
# MAIL_HOST=smtp.sendgrid.net
# MAIL_PORT=587
# MAIL_SECURE=false
# MAIL_USER=apikey
# MAIL_PASSWORD=tu_sendgrid_api_key
# MAIL_FROM=noreply@rapidosur.cl

# Alerts
MAINTENANCE_MANAGER_EMAIL=jefe@rapidosur.cl
ENABLE_CRON=true
ALERTS_CRON_SCHEDULE=0 6 * * *

# Logging
LOG_LEVEL=info

# Security
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Paso 4: Configurar Health Check en Dokploy

- **Health Check Path**: `/health`
- **Health Check Interval**: `30s`
- **Health Check Timeout**: `10s`
- **Health Check Retries**: `3`

### Paso 5: Deploy

1. Click en **"Deploy"** en Dokploy
2. Dokploy construirá la imagen Docker
3. Desplegará el contenedor
4. Esperará a que el health check pase

**Monitorear el deploy**:
```bash
# Ver logs en tiempo real desde Dokploy UI
# O via SSH:
ssh tu_usuario@tu_servidor_ip
docker logs -f rapido-sur-backend --tail 100
```

### Paso 6: Configurar Dominio y SSL

1. **En Hostinger DNS**:
   - Crea un registro A apuntando a la IP de tu VPS
   - Ejemplo: `api.rapidosur.com` → `123.456.789.0`

2. **En Dokploy**:
   - Ve a "Domains"
   - Agrega `api.rapidosur.com`
   - Habilita SSL/TLS (Let's Encrypt)
   - Dokploy configurará automáticamente el certificado

---

## 🎯 Post-Deployment

### 1. Ejecutar Migraciones

```bash
# Conectarse al contenedor
docker exec -it rapido-sur-backend sh

# Dentro del contenedor
npm run migration:run

# Salir
exit
```

### 2. (Opcional) Seed de Datos Iniciales

```bash
# Si tienes un script de seed
docker exec -it rapido-sur-backend npm run seed
```

### 3. Verificar que Todo Funciona

```bash
# Health check
curl https://api.rapidosur.com/health

# Debe retornar:
# {"status":"OK","timestamp":"2025-01-15T10:30:00.000Z"}

# Test login (requiere usuario existente)
curl -X POST https://api.rapidosur.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rapidosur.cl","password":"tu_password"}'
```

### 4. Configurar Backups Automáticos

```bash
# Crear script de backup
cat > /root/backup-rapido-sur.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec rapido-sur-db pg_dump -U postgres rapido_sur_prod > $BACKUP_DIR/rapido_sur_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/rapido_sur_$DATE.sql

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: rapido_sur_$DATE.sql.gz"
EOF

# Dar permisos
chmod +x /root/backup-rapido-sur.sh

# Programar con cron (cada día a las 3 AM)
crontab -e
# Agregar:
# 0 3 * * * /root/backup-rapido-sur.sh >> /var/log/backups.log 2>&1
```

### 5. Configurar Monitoreo

**Opción A: Usar Dokploy Built-in Monitoring**
- Dokploy tiene dashboards de uso de CPU, RAM, etc.

**Opción B: Configurar UptimeRobot (Free)**
1. Registrarse en https://uptimerobot.com
2. Crear monitor HTTP(s)
3. URL: `https://api.rapidosur.com/health`
4. Interval: 5 minutos
5. Alertas por email si falla

---

## 🐛 Troubleshooting

### El contenedor no arranca

```bash
# Ver logs detallados
docker logs rapido-sur-backend --tail 200

# Errores comunes:
# 1. Variables de entorno faltantes → Revisar en Dokploy UI
# 2. No puede conectar a DB → Verificar DB_HOST y credenciales
# 3. Puerto ya en uso → Cambiar PORT en Dokploy
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Verificar conectividad
docker exec -it rapido-sur-backend sh
ping $DB_HOST  # Debe responder

# Test de conexión directa
apk add postgresql-client
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE
```

### Health check falla

```bash
# Desde dentro del contenedor
curl http://localhost:3000/health

# Si no responde, verificar:
# 1. La aplicación está corriendo (npm run start:prod)
# 2. El puerto es correcto (3000)
# 3. No hay errores en los logs
```

### Migraciones fallan

```bash
# Ver el estado de las migraciones
docker exec -it rapido-sur-backend npm run migration:show

# Intentar revertir última migración
docker exec -it rapido-sur-backend npm run migration:revert

# Volver a ejecutar
docker exec -it rapido-sur-backend npm run migration:run
```

### Memory/CPU alto

```bash
# Ver uso de recursos
docker stats rapido-sur-backend

# Si es muy alto:
# 1. Revisar logs por posibles memory leaks
# 2. Aumentar resources en Dokploy
# 3. Considerar horizontal scaling
```

---

## 🔧 Mantenimiento

### Deploy de Nuevos Cambios

```bash
# 1. Hacer push a GitHub
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 2. Dokploy detecta el cambio automáticamente y redeploy
# O manualmente en Dokploy UI: Click "Redeploy"
```

### Ver Logs en Producción

```bash
# Últimas 100 líneas
docker logs rapido-sur-backend --tail 100

# Seguir logs en tiempo real
docker logs -f rapido-sur-backend

# Filtrar por error
docker logs rapido-sur-backend 2>&1 | grep -i error
```

### Actualizar Variables de Entorno

1. En Dokploy UI, ir a "Environment Variables"
2. Modificar la variable necesaria
3. Click "Save"
4. **Importante**: Click "Restart" para aplicar cambios

### Escalar Horizontalmente

```bash
# En Dokploy, ir a "Scale"
# Aumentar número de replicas a 2 o más
# Dokploy configurará load balancer automáticamente
```

### Restore de Backup

```bash
# 1. Detener backend
docker stop rapido-sur-backend

# 2. Restaurar backup
gunzip /root/backups/rapido_sur_20250115_030000.sql.gz
docker exec -i rapido-sur-db psql -U postgres rapido_sur_prod < /root/backups/rapido_sur_20250115_030000.sql

# 3. Reiniciar backend
docker start rapido-sur-backend
```

---

## 📞 Contacto y Soporte

- **Equipo de desarrollo**: Rubilar, Bravo, Loyola, Aguayo
- **Documentación técnica**: Ver `CLAUDE.md`
- **Repositorio**: GitHub (privado)

---

## ✅ Checklist de Deployment

Antes de dar por terminado el deployment, verifica:

- [ ] Health check responde 200 OK
- [ ] Login funciona correctamente
- [ ] Database tiene las tablas creadas
- [ ] Migraciones ejecutadas
- [ ] SSL/HTTPS configurado y funcionando
- [ ] Variables de entorno correctas en Dokploy
- [ ] Backups automáticos configurados
- [ ] Monitoreo activo (UptimeRobot o similar)
- [ ] Logs accesibles y sin errores críticos
- [ ] CORS configurado correctamente
- [ ] Emails funcionan (test de alerta)
- [ ] Cron jobs activos (verificar logs)
- [ ] Documentación actualizada

---

**¡Deployment completado! 🎉**

El backend de Rápido Sur está listo para reducir el 40% de fallos por mantenimiento atrasado.
