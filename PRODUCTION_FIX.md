# 🔥 SOLUCIÓN ERRORES PRODUCCIÓN - Report History

## 🎯 Resumen del Problema

**Síntomas:**
- ❌ Error 500 en `/reportes/history`
- ❌ Error 400 en requests de reportes
- ❌ Error React #31 (minified) en frontend
- ✅ Funciona perfectamente en desarrollo local con Docker

**Causa Raíz:**
La tabla `report_history` **NO EXISTE en la base de datos de producción**. 

### ¿Por qué funciona en local pero no en producción?

**Desarrollo (Local):**
```typescript
// app.module.ts
synchronize: configService.get("NODE_ENV") === "development", // TRUE en dev
```
TypeORM automáticamente crea/actualiza las tablas basado en las entidades.

**Producción:**
```typescript
synchronize: false // Nunca usar synchronize en producción (pérdida de datos)
```
Requiere ejecutar migraciones manualmente.

## ✅ SOLUCIÓN - 3 Opciones

### Opción 1: SQL Directo (⚡ MÁS RÁPIDO - 2 minutos)

**Paso 1:** Conectarse al contenedor PostgreSQL
```bash
docker exec -it <postgres-container-name> psql -U postgres -d rapido_sur
```

**Paso 2:** Ejecutar este SQL
```sql
CREATE TABLE IF NOT EXISTS report_history (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    fecha_inicio VARCHAR(50) NOT NULL,
    fecha_fin VARCHAR(50) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(255)
);
```

**Paso 3:** Verificar
```sql
\dt report_history
SELECT COUNT(*) FROM report_history;
```

**Paso 4:** Salir y probar
```bash
\q
# Probar endpoint
curl -H "Authorization: Bearer <tu-token>" https://api-rapidosur.sbravo.app/reportes/history
```

---

### Opción 2: Ejecutar Migración (📝 RECOMENDADO - 5 minutos)

**Paso 1:** Conectarse al contenedor backend
```bash
docker exec -it <backend-container-name> sh
```

**Paso 2:** Verificar migraciones pendientes
```bash
npm run migration:show:prod
```

**Paso 3:** Ejecutar migraciones
```bash
npm run migration:run:prod
```

**Paso 4:** Verificar tabla creada
```bash
# Salir del contenedor backend
exit

# Conectarse a postgres
docker exec -it <postgres-container-name> psql -U postgres -d rapido_sur -c "\dt report_history"
```

---

### Opción 3: Archivo SQL desde host (🔧 ALTERNATIVA)

**Paso 1:** Copiar SQL al contenedor
```bash
# Desde la raíz del proyecto
docker cp backend/fix-production.sql <postgres-container-name>:/tmp/
```

**Paso 2:** Ejecutar SQL
```bash
docker exec -it <postgres-container-name> psql -U postgres -d rapido_sur -f /tmp/fix-production.sql
```

---

## 🧪 Verificación

### 1. Verificar que la tabla existe
```bash
docker exec <postgres-container-name> psql -U postgres -d rapido_sur -c "\dt report_history"
```

Deberías ver:
```
             List of relations
 Schema |      Name       | Type  |  Owner   
--------+-----------------+-------+----------
 public | report_history  | table | postgres
```

### 2. Verificar estructura
```bash
docker exec <postgres-container-name> psql -U postgres -d rapido_sur -c "\d report_history"
```

Deberías ver las 6 columnas:
- id
- tipo
- fecha_inicio
- fecha_fin
- fecha_generacion
- usuario

### 3. Probar API
```bash
# Reemplaza <tu-token> con un JWT válido
curl -H "Authorization: Bearer <tu-token>" \
     https://api-rapidosur.sbravo.app/reportes/history

# Respuesta esperada (antes de generar reportes):
[]
```

### 4. Probar desde Frontend
1. Ir a https://rapidosur.sbravo.app/reports
2. No debería mostrar errores 500
3. El historial debe cargar vacío (sin errores)
4. Generar un reporte de indisponibilidad o costos
5. Verificar que aparece en el historial

---

## 🚀 Deploy del Fix

### Para aplicar en producción:

**1. Push de cambios:**
```bash
git push origin main
```

**2. En Dokploy:**
- El push a `main` debería activar auto-deploy
- Esperar a que se complete el build
- Una vez desplegado, ejecutar **Opción 1 o 2** de arriba

**3. Si no hay auto-deploy:**
- Ir a Dokploy → Tu proyecto → Deploy
- Click en "Redeploy"
- Ejecutar fix SQL manualmente

---

## 📋 Nombres de Contenedores en Dokploy

Para encontrar los nombres de tus contenedores:

```bash
# Listar todos los contenedores
docker ps

# Filtrar por proyecto
docker ps | grep rapido

# Común en Dokploy:
# Backend: rapido-sur-backend-1 o similar
# Postgres: rapido-sur-postgres-1 o similar
```

---

## 🔍 Debugging Adicional

### Si persisten errores 500:

**1. Revisar logs del backend:**
```bash
docker logs <backend-container-name> --tail 100 -f
```

**2. Verificar conexión a BD:**
```bash
# Dentro del contenedor backend
docker exec -it <backend-container-name> sh

# Instalar psql si no está
apk add --no-cache postgresql-client

# Probar conexión
psql -h postgres -U postgres -d rapido_sur -c "SELECT NOW();"
```

**3. Verificar variables de entorno:**
```bash
docker exec <backend-container-name> env | grep DB_
```

---

## 📝 Prevención Futura

### Para evitar este problema en el futuro:

**1. Siempre crear migraciones:**
```bash
# Desarrollo
cd backend
npm run migration:generate

# Commit la migración
git add src/database/migrations/*
git commit -m "feat(db): add migration for <feature>"
```

**2. Documentar cambios de BD:**
- Cualquier cambio en entities → crear migración
- Probar migración en local antes de producción
- Incluir rollback en migraciones

**3. CI/CD Check:**
```bash
# Agregar a pipeline (futuro)
npm run migration:show:prod # Verificar pendientes
```

---

## ✅ Checklist Final

- [ ] Tabla `report_history` creada en producción
- [ ] Verificado con `\dt report_history`
- [ ] API `/reportes/history` responde 200
- [ ] Frontend carga sin errores 500
- [ ] Logs del backend sin errores
- [ ] Probado crear reporte y guardar en historial
- [ ] Probado eliminar del historial

---

## 📞 Soporte

Si después de estos pasos sigues teniendo problemas:

1. Captura logs completos:
```bash
docker logs <backend-container-name> > backend-error.log
docker logs <postgres-container-name> > postgres-error.log
```

2. Verifica estado de la BD:
```bash
docker exec <postgres-container-name> psql -U postgres -d rapido_sur -c "\dt"
```

3. Comparte los logs en el equipo

---

**Creado:** 2025-11-27  
**Versión:** 1.0  
**Equipo:** Rápido Sur Dev Team
