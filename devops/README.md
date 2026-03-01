# DevOps Scripts - Rápido Sur

Colección de scripts útiles para desarrollo y operaciones.

## 📂 Estructura

```
devops/
├── README.md                    # Este archivo
└── scripts/
    ├── docker.sh                # Helper para Docker en desarrollo
    ├── diagnose-production.sh   # Diagnóstico de producción
    ├── cleanup-branches.sh      # Limpieza de ramas remotas mergeadas
    └── cleanup-logs-backups.sh  # Limpieza de logs/backups antiguos
```

---

## 🐋 docker.sh

**Descripción:** Script helper para manejar Docker fácilmente durante desarrollo local.

**Ubicación:** `devops/scripts/docker.sh`

**Uso:**

```bash
# Mostrar menú de ayuda
./devops/scripts/docker.sh

# Levantar todos los servicios
./devops/scripts/docker.sh start

# Ver logs en tiempo real
./devops/scripts/docker.sh logs

# Ver logs solo del backend
./devops/scripts/docker.sh logs backend

# Detener servicios
./devops/scripts/docker.sh stop

# Conectar a PostgreSQL
./devops/scripts/docker.sh db

# Shell en el backend
./devops/scripts/docker.sh backend

# Ver estado de servicios
./devops/scripts/docker.sh status
```

**Disponible en desarrollo** (cuando usas `docker-compose.yml`)

---

## 🔍 diagnose-production.sh

**Descripción:** Script de diagnóstico completo para producción. Ejecuta en el servidor Dokploy para identificar problemas.

**Ubicación:** `devops/scripts/diagnose-production.sh`

**Uso en servidor de Dokploy:**

```bash
# Ejecutar diagnóstico completo
./devops/scripts/diagnose-production.sh

# O ejecutar en un contenedor específico
docker exec -it [nombre-contenedor] bash
./diagnose-production.sh
```

**Qué verifica:**

1. ✅ Contenedores activos
2. ✅ Logs del backend (últimas 20 líneas)
3. ✅ Logs de PostgreSQL
4. ✅ Conectividad de red entre contenedores
5. ✅ Variables de entorno (con secrets ocultadas)
6. ✅ Estado de PostgreSQL
7. ✅ Tablas en la base de datos
8. ✅ Tabla `report_history` específicamente
9. ✅ Health check del backend
10. ✅ Uso de recursos (CPU, memoria)

**Cuándo usar:**

- Después de hacer deploy en Dokploy para validar que todo está corriendo
- Cuando sospechas que hay un problema en producción
- Para debugging de problemas de conexión BD/API

---

## 🧹 cleanup-branches.sh

**Descripción:** Detecta ramas remotas mergeadas en `origin/main` y las elimina de forma segura (excluye ramas protegidas).

**Ubicación:** `devops/scripts/cleanup-branches.sh`

**Uso:**

```bash
# Simulación (recomendado)
./devops/scripts/cleanup-branches.sh --dry-run

# Ejecución real
./devops/scripts/cleanup-branches.sh --execute
```

**Protecciones incluidas:**
- Nunca elimina `main/master/develop/dev/staging/production/release/*`
- Siempre requiere fetch/prune previo
- Tiene modo dry-run por defecto

---

## 🗂️ cleanup-logs-backups.sh

**Descripción:** Limpia logs `.log` y backups `backup-*.sql.gz` más antiguos que un umbral (30 días por defecto).

**Ubicación:** `devops/scripts/cleanup-logs-backups.sh`

**Uso:**

```bash
# Simulación
LOG_DIR=/var/log/rapido-sur BACKUP_DIR=/opt/rapido-sur/backups \
  ./devops/scripts/cleanup-logs-backups.sh --dry-run

# Ejecución real
LOG_DIR=/var/log/rapido-sur BACKUP_DIR=/opt/rapido-sur/backups \
  ./devops/scripts/cleanup-logs-backups.sh --execute

# Cambiar retención (ej. 45 días)
./devops/scripts/cleanup-logs-backups.sh --dry-run --days=45
```

---

## 📝 Notas

- Los scripts están documentados en el repositorio para referencia
- En desarrollo, se recomienda usar `npm run dev` en lugar de manualmente ejecutar docker.sh
- Para producción, Dokploy gestiona los contenedores automáticamente
- Estos scripts son opcionales - el sistema funciona sin ellos

---

## 🤝 Contribuir

Si agregás nuevos scripts DevOps:

1. Colócalos en `devops/scripts/`
2. Docentralos en este README
3. Asegúrate de que sean seguros y no contengan credenciales hardcodeadas
4. Haz un commit describiendo para qué sirven

