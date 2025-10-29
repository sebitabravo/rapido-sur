# 🚀 Guía de Deployment - Rápido Sur Backend

## 📋 Prerequisitos

- Servidor VPS con Docker instalado (Ubuntu 20.04+ recomendado)
- Dokploy instalado y configurado
- Base de datos PostgreSQL 15+ (puede ser en el mismo servidor o externa)
- Dominio configurado (opcional pero recomendado para HTTPS)

---

## 🐳 Deployment con Docker Compose (Desarrollo Local)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd rapido-sur/backend
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores locales
```

### 3. Iniciar servicios con Docker Compose

```bash
# Iniciar PostgreSQL, Backend y pgAdmin
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build
```

### 4. Acceder a los servicios

- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050 (admin@rapidosur.local / admin)

---

## 🌐 Deployment en Dokploy (Producción)

### Paso 1: Preparar el servidor

1. **Instalar Docker y Docker Compose** (si no está instalado):

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version
```

2. **Instalar Dokploy** (seguir documentación oficial):

```bash
# Instalar Dokploy
curl -sSL https://dokploy.com/install.sh | sh
```

3. **Acceder a Dokploy UI**:
   - Navegar a: `http://tu-servidor-ip:3000`
   - Completar setup inicial

### Paso 2: Configurar proyecto en Dokploy

1. **Crear nuevo proyecto**:
   - Name: `rapido-sur-backend`
   - Type: `Docker Compose`

2. **Conectar repositorio Git**:
   - URL: `<tu-repository-url>`
   - Branch: `main`
   - Path to docker-compose: `backend/docker-compose.prod.yml`

3. **Configurar variables de entorno** (CRÍTICO):

```env
NODE_ENV=production
PORT=3000

# Database (usar base de datos externa o servicio Dokploy)
DB_HOST=<tu-db-host>
DB_PORT=5432
DB_USERNAME=<tu-db-username>
DB_PASSWORD=<tu-db-password-seguro>
DB_DATABASE=rapido_sur_prod

# JWT Secret (CRÍTICO - generar uno nuevo)
JWT_SECRET=<generar-con-comando-abajo>
JWT_EXPIRATION=24h

# Frontend URL (tu dominio de producción)
FRONTEND_URL=https://rapidosur.com

# SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=<tu-email@gmail.com>
MAIL_PASSWORD=<app-specific-password>
MAIL_FROM=noreply@rapidosur.cl

# Maintenance Manager Email
MAINTENANCE_MANAGER_EMAIL=jefe.mantenimiento@rapidosur.cl

# Cron Jobs
ENABLE_CRON=true
ALERTS_CRON_SCHEDULE=0 6 * * *

# Logging
LOG_LEVEL=info

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

**Generar JWT Secret seguro**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 3: Configurar dominio y SSL

1. **En tu proveedor de DNS** (donde compraste el dominio):
   - Crear registro A: `api.rapidosur.com` → `IP-de-tu-servidor`
   - Esperar propagación DNS (1-24 horas)

2. **En Dokploy**:
   - Ir a Settings → Domains
   - Agregar: `api.rapidosur.com`
   - Habilitar SSL/TLS automático (Let's Encrypt)

### Paso 4: Deploy

1. **En Dokploy UI**:
   - Click en "Deploy"
   - Esperar a que termine el build (5-10 minutos)
   - Verificar logs en tiempo real

2. **Verificar deployment**:

```bash
# Health check
curl https://api.rapidosur.com/health

# Debería retornar:
# {"status":"OK","timestamp":"2025-01-15T10:30:00.000Z"}
```

### Paso 5: Ejecutar migraciones (si aplica)

```bash
# Conectar al contenedor
docker exec -it rapido-sur-backend-prod sh

# Ejecutar migraciones
npm run migration:run

