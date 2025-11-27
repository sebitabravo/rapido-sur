# 🚨 ACCIÓN REQUERIDA DESPUÉS DEL DEPLOY

## ✅ Deploy Completado
- Commits pusheados a `main`
- Dokploy debería estar ejecutando el auto-deploy ahora

## ⚠️ PASO CRÍTICO - EJECUTAR MANUALMENTE

**El deploy NO arreglará automáticamente el error de `report_history`**

Debes ejecutar UNA de estas opciones en el servidor de producción:

---

### OPCIÓN 1: SQL Directo (⚡ 2 minutos - RECOMENDADO)

```bash
# 1. SSH al servidor de Dokploy
ssh user@your-server

# 2. Encontrar el contenedor de PostgreSQL
docker ps | grep postgres

# 3. Conectarse a PostgreSQL
docker exec -it <nombre-contenedor-postgres> psql -U postgres -d rapido_sur

# 4. Ejecutar SQL
CREATE TABLE IF NOT EXISTS report_history (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    fecha_inicio VARCHAR(50) NOT NULL,
    fecha_fin VARCHAR(50) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(255)
);

# 5. Verificar
\dt report_history
\q

# 6. Reiniciar backend (opcional pero recomendado)
docker restart <nombre-contenedor-backend>
```

---

### OPCIÓN 2: Usar Migración TypeORM (📝 5 minutos)

```bash
# 1. SSH al servidor
ssh user@your-server

# 2. Encontrar contenedor backend
docker ps | grep backend

# 3. Ejecutar migraciones
docker exec -it <nombre-contenedor-backend> npm run migration:run:prod

# 4. Verificar tabla creada
docker exec -it <nombre-contenedor-postgres> psql -U postgres -d rapido_sur -c "\dt report_history"
```

---

### OPCIÓN 3: Copiar y ejecutar script SQL

```bash
# 1. SSH al servidor
ssh user@your-server

# 2. Clonar/actualizar repo (si tienes acceso)
cd /path/to/rapido-sur
git pull origin main

# 3. Ejecutar script
docker exec -i <nombre-contenedor-postgres> psql -U postgres -d rapido_sur < backend/fix-production.sql
```

---

## 🧪 Verificar que Funcionó

```bash
# Test 1: Verificar tabla existe
docker exec <postgres-container> psql -U postgres -d rapido_sur -c "SELECT COUNT(*) FROM report_history;"

# Test 2: Probar endpoint (desde tu máquina local)
curl -H "Authorization: Bearer <tu-jwt-token>" https://api-rapidosur.sbravo.app/reportes/history

# Respuesta esperada: []
```

---

## 📊 Estado Actual

| Item | Estado |
|------|--------|
| ✅ Código pusheado | COMPLETO |
| ✅ Migración creada | COMPLETO |
| ✅ SQL fix creado | COMPLETO |
| ✅ Documentación | COMPLETO |
| ⏳ Deploy Dokploy | EN PROGRESO |
| ❌ Tabla `report_history` | **PENDIENTE - ACCIÓN MANUAL** |

---

## ⏱️ Timeline

1. **Ahora (0-5 min)**: Dokploy está desplegando los nuevos commits
2. **Después del deploy**: Backend seguirá fallando hasta crear la tabla
3. **Ejecutas SQL**: Errores 500 se resuelven inmediatamente
4. **Total**: ~10 minutos desde ahora

---

## 🔍 Monitorear Deploy

En Dokploy:
- Ve a tu proyecto → Deployments
- Observa el progreso del build
- Una vez completado, ejecuta el SQL

---

## 📞 Si algo falla

1. Verifica logs en Dokploy:
   - Backend logs
   - PostgreSQL logs

2. Ejecuta script de diagnóstico:
```bash
# En el servidor
bash scripts/diagnose-production.sh
```

3. Comparte output del diagnóstico si persisten errores

---

**IMPORTANTE**: Los errores 500 persistirán hasta que ejecutes el SQL manualmente.

