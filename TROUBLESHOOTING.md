# 🔧 Troubleshooting - Guía de Errores Comunes

Soluciones a los errores más frecuentes en Rápido Sur.

## ⚡ Quick Links

- [Errores de Desarrollo](#errores-de-desarrollo)
- [Errores de Base de Datos](#errores-de-base-de-datos)
- [Errores de Deployment](#errores-de-deployment)
- [Errores de Docker](#errores-de-docker)

---

## 🔴 Errores de Desarrollo

### "Port 3000 is already in use"

**Causa:** Otro proceso usa el puerto.

**Solución:**
```bash
# Opción 1: Matar el proceso en el puerto 3000
lsof -i :3000
kill -9 <PID>

# Opción 2: Usar otro puerto
BACKEND_PORT=3001 npm run dev

# Opción 3: Detener Docker
docker-compose down
```

---

### "Cannot find module @nestjs/common"

**Causa:** Dependencias no instaladas.

**Solución:**
```bash
cd backend
npm install
npm run start:dev
```

---

### "NEXT_PUBLIC_API_URL is not defined"

**Causa:** Falta variable de entorno en frontend.

**Solución:**

Crea `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Reinicia el frontend:
```bash
cd frontend
npm run dev
```

---

### "fetch failed" en el frontend (404 o 500)

**Causa:** Backend no responde en la URL esperada.

**Solución:**

1. Verifica que backend está corriendo:
```bash
curl http://localhost:3000/health
```

2. Verifica `NEXT_PUBLIC_API_URL` en frontend:
   - Debe ser: `http://localhost:3000/api`
   - NO: `http://localhost:3000`

3. Reinicia frontend:
```bash
cd frontend
npm run dev
```

---

### "SyntaxError: Unexpected token"

**Causa:** Archivo TypeScript no compilado o corrupto.

**Solución:**
```bash
# Limpiar builds
npm run clean

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Reintentar
npm run dev
```

---

## 🗄️ Errores de Base de Datos

### "connect ECONNREFUSED 127.0.0.1:5432"

**Causa:** PostgreSQL no está corriendo.

**Solución:**
```bash
# Levantar solo la BD
npm run db:start

# O en la raíz
docker-compose up -d postgres

# Espera 5 segundos y verifica
docker-compose logs postgres
```

---

### "password authentication failed for user postgres"

**Causa:** `DB_PASSWORD` en `.env` es incorrecto.

**Solución:**

1. Verifica que `.env` existe:
```bash
cd backend
ls -la .env
cat .env | grep DB_PASSWORD
```

2. Verifica que la password en `docker-compose.yml` coincide:
```bash
docker-compose logs postgres | grep password
```

3. Si no coinciden, para todo y limpia:
```bash
docker-compose down -v  # ⚠️ BORRA DATOS
docker-compose up -d postgres
```

---

### "relation 'usuario' does not exist"

**Causa:** Migraciones no se ejecutaron.

**Solución:**

Las migraciones corren automáticamente. Si no:

```bash
cd backend

# Verificar que TypeORM detecta migraciones
npm run typeorm migration:show

# Ejecutar manualmente
npm run typeorm migration:run
```

---

### "column 'estado' of relation 'orden_trabajo' does not exist"

**Causa:** Migraciones incompletas o BD corrupta.

**Solución:**

```bash
# Opción 1: Resetear BD completamente (⚠️ pierde datos)
docker-compose down -v
docker-compose up -d postgres
npm run start:dev  # Las migraciones corren automáticamente

# Opción 2: Ejecutar migraciones manualmente
cd backend
npm run typeorm migration:run
```

---

## 🚀 Errores de Deployment

### "JWT_SECRET is insecure in production environment"

**Causa:** JWT_SECRET en producción es muy corto o contiene "dev_".

**Solución:**

```bash
cd backend
npm run secrets:generate
```

Copia el JWT_SECRET (128 caracteres) a Dokploy y re-deploy.

---

### "Missing required environment variables: DB_PASSWORD"

**Causa:** Variables de entorno no están configuradas en Dokploy.

**Solución:**

1. En Dokploy → Environment Variables
2. Verifica que TODAS estas están presentes:
   - `NODE_ENV=production`
   - `JWT_SECRET=<valor>`
   - `DB_PASSWORD=<valor>`
   - `FRONTEND_URL=<valor>`
   - `NEXT_PUBLIC_API_URL=<valor>`
   - `MAIL_USER=<valor>`
   - `MAIL_PASSWORD=<valor>`

3. Re-deploy

---

### "Frontend no conecta al backend en producción"

**Causa:** `NEXT_PUBLIC_API_URL` apunta a dirección incorrecta.

**Solución:**

En Dokploy, verifica:
```bash
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
#                                            ^^^^ DEBE incluir /api
```

No debe ser:
```bash
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

Re-deploy después.

---

### "Backend arranca pero no responde"

**Causa:** BD en Docker no está lista aún.

**Solución:**

Dokploy debería esperar. Si no:

1. En Dokploy → Ver logs de postgres
2. Espera mensaje: "database system is ready"
3. Luego re-deploy backend

---

## 🐋 Errores de Docker

### "Docker daemon is not running"

**Causa:** Docker Desktop está cerrado.

**Solución:**

- **macOS:** Abre Docker.app desde Applications
- **Linux:** `sudo systemctl start docker`
- **Windows:** Abre Docker Desktop

---

### "ERROR: could not find an image with reference 'rapido-sur-db'"

**Causa:** Imagen de Docker no existe o nombre incorrecto.

**Solución:**
```bash
# Ver imágenes disponibles
docker images | grep rapido

# Reconstruir imagen
docker-compose build postgres

# Levantar
docker-compose up -d postgres
```

---

### "docker-compose: command not found"

**Causa:** Docker Compose no está instalado.

**Solución:**

```bash
# macOS / Linux
docker-compose --version

# Si no existe, instala
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

---

### "Error response from daemon: Conflict. The container name is already in use"

**Causa:** Contenedor con ese nombre ya existe pero está detenido.

**Solución:**
```bash
# Ver todos los contenedores (incluso los detenidos)
docker ps -a

# Remover el contenedor
docker rm <container_name>

# O remover todo (⚠️ borra datos)
docker-compose down -v
docker-compose up -d
```

---

### "No space left on device"

**Causa:** Docker está usando mucho espacio (logs, imágenes, volúmenes).

**Solución:**
```bash
# Ver uso de espacio
docker system df

# Limpiar todo (⚠️ borra datos sin commitear)
docker system prune -a --volumes
```

---

## 📧 Errores de Email

### "MAIL_PASSWORD authentication failed"

**Causa:** App Password de Gmail es incorrecto.

**Solución:**

1. Ve a https://myaccount.google.com
2. **Seguridad** → **Contraseñas de aplicaciones**
3. Genera nuevo password (no uses tu password normal de Gmail)
4. Copia el nuevo password: `abcd efgh ijkl mnop`
5. En Dokploy, actualiza `MAIL_PASSWORD`
6. Re-deploy

---

### "Emails no se envían (cron silencioso)"

**Causa:** Cron de alertas no está ejecutándose o hay error silencioso.

**Solución:**

1. Verifica logs en Dokploy → Backend
2. Busca: `[Alerts Cron]` o `[ALERTS]`
3. Si no hay nada, verifica:
   ```bash
   ENABLE_CRON=true
   ALERTS_CRON_SCHEDULE=0 6 * * *  # Cada día a las 6 AM
   ```

4. Para testear manualmente (solo backend local):
   ```bash
   cd backend
   npm run start:dev
   # El cron debería ejecutarse a las 6 AM UTC
   ```

---

## 🆘 Reportar un Problema

Si tu error no está aquí:

1. **Copia el error completo** (con stack trace)
2. **Abre un issue en GitHub** con:
   - Qué intentabas hacer
   - El error exacto
   - Pasos para reproducir
   - Tu versión de Node.js (`node --version`)
   - Tu versión de Docker (`docker --version`)

---

## 📚 Más Recursos

- [README.md](./README.md) - Setup y configuración
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy en producción
- [CLAUDE.md](./CLAUDE.md) - Arquitectura y decisiones