# Salir del contenedor
exit
```

---

## 🔧 Comandos Útiles de Docker

### Local Development

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de backend
docker-compose logs -f backend

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Entrar al contenedor backend
docker exec -it rapido-sur-backend sh

# Entrar a PostgreSQL
docker exec -it rapido-sur-db psql -U postgres -d rapido_sur_dev

# Detener todo
docker-compose down

# Eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# Reconstruir desde cero
docker-compose down && docker-compose up -d --build
```

### Production (Dokploy)

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de producción
docker logs -f rapido-sur-backend-prod

# Entrar al contenedor
docker exec -it rapido-sur-backend-prod sh

# Reiniciar contenedor
docker restart rapido-sur-backend-prod

# Ver uso de recursos
docker stats rapido-sur-backend-prod
```

---

## 🔍 Troubleshooting

### Problema: El contenedor no inicia

**Solución**:
```bash
# Ver logs completos
docker logs rapido-sur-backend-prod

# Verificar variables de entorno
docker exec rapido-sur-backend-prod env

# Verificar health check
docker inspect rapido-sur-backend-prod | grep -A 10 Health
```

### Problema: No puede conectar a la base de datos

**Verificar**:
1. DB_HOST es correcto (nombre del servicio Docker o IP externa)
2. PostgreSQL está corriendo: `docker ps | grep postgres`
3. Credenciales son correctas
4. Red Docker está configurada correctamente

**Solución**:
```bash
# Probar conexión desde el contenedor
docker exec -it rapido-sur-backend-prod sh
apk add postgresql-client
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE
```

### Problema: Health check falla

**Verificar**:
```bash
# Probar health check manualmente
curl http://localhost:3000/health

# Ver logs del contenedor
docker logs rapido-sur-backend-prod --tail 100
```

### Problema: Emails no se envían

**Verificar**:
1. MAIL_USER y MAIL_PASSWORD son correctos
2. Si usas Gmail, usa App-Specific Password
3. MAIL_HOST y MAIL_PORT son correctos
4. Firewall permite conexiones salientes al puerto SMTP

---

## 📊 Monitoreo

### Health Checks

```bash
# Health check básico
curl https://api.rapidosur.com/health

# Con detalles
curl -v https://api.rapidosur.com/health
```

### Logs

```bash
# Ver últimos 100 logs
docker logs rapido-sur-backend-prod --tail 100

# Seguir logs en tiempo real
docker logs -f rapido-sur-backend-prod

# Filtrar por nivel
docker logs rapido-sur-backend-prod | grep ERROR
docker logs rapido-sur-backend-prod | grep WARN
```

### Métricas

```bash
# Uso de recursos
docker stats rapido-sur-backend-prod

# Información del contenedor
docker inspect rapido-sur-backend-prod
```

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] JWT_SECRET es único y seguro (min 64 caracteres)
- [ ] DB_PASSWORD es fuerte (min 16 caracteres)
- [ ] NODE_ENV=production
- [ ] ENABLE_CRON=true
- [ ] Firewall configurado (solo puertos 80, 443, 22)
- [ ] SSL/TLS habilitado (HTTPS)
- [ ] Backups de base de datos configurados
- [ ] Rate limiting activado
- [ ] Logs con rotación configurada
- [ ] Variables de entorno nunca en código fuente
- [ ] .env nunca commiteado a Git

### Backups

```bash
# Backup manual de PostgreSQL
docker exec rapido-sur-db pg_dump -U postgres rapido_sur_prod > backup-$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i rapido-sur-db psql -U postgres rapido_sur_prod < backup-20250115.sql
```

---

## 🔄 Actualizar Deployment

### Con Dokploy (Recomendado)

1. Push cambios a Git (branch main)
2. En Dokploy UI, click "Redeploy"
3. Esperar build y deploy automático

### Manual

```bash
# Pull últimos cambios
git pull origin main

# Rebuild contenedor
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar
curl https://api.rapidosur.com/health
```

---

## 📞 Soporte

**Documentación del proyecto**: Ver README.md y CLAUDE.md

**Logs de errores**: Revisar logs con `docker logs`

**Health check**: Siempre disponible en `/health`

---

**¡Deployment completado! 🎉**
