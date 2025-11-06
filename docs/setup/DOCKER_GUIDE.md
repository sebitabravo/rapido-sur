# 🐋 Guía de Docker para Rápido Sur

Esta guía explica cómo usar los diferentes archivos docker-compose según tu entorno.

## 📂 Estructura de Archivos Docker

```
rapido-sur/
├── docker-compose.yml           # ✅ Para PRODUCCIÓN (Dokploy)
├── docker-compose.dev.yml       # 🔧 Para desarrollo (solo PostgreSQL)
├── docker-compose.full.yml      # 🚀 Stack completo (PostgreSQL + Backend + Frontend)
└── backend/
    ├── Dockerfile               # Multi-stage: builder + production
    ├── .dockerignore            # Excluye archivos innecesarios
    └── .env.example             # Template de variables de entorno
```

---

## 🎯 Casos de Uso

### 1️⃣ Desarrollo Local del Backend (Recomendado)

**Escenario**: Estás desarrollando el backend en tu máquina local.

```bash
# Levanta solo PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Tu backend corre en tu máquina (npm run start:dev)
cd backend
npm install
npm run start:dev
```

**Ventajas**:
- Hot reload instantáneo
- Debugging con breakpoints
- Logs en tiempo real
- Acceso directo a node_modules

**Puertos**:
- PostgreSQL: `localhost:5432`
- Backend: `localhost:3000` (en tu máquina)
- pgAdmin: `http://localhost:5050`

---

### 2️⃣ Stack Completo Dockerizado

**Escenario**: Quieres probar todo el sistema dockerizado (backend + frontend + BD).

```bash
# Levanta todo el stack
docker-compose -f docker-compose.full.yml up -d

# Ver logs
docker-compose -f docker-compose.full.yml logs -f backend

# Detener todo
docker-compose -f docker-compose.full.yml down
```

**Puertos**:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (cuando lo desarrolles)
- pgAdmin: `http://localhost:5050`
- PostgreSQL: `localhost:5432`

**Nota**: El frontend está comentado en el archivo. Descomentar cuando lo desarrolles.

---

### 3️⃣ Producción con Dokploy

**Escenario**: Deployment en servidor Hostinger con Dokploy.

```bash
# Dokploy usa automáticamente: docker-compose.yml
# NO necesitas ejecutar comandos manualmente
```

**Configuración en Dokploy**:

1. **Conectar repositorio GitHub**
2. **Crear PostgreSQL** como servicio separado en Dokploy UI
3. **Configurar variables de entorno** en Dokploy UI:
   ```
   DB_HOST=<nombre-servicio-postgres-en-dokploy>
   DB_PORT=5432
   DB_USERNAME=<usuario>
   DB_PASSWORD=<contraseña-segura>
   DB_DATABASE=rapido_sur
   JWT_SECRET=<secreto-produccion-largo-y-aleatorio>
   JWT_EXPIRATION=24h
   FRONTEND_URL=https://rapidosur.com
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=<email-real>
   MAIL_PASSWORD=<contraseña-app>
   MAINTENANCE_MANAGER_EMAIL=<email-jefe-mantenimiento>
   ENABLE_CRON=true
   LOG_LEVEL=info
   ```
4. **Habilitar auto-deploy** en push a branch `main`
5. **Configurar SSL** con Let's Encrypt (automático en Dokploy)

**Importante**:
- El `docker-compose.yml` en la raíz solo contiene el backend
- PostgreSQL se maneja como servicio separado en Dokploy
- Frontend se despliega como aplicación separada

---

## 🔍 Comandos Útiles

### Ver servicios corriendo
```bash
# Para desarrollo
docker-compose -f docker-compose.dev.yml ps

# Para stack completo
docker-compose -f docker-compose.full.yml ps
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose -f docker-compose.full.yml logs -f

# Solo backend
docker-compose -f docker-compose.full.yml logs -f backend

# Solo PostgreSQL
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Ejecutar comandos dentro del contenedor
```bash
# Shell interactivo en backend
docker exec -it rapido-sur-backend sh

# Ver base de datos desde CLI
docker exec -it rapido-sur-db psql -U postgres -d rapido_sur
```

### Reconstruir imágenes
```bash
# Reconstruir backend (después de cambios en Dockerfile)
docker-compose -f docker-compose.full.yml build backend

