# ⚡ Quick Start - Rápido Sur

Guía ultra-rápida para comenzar a trabajar **AHORA**.

---

## 🎯 Lo que Necesitas Saber en 30 Segundos

**Hay 3 archivos docker-compose**:

1. `docker-compose.dev.yml` → 👨‍💻 **Desarrollo diario** (solo BD)
2. `docker-compose.full.yml` → 🧪 **Testing completo** (todo dockerizado)
3. `docker-compose.yml` → 🚀 **Producción Dokploy** (auto-deployment)

---

## 🚀 Empezar en 3 Comandos

### Primera vez (setup)

```bash
# 1. Clonar
git clone <repo-url>
cd rapido-sur

# 2. Levantar PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# 3. Iniciar backend
cd backend
npm install
npm run start:dev
```

**Ya está!** 🎉

- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050

---

## 📅 Workflow Diario

### Al comenzar el día

```bash
# Levantar BD
docker-compose -f docker-compose.dev.yml up -d

# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend (cuando exista)
cd frontend && npm run dev
```

### Al terminar el día

```bash
# Detener BD (opcional, puede quedarse corriendo)
docker-compose -f docker-compose.dev.yml down
```

---

## 🎨 Frontend (cuando lo desarrolles)

### Setup inicial

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Configuración básica (.env)

```bash
VITE_API_URL=http://localhost:3000
```

---

## 🗄️ Acceso a Base de Datos

### Opción 1: pgAdmin Web (Recomendado)

1. Abrir http://localhost:5050
2. Login: `admin@rapidosur.com` / `admin123`
3. Crear servidor:
   - Host: `postgres`
   - Port: `5432`
   - Database: `rapido_sur`
   - Username: `postgres`
   - Password: `postgres123`

### Opción 2: CLI

```bash
# Conectarse directamente
docker exec -it rapido-sur-db psql -U postgres -d rapido_sur

# Comandos útiles en psql:
\dt              # Listar tablas
\d usuarios      # Ver estructura de tabla
SELECT * FROM usuarios LIMIT 5;
\q               # Salir
```

---

## 🔍 Debugging

### Ver logs

```bash
# Logs de PostgreSQL
docker logs rapido-sur-db

# Logs del backend (si está en Docker)
docker logs rapido-sur-backend

# Logs en tiempo real
docker logs -f rapido-sur-backend
```

### Health check

```bash
curl http://localhost:3000/health
# Debe retornar: {"status":"OK","timestamp":"..."}
```

### Errores comunes

**"Port 5432 already in use"**
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

**"Cannot connect to database"**
```bash
# Esperar 10 segundos (PostgreSQL iniciando)
# O verificar logs:
docker logs rapido-sur-db
```

**Backend no levanta**
```bash
# Verificar variables de entorno
cd backend
cat .env

# Reinstalar dependencias
rm -rf node_modules
npm install
```

---

## 🧪 Testing

### Probar todo dockerizado

```bash
# Levantar stack completo
docker-compose -f docker-compose.full.yml up -d

# Ver todo corriendo
docker-compose -f docker-compose.full.yml ps

# Probar
curl http://localhost:3000/health

# Ver logs
docker-compose -f docker-compose.full.yml logs -f backend

# Detener
docker-compose -f docker-compose.full.yml down
```

---

## 🚀 Deploy a Producción

### Checklist pre-deploy

```bash
# 1. Asegurar que todo está commiteado
git status

# 2. Push a main
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 3. Dokploy detecta el push y hace deploy automático
```

### Primeras veces (solo una vez)

Ver guía completa: [DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)

---

## 📚 Documentación Completa

- **Setup completo**: [README.md](./README.md)
- **Guía Docker detallada**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- **Configuración Docker visual**: [DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)
- **Deploy a Dokploy**: [DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)
- **Memoria del proyecto**: [CLAUDE.md](./CLAUDE.md)

---

## 🆘 Necesitas Ayuda?

### Por orden de complejidad:

1. **Desarrollo local**: Ver [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
2. **Problemas con Docker**: Ver [DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)
3. **Deploy a producción**: Ver [DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)
4. **Arquitectura del proyecto**: Ver [CLAUDE.md](./CLAUDE.md)

---

## ⚙️ Comandos Útiles

```bash
# Ver servicios corriendo
docker ps

# Detener todo Docker
docker stop $(docker ps -q)

# Limpiar todo (⚠️ cuidado)
docker system prune -a

# Resetear BD (⚠️ borra datos)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Ver puertos ocupados
lsof -i :3000
lsof -i :5432

# Reiniciar backend en Docker
docker restart rapido-sur-backend
```

---

## 🎓 Tips para Nuevos Desarrolladores

1. **SIEMPRE** usa `docker-compose.dev.yml` para desarrollo diario
2. **NUNCA** commitees `.env` con credenciales reales
3. **SIEMPRE** prueba con `docker-compose.full.yml` antes de push a main
4. **NUNCA** uses `docker-compose.yml` en local (es para Dokploy)
5. **SIEMPRE** verifica el health check antes de considerar que algo funciona

---

## 🔑 Credenciales de Desarrollo

**PostgreSQL (Local)**:
- Host: `localhost`
- Port: `5432`
- Database: `rapido_sur`
- Username: `postgres`
- Password: `postgres123`

**pgAdmin (Local)**:
- URL: http://localhost:5050
- Email: `admin@rapidosur.com`
- Password: `admin123`

**Backend (Local)**:
- URL: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/health

---

**Última actualización**: Enero 2025
**Equipo**: Rubilar, Bravo, Loyola, Aguayo

---

**¿Listo para empezar?** 🚀

```bash
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run start:dev
```
