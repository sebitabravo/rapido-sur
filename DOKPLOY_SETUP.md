# 🚀 Guía de Deploy en Dokploy

Esta guía te llevará paso a paso para desplegar Rápido Sur en tu servidor Hostinger usando Dokploy.

## 📋 Pre-requisitos

- [ ] Servidor VPS en Hostinger con Ubuntu 20.04 o superior
- [ ] Docker y docker-compose instalados
- [ ] Dokploy instalado ([ver documentación oficial](https://docs.dokploy.com))
- [ ] Dominio configurado (opcional, para SSL)
- [ ] Repositorio GitHub con acceso

## 🔐 Paso 1: Acceso Inicial

### Conectarse al servidor

```bash
ssh root@tu-ip-servidor
```

### Verificar Dokploy

```bash
# Verificar que Dokploy está corriendo
docker ps | grep dokploy

# Acceder a Dokploy UI
# http://tu-ip-servidor:3000
# o https://tu-dominio.com (si configuraste DNS)
```

---

## 🗄️ Paso 2: Crear Base de Datos PostgreSQL

1. **En Dokploy UI**, ir a: `Databases` → `Create Database`

2. **Configurar PostgreSQL**:
   ```
   Nombre: rapido-sur-postgres
   Tipo: PostgreSQL
   Versión: 15
   ```

3. **Credenciales** (genera contraseñas seguras):
   ```
   POSTGRES_USER: rapidosur_admin
   POSTGRES_PASSWORD: [contraseña-segura-generada]
   POSTGRES_DB: rapido_sur
   ```

4. **Recursos sugeridos**:
   ```
   CPU: 0.5 cores
   Memoria: 512 MB
   Storage: 5 GB
   ```

5. **Guardar y desplegar** PostgreSQL

6. **Anotar el nombre del servicio interno**: `rapido-sur-postgres` (será el DB_HOST)

---

## 🔴 Paso 3: Desplegar Backend

### 3.1. Crear Aplicación

1. **En Dokploy UI**, ir a: `Applications` → `Create Application`

2. **Configuración General**:
   ```
   Nombre: rapido-sur-backend
   Tipo: Docker Compose
   ```

3. **Conectar Repositorio**:
   ```
   Git Provider: GitHub
   Repository: tu-usuario/rapido-sur
   Branch: main
   ```

4. **Build Settings**:
   ```
   Compose File: docker-compose.yml
   ```

### 3.2. Configurar Variables de Entorno

En la pestaña `Environment Variables`, agregar:

```bash
# ================================
# Application Settings
# ================================
NODE_ENV=production
PORT=3000

# ================================
# Database Connection
# IMPORTANTE: DB_HOST debe ser el nombre del servicio PostgreSQL en Dokploy
# ================================
DB_HOST=rapido-sur-postgres
DB_PORT=5432
DB_USERNAME=rapidosur_admin
DB_PASSWORD=[tu-contraseña-postgres-segura]
DB_DATABASE=rapido_sur

# ================================
# JWT Authentication
# IMPORTANTE: Generar un secreto largo y aleatorio
# Puedes usar: openssl rand -base64 64
# ================================
JWT_SECRET=[generar-secreto-largo-y-aleatorio-min-32-caracteres]
JWT_EXPIRATION=24h

# ================================
# CORS Configuration
# ================================
FRONTEND_URL=https://rapidosur.com
# O si aún no tienes dominio:
# FRONTEND_URL=http://tu-ip-servidor:5173

# ================================
# Email Configuration
# Usar Gmail con App Password o SendGrid
# ================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=[tu-app-password-de-gmail]
MAIL_FROM=noreply@rapidosur.cl

# ================================
# Maintenance Alerts
# ================================
MAINTENANCE_MANAGER_EMAIL=jefe.mantenimiento@rapidosur.cl
ENABLE_CRON=true
ALERTS_CRON_SCHEDULE=0 6 * * *

# ================================
# Logging & Monitoring
# ================================
LOG_LEVEL=info

# ================================
# Rate Limiting
# ================================
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

### 3.3. Configurar Networking

1. **Puerto expuesto**: `3000`
2. **Dominio** (opcional):
   ```
   api.rapidosur.com → puerto 3000
   ```
3. **SSL**: Habilitar Let's Encrypt (automático si tienes dominio)

### 3.4. Deploy

1. Hacer clic en `Deploy`
2. Esperar a que termine el build (puede tomar 3-5 minutos)
3. Verificar logs en tiempo real

---

## ⚛️ Paso 4: Desplegar Frontend (cuando lo desarrolles)

### 4.1. Crear Aplicación Frontend

1. **En Dokploy UI**, ir a: `Applications` → `Create Application`

2. **Configuración General**:
   ```
   Nombre: rapido-sur-frontend
   Tipo: Docker Compose
   ```

3. **Conectar Repositorio**:
   ```
   Repository: tu-usuario/rapido-sur
   Branch: main
   Build Context: ./frontend
   ```

### 4.2. Variables de Entorno Frontend

```bash
VITE_API_URL=https://api.rapidosur.com
# O si no tienes dominio:
# VITE_API_URL=http://tu-ip-servidor:3000
```

### 4.3. Configurar Networking

1. **Puerto expuesto**: `80` (nginx)
2. **Dominio**:
   ```
   rapidosur.com → puerto 80
   www.rapidosur.com → puerto 80
   ```
3. **SSL**: Habilitar Let's Encrypt

---

## 🔍 Paso 5: Verificación

### 5.1. Verificar Backend

```bash
# Health check
curl https://api.rapidosur.com/health

# O con IP directa
curl http://tu-ip-servidor:3000/health

# Respuesta esperada:
{"status":"OK","timestamp":"2025-01-15T..."}
```

### 5.2. Verificar Swagger Docs

```bash
# Abrir en navegador
https://api.rapidosur.com/api/docs
```

### 5.3. Verificar Base de Datos

```bash
# Desde Dokploy UI: ir a PostgreSQL → Logs
# Debe mostrar: "database system is ready to accept connections"
```

### 5.4. Verificar Logs del Backend

```bash
# En Dokploy UI: rapido-sur-backend → Logs
# Buscar líneas como:
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
🌍 Environment: production
🗄️  Database: rapido-sur-postgres:5432/rapido_sur
```

---

## 🔄 Paso 6: Configurar Auto-Deploy

1. **En GitHub**, ir a: `Settings` → `Webhooks`

2. **Dokploy proporciona un webhook URL**:
   ```
   https://tu-dokploy.com/webhooks/[tu-id]
   ```

3. **Configurar webhook**:
   - **Payload URL**: URL de Dokploy
   - **Content type**: `application/json`
   - **Events**: `Just the push event`

4. **Probar**: Hacer un push a `main` → Deploy automático

---

## 📊 Paso 7: Monitoreo Inicial

### Verificar recursos

```bash
# CPU y memoria en Dokploy UI
Monitoring → rapido-sur-backend → Metrics
```

### Verificar health checks

```bash
# En Dokploy UI: Health Checks
# Debe mostrar "healthy" en verde
```

### Revisar logs

```bash
# Logs en tiempo real en Dokploy UI
Applications → rapido-sur-backend → Logs → Enable Live Logs
```

---

## 🔐 Paso 8: Seguridad Post-Deploy

### Firewall

```bash
# Permitir solo puertos necesarios
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### SSH Key-based Authentication

```bash
# Deshabilitar password login en SSH
nano /etc/ssh/sshd_config
# Cambiar: PasswordAuthentication no
systemctl restart sshd
```

### Rate Limiting

Ya configurado en el backend con:
```bash
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

### Actualizar paquetes del servidor

```bash
apt update && apt upgrade -y
```

---

## 🗂️ Paso 9: Backups

### 9.1. Backup Automático de PostgreSQL

Crear script de backup:

```bash
# En el servidor
nano /root/backup-postgres.sh
```

Contenido:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
CONTAINER_NAME="rapido-sur-postgres"
DB_NAME="rapido_sur"

mkdir -p $BACKUP_DIR

# Crear backup
docker exec $CONTAINER_NAME pg_dump -U rapidosur_admin $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/backup_$DATE.sql

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

Hacer ejecutable y agregar a crontab:

```bash
chmod +x /root/backup-postgres.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
0 2 * * * /root/backup-postgres.sh
```

### 9.2. Backup Remoto (opcional)

Usar rclone para subir a Google Drive o Dropbox:

```bash
# Instalar rclone
curl https://rclone.org/install.sh | bash

# Configurar
rclone config

# Sincronizar backups
rclone sync /root/backups gdrive:backups-rapidosur
```

---

## 🚨 Troubleshooting

### Backend no levanta

```bash
# Ver logs completos
docker logs rapido-sur-backend

# Errores comunes:
# 1. DB_HOST incorrecto → Verificar nombre del servicio PostgreSQL
# 2. DB_PASSWORD incorrecto → Verificar variables de entorno
# 3. Puerto en uso → Cambiar PORT en variables
```

### No conecta a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Verificar logs de PostgreSQL
docker logs rapido-sur-postgres

# Verificar red de Docker
docker network ls
docker network inspect [nombre-red-dokploy]
```

### SSL no funciona

```bash
# Verificar que el dominio apunta al servidor
nslookup api.rapidosur.com

# Verificar configuración de Dokploy
# En UI: rapido-sur-backend → Domains → SSL Status
```

### Cron jobs no ejecutan

```bash
# Verificar que ENABLE_CRON=true
# Ver logs del backend buscando "Cron" o "Alerts"
docker logs rapido-sur-backend | grep -i cron
```

---

## ✅ Checklist Final

Antes de considerar el deploy exitoso:

- [ ] Backend responde en /health
- [ ] Swagger docs accesible en /api/docs
- [ ] PostgreSQL conectado correctamente
- [ ] SSL configurado (si tienes dominio)
- [ ] Auto-deploy desde GitHub funciona
- [ ] Logs no muestran errores críticos
- [ ] Health checks en verde
- [ ] Backups automáticos configurados
- [ ] Firewall configurado
- [ ] Variables de entorno todas configuradas
- [ ] Email de prueba funciona
- [ ] Cron jobs configurados

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs en Dokploy UI
2. Consultar [documentación de Dokploy](https://docs.dokploy.com)
3. Verificar [issues de GitHub](https://github.com/dokploy/dokploy/issues)
4. Contactar al equipo de desarrollo

---

**Última actualización**: Enero 2025
**Equipo**: Rubilar, Bravo, Loyola, Aguayo