# Reconstruir todo
docker-compose -f docker-compose.full.yml build --no-cache
```

### Limpiar todo (⚠️ Cuidado: borra volúmenes)
```bash
# Detener y eliminar contenedores
docker-compose -f docker-compose.full.yml down

# Detener y eliminar contenedores + volúmenes (⚠️ BORRA LA BD)
docker-compose -f docker-compose.full.yml down -v
```

---

## 🗄️ Gestión de Base de Datos

### Acceder a pgAdmin

1. Abre `http://localhost:5050`
2. Login:
   - Email: `admin@rapidosur.com`
   - Password: `admin123`
3. Crear nueva conexión al servidor:
   - Host: `postgres` (nombre del servicio Docker)
   - Port: `5432`
   - Database: `rapido_sur`
   - Username: `postgres`
   - Password: `postgres123`

### Backup y Restore

```bash
# Crear backup
docker exec rapido-sur-db pg_dump -U postgres rapido_sur > backup.sql

# Restaurar backup
cat backup.sql | docker exec -i rapido-sur-db psql -U postgres -d rapido_sur
```

---

## 🛠️ Troubleshooting

### Error: "Port already in use"
```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000

# O matar todos los procesos Node
killall node
```

### Error: "Database connection refused"
```bash
# Verificar que PostgreSQL está corriendo
docker-compose -f docker-compose.dev.yml ps

# Reiniciar PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres

# Ver logs de PostgreSQL
docker-compose -f docker-compose.dev.yml logs postgres
```

### Error: "Health check failed"
```bash
# Verificar que el endpoint /health responde
curl http://localhost:3000/health

# Si no responde, ver logs del backend
docker logs rapido-sur-backend
```

### Resetear todo (último recurso)
```bash
# Detener todo
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.dev.yml down -v

# Limpiar volúmenes huérfanos
docker volume prune

# Limpiar imágenes no usadas
docker image prune -a

# Levantar de nuevo
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📊 Health Checks

Todos los servicios implementan health checks:

### Backend
- **Endpoint**: `GET /health`
- **Respuesta esperada**: `{"status":"OK","timestamp":"..."}`
- **Intervalo**: cada 30 segundos

### PostgreSQL
- **Test**: `pg_isready -U postgres`
- **Intervalo**: cada 10 segundos

### Verificar estado
```bash
# Ver estado de salud de todos los servicios
docker-compose -f docker-compose.full.yml ps

# Healthy = ✅
# Starting = 🔄 (esperando a que pase el start_period)
# Unhealthy = ❌
```

---

## 🚀 Workflow de Desarrollo Recomendado

### Para el Backend

1. **Levantar solo PostgreSQL**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Correr backend en tu máquina**:
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Desarrollar normalmente** con hot reload

4. **Al terminar el día**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Para el Frontend (cuando lo desarrolles)

1. **Opción A - Sin Docker**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Opción B - Con Docker**:
   - Descomentar sección frontend en `docker-compose.full.yml`
   - Crear `frontend/Dockerfile`
   - Levantar: `docker-compose -f docker-compose.full.yml up -d`

---

## 📝 Checklist Pre-Deploy a Dokploy

Antes de hacer push a producción:

- [ ] Variables de entorno configuradas en Dokploy UI
- [ ] JWT_SECRET diferente al de desarrollo
- [ ] ENABLE_CRON=true en producción
- [ ] LOG_LEVEL=info (no debug)
- [ ] PostgreSQL creado como servicio separado en Dokploy
- [ ] DB_HOST apunta al servicio PostgreSQL de Dokploy
- [ ] FRONTEND_URL apunta al dominio real (https://...)
- [ ] MAIL_* configurado con credenciales reales
- [ ] SSL configurado en Dokploy (Let's Encrypt)
- [ ] Health checks funcionando
- [ ] docker-compose.yml en la raíz del repositorio

---

## 🎓 Recursos Adicionales

- [Documentación oficial de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de Dokploy](https://docs.dokploy.com)
- [NestJS con Docker](https://docs.nestjs.com/recipes/docker)
- [PostgreSQL en Docker](https://hub.docker.com/_/postgres)

---

**Última actualización**: Enero 2025
**Equipo**: Rubilar, Bravo, Loyola, Aguayo
