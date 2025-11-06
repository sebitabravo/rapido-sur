# 🎯 Resumen Rápido: Configuración Docker

## 📊 Tres Configuraciones, Tres Casos de Uso

### 🔧 Opción 1: Desarrollo Local (Recomendada)

**Archivo**: `docker-compose.dev.yml`

```bash
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run start:dev
```

**¿Qué levanta?**
```
┌─────────────────────────────────────────┐
│  🐘 PostgreSQL:5432                     │
│  🔧 pgAdmin:5050                        │
└─────────────────────────────────────────┘

💻 Backend corre en TU MÁQUINA (hot reload)
💻 Frontend corre en TU MÁQUINA (hot reload)
```

**✅ Ventajas**:
- Hot reload instantáneo
- Debugging con breakpoints
- Acceso directo a node_modules
- Mayor velocidad de desarrollo

---

### 🚀 Opción 2: Stack Completo Dockerizado

**Archivo**: `docker-compose.full.yml`

```bash
docker-compose -f docker-compose.full.yml up -d
```

**¿Qué levanta?**
```
┌─────────────────────────────────────────┐
│  🐘 PostgreSQL:5432                     │
│  🔧 pgAdmin:5050                        │
│  🔴 Backend:3000 (dockerizado)         │
│  ⚛️  Frontend:5173 (dockerizado)       │
└─────────────────────────────────────────┘
```

**✅ Cuándo usar**:
- Probar el sistema completo dockerizado
- Simular el ambiente de producción
- Testear integraciones
- Antes de hacer deploy

---

### 🌐 Opción 3: Producción (Dokploy)

**Archivo**: `docker-compose.yml`

```bash
# Dokploy lo usa automáticamente
# NO ejecutar manualmente
```

**¿Qué levanta?**
```
┌─────────────────────────────────────────┐
│  🔴 Backend:3000 (dockerizado)         │
└─────────────────────────────────────────┘

🐘 PostgreSQL: Servicio SEPARADO en Dokploy
⚛️  Frontend: Aplicación SEPARADA en Dokploy
```

**✅ Características**:
- Solo backend en docker-compose
- PostgreSQL manejado por Dokploy
- Frontend como app separada
- SSL automático con Let's Encrypt
- Variables de entorno desde Dokploy UI

---

## 🗺️ Mapa Mental de Decisión

```
┌─────────────────────────────────────────────┐
│ ¿Qué necesitas hacer?                       │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       v                v
┌──────────────┐  ┌─────────────────────┐
│ DESARROLLAR  │  │ DEPLOY A PRODUCCIÓN │
└──────┬───────┘  └──────────┬──────────┘
       │                     │
       v                     v
┌──────────────────┐   ┌────────────────────┐
│ Opción 1 o 2?    │   │ docker-compose.yml │
└──────┬───────────┘   │ + Dokploy UI       │
       │               └────────────────────┘
       v
┌─────────────────────────────────────────┐
│ ¿Backend solo o todo el stack?          │
└──────┬──────────────────────┬───────────┘
       v                      v
┌──────────────────┐   ┌────────────────────┐
│ BACKEND SOLO     │   │ TODO DOCKERIZADO   │
│ (Opción 1)       │   │ (Opción 2)         │
│                  │   │                    │
│ dev.yml          │   │ full.yml           │
│ + npm start:dev  │   │                    │
└──────────────────┘   └────────────────────┘
```

---

## 📋 Comandos Esenciales

### Desarrollo día a día (Opción 1)

```bash
# Iniciar la BD
docker-compose -f docker-compose.dev.yml up -d

# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend (cuando lo desarrolles)
cd frontend
npm run dev

# Al terminar el día
docker-compose -f docker-compose.dev.yml down
```

### Testing completo dockerizado (Opción 2)

```bash
# Levantar todo
docker-compose -f docker-compose.full.yml up -d

# Ver logs
docker-compose -f docker-compose.full.yml logs -f

# Detener
docker-compose -f docker-compose.full.yml down
```

### Deploy a producción (Opción 3)

```bash
# 1. Configurar en Dokploy UI:
#    - Conectar repo GitHub
#    - Crear PostgreSQL como servicio
#    - Configurar variables de entorno
#    - Habilitar auto-deploy

# 2. Push a main
git push origin main

# 3. Dokploy hace el deploy automáticamente
```

---

## 🔍 Verificación Rápida

### ¿El backend está funcionando?

```bash
# Health check
curl http://localhost:3000/health

# Respuesta esperada:
{"status":"OK","timestamp":"2025-01-15T..."}
```

### ¿PostgreSQL está corriendo?

```bash
# Opción A: Con Docker
docker ps | grep postgres

# Opción B: Conexión directa
psql -h localhost -U postgres -d rapido_sur
```

### ¿Todos los servicios están healthy?

```bash
docker-compose -f docker-compose.full.yml ps

# Busca:
# healthy = ✅
# unhealthy = ❌
```

---

## 🎓 Tips para el Equipo

### Para Desarrolladores de Backend
```bash
# Usa SIEMPRE docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run start:dev
```

### Para Desarrolladores de Frontend
```bash
# Levanta la BD
docker-compose -f docker-compose.dev.yml up -d

# Backend puede correr dockerizado o en tu máquina
cd frontend && npm run dev
```

### Para QA/Testing
```bash
# Usa docker-compose.full.yml para probar todo junto
docker-compose -f docker-compose.full.yml up -d
```

### Para DevOps/Deploy
```bash
# Asegúrate de que docker-compose.yml esté en la raíz
# Dokploy lo detectará automáticamente
```

---

## ⚠️ Errores Comunes y Soluciones

### "Port 5432 already in use"
```bash
# Detén la instancia anterior
docker-compose -f docker-compose.dev.yml down

# O mata el proceso
lsof -i :5432
kill -9 <PID>
```

### "Cannot connect to database"
```bash
# Verifica que PostgreSQL está corriendo
docker ps | grep postgres

# Revisa los logs
docker logs rapido-sur-db
```

### "Health check failed"
```bash
# Verifica el endpoint
curl http://localhost:3000/health

# Si falla, revisa logs del backend
docker logs rapido-sur-backend
```

---

## 📚 Recursos

- **Guía completa**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- **Documentación principal**: [README.md](./README.md)
- **Memoria del proyecto**: [CLAUDE.md](./CLAUDE.md)

---

**Última actualización**: Enero 2025
**Equipo**: Rubilar, Bravo, Loyola, Aguayo
