# PLAN DE IMPLEMENTACIÓN Y MANTENCIÓN

## Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur

---

**Versión del Sistema**: 1.0
**Fecha**: Diciembre 2025
**Audiencia**: Gerencia, Jefes de proyecto, Administradores de sistemas

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Plan de Implementación](#2-plan-de-implementación)
3. [Plan de Mantención](#3-plan-de-mantención)
4. [Monitoreo y Métricas](#4-monitoreo-y-métricas)
5. [Plan de Respaldo y Recuperación](#5-plan-de-respaldo-y-recuperación)
6. [Escalamiento Futuro](#6-escalamiento-futuro)
7. [Soporte y Contactos](#7-soporte-y-contactos)

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo del Sistema

Digitalizar completamente el proceso de gestión de mantenimiento vehicular de Rápido Sur, reduciendo en un 40% las fallas por mantenimiento atrasado durante el primer año de operación.

### 1.2 Alcance de la Implementación

**Usuarios objetivo**: 10 usuarios concurrentes

- 1 Administrador
- 2 Jefes de Mantenimiento
- 5-7 Mecánicos

**Flota a gestionar**: 45 vehículos (buses y furgones)

**Módulos incluidos**:

- ✅ Gestión de vehículos y flotas
- ✅ Órdenes de trabajo (preventivas y correctivas)
- ✅ Alertas automáticas de mantenimiento
- ✅ Control de inventario de repuestos
- ✅ Reportes y análisis de costos
- ✅ Sistema de usuarios con roles diferenciados

### 1.3 Tecnologías Implementadas

- **Frontend**: Next.js 15 + React 18 + Tailwind CSS
- **Backend**: NestJS 10 + Node.js 20 LTS
- **Base de Datos**: PostgreSQL 15
- **Infraestructura**: Docker + Dokploy (VPS Hostinger)
- **Seguridad**: JWT, bcrypt, HTTPS (Let's Encrypt)

---

## 2. Plan de Implementación

### 2.1 Fases de Implementación

La implementación se divide en **4 fases** con duración total de **3 semanas**.

#### FASE 1: Preparación (Semana 1 - Días 1-3)

**Objetivo**: Preparar infraestructura y realizar configuraciones iniciales.

**Actividades**:

| # | Actividad | Responsable | Duración | Entregable |
|---|-----------|-------------|----------|------------|
| 1.1 | Contratar y configurar VPS en Hostinger | Admin TI | 1 día | Servidor operativo |
| 1.2 | Instalar Docker, Dokploy, configurar firewall | Admin TI | 0.5 días | Infraestructura lista |
| 1.3 | Configurar dominio y DNS | Admin TI | 0.5 días | Dominio apuntando al servidor |
| 1.4 | Generar secrets de producción (JWT, DB passwords) | Desarrollador | 0.5 días | Secrets seguros generados |
| 1.5 | Configurar variables de entorno en Dokploy | Desarrollador | 0.5 días | Variables configuradas |
| 1.6 | Configurar email (Gmail App Password o SendGrid) | Admin TI | 0.5 días | Emails funcionando |

**Resultado esperado**: Infraestructura completamente preparada para deployment.

---

#### FASE 2: Deployment Inicial (Semana 1 - Días 4-5)

**Objetivo**: Desplegar el sistema en producción.

**Actividades**:

| # | Actividad | Responsable | Duración | Entregable |
|---|-----------|-------------|----------|------------|
| 2.1 | Hacer push del código final a GitHub main | Desarrollador | 0.5 días | Código en producción |
| 2.2 | Configurar auto-deploy en Dokploy | Desarrollador | 0.5 días | Pipeline CI/CD activo |
| 2.3 | Ejecutar deployment inicial | Desarrollador | 1 hora | Sistema desplegado |
| 2.4 | Ejecutar migraciones de base de datos | Desarrollador | 0.5 horas | BD inicializada |
| 2.5 | Ejecutar seed con usuarios iniciales | Desarrollador | 0.5 horas | Usuarios creados |
| 2.6 | Configurar SSL/HTTPS con Let's Encrypt | Admin TI | 1 hora | HTTPS funcionando |
| 2.7 | Verificar health checks y logs | Desarrollador | 1 hora | Sistema saludable |

**Verificaciones críticas**:

- ✅ Frontend accesible vía HTTPS
- ✅ Backend responde correctamente
- ✅ Base de datos conectada
- ✅ Emails de prueba funcionan
- ✅ Certificado SSL válido

**Resultado esperado**: Sistema completamente funcional en producción.

---

#### FASE 3: Carga de Datos Reales (Semana 2 - Días 1-3)

**Objetivo**: Migrar datos existentes de Rápido Sur al sistema.

**Actividades**:

| # | Actividad | Responsable | Duración | Entregable |
|---|-----------|-------------|----------|------------|
| 3.1 | Recopilar datos de vehículos (Excel actual) | Jefe Mantenimiento | 0.5 días | Planilla consolidada |
| 3.2 | Crear usuarios reales en el sistema | Administrador | 1 hora | Usuarios activos |
| 3.3 | Ingresar 45 vehículos al sistema | Jefe Mantenimiento | 1 día | Flota completa cargada |
| 3.4 | Configurar planes preventivos por vehículo | Jefe Mantenimiento | 1 día | Alertas configuradas |
| 3.5 | Cargar catálogo de repuestos | Administrador | 0.5 días | Inventario inicial |
| 3.6 | Actualizar kilometrajes actuales | Jefe Mantenimiento | 0.5 días | Datos actualizados |
| 3.7 | Crear órdenes de trabajo históricas (opcional) | Jefe Mantenimiento | 1 día | Historial cargado |

**Datos a migrar**:

- 45 vehículos con sus características
- Historial de mantenimiento (últimos 6-12 meses)
- Catálogo de repuestos (~50-100 items iniciales)
- Kilometrajes actuales
- Fechas de última revisión

**Formato de datos recomendado**:

- Crear plantilla Excel para facilitar carga masiva
- Validar datos antes de ingresar
- Hacer carga en horario no laboral para evitar interrupciones

**Resultado esperado**: Sistema con todos los datos reales de Rápido Sur.

---

#### FASE 4: Capacitación y Puesta en Marcha (Semana 2-3 - Días 4-7)

**Objetivo**: Capacitar usuarios y comenzar operación productiva.

**Actividades**:

| # | Actividad | Responsable | Duración | Entregable |
|---|-----------|-------------|----------|------------|
| 4.1 | Capacitación al Administrador | Desarrollador | 2 horas | Admin capacitado |
| 4.2 | Capacitación a Jefes de Mantenimiento | Desarrollador | 3 horas | Jefes capacitados |
| 4.3 | Capacitación a Mecánicos | Jefe Mantenimiento | 4 horas | Mecánicos capacitados |
| 4.4 | Período de prueba supervisada | Desarrollador + Jefe | 3 días | Usuarios operando |
| 4.5 | Resolución de dudas y ajustes menores | Desarrollador | 2 días | Sistema ajustado |
| 4.6 | Inicio de operación productiva oficial | Gerencia | - | Sistema en producción |

**Sesiones de capacitación** (ver Material de Capacitación):

1. **Administrador** (2 horas):
   - Gestión de usuarios
   - Configuración del sistema
   - Generación de reportes
   - Gestión de repuestos

2. **Jefes de Mantenimiento** (3 horas):
   - Creación y asignación de órdenes de trabajo
   - Revisión de alertas
   - Cierre de trabajos
   - Generación de reportes

3. **Mecánicos** (4 horas - grupos de 2-3):
   - Visualización de órdenes asignadas
   - Registro de tareas
   - Registro de repuestos
   - Marcado de completado

**Resultado esperado**: Todos los usuarios capacitados y operando el sistema con confianza.

---

### 2.2 Cronograma Detallado (Gantt Simplificado)

```
SEMANA 1
───────────────────────────────────────────────────────
Día    1    2    3    4    5    6    7
───────────────────────────────────────────────────────
Fase 1 ████ ████ ████
Fase 2           ████ ████

SEMANA 2
───────────────────────────────────────────────────────
Día    1    2    3    4    5    6    7
───────────────────────────────────────────────────────
Fase 3 ████ ████ ████
Fase 4           ████ ████ ████ ████

SEMANA 3
───────────────────────────────────────────────────────
Día    1    2    3    4    5
───────────────────────────────────────────────────────
Fase 4 ████ [Inicio Productivo]
```

### 2.3 Recursos Necesarios

#### Recursos Humanos

| Rol | Dedicación | Período | Notas |
|-----|------------|---------|-------|
| Desarrollador Principal | Full-time | Semana 1-2 | Deployment y capacitación |
| Administrador TI | Part-time (50%) | Semana 1 | Infraestructura |
| Jefe de Mantenimiento | Part-time (25%) | Semana 2-3 | Carga de datos y capacitación |
| Gerente de Operaciones | Meetings | Todo el período | Aprobaciones y supervisión |

#### Recursos Técnicos

| Recurso | Especificación | Costo Mensual | Proveedor |
|---------|----------------|---------------|-----------|
| VPS | 4 vCPUs, 16GB RAM, 200GB SSD | ~$20 USD | Hostinger |
| Dominio | .cl o .com | ~$10-15 USD/año | NIC Chile / GoDaddy |
| SSL | Let's Encrypt (gratuito) | $0 | Let's Encrypt |
| Email SMTP | Gmail gratuito o SendGrid Free | $0 | Google / SendGrid |
| **Total mensual** | | **~$20-25 USD** | |

#### Recursos de Software

Todos open source o gratuitos:

- Node.js: Gratuito
- PostgreSQL: Gratuito
- Docker: Gratuito
- Dokploy: Gratuito
- Next.js, NestJS, React: Gratuitos

**Costo total de software**: $0

### 2.4 Criterios de Aceptación

El sistema se considera **exitosamente implementado** cuando:

| Criterio | Método de Verificación | Responsable |
|----------|------------------------|-------------|
| ✅ Sistema accesible vía HTTPS | Navegación web exitosa | Admin TI |
| ✅ Todos los usuarios pueden iniciar sesión | Login exitoso para cada rol | Jefe Mantenimiento |
| ✅ Se puede crear una OT completa | Crear, asignar, ejecutar, cerrar | Jefe + Mecánico |
| ✅ Alertas automáticas funcionan | Verificar email de alerta | Jefe Mantenimiento |
| ✅ Reportes se generan correctamente | Exportar CSV | Administrador |
| ✅ 45 vehículos cargados | Conteo en sistema | Administrador |
| ✅ Inventario de repuestos funciona | Registrar uso y verificar descuento | Mecánico |
| ✅ Sistema estable (uptime >99%) | Monitoreo durante 3 días | Admin TI |

---

## 3. Plan de Mantención

### 3.1 Mantenimiento Preventivo

#### 3.1.1 Diario

**Responsable**: Sistema automático + Admin TI

| Tarea | Hora | Herramienta | Descripción |
|-------|------|-------------|-------------|
| Verificación de alertas | 06:00 AM | Cron job | Sistema ejecuta job de alertas |
| Backup de BD | 02:00 AM | Script automático | Backup incremental |
| Revisión de logs | 08:00 AM | Docker logs | Admin revisa logs del día anterior |

**Acciones**:

```bash
# Revisar logs del día anterior
docker logs --since 24h rapido-sur-backend | grep ERROR

# Verificar que backup se ejecutó
ls -lh /opt/rapido-sur/backups/ | tail -5
```

#### 3.1.2 Semanal

**Responsable**: Administrador TI

| Tarea | Día | Duración | Descripción |
|-------|-----|----------|-------------|
| Revisión de métricas de uso | Lunes | 30 min | Usuarios activos, OTs creadas, etc. |
| Análisis de logs de errores | Martes | 1 hora | Identificar patrones de errores |
| Verificación de espacio en disco | Miércoles | 15 min | Asegurar espacio suficiente |
| Revisión de certificados SSL | Jueves | 10 min | Verificar renovación automática |
| Actualización de dependencias menores | Viernes | 1 hora | npm update (si hay parches de seguridad) |

**Acciones**:

```bash
# Espacio en disco
df -h

# Verificar SSL
echo | openssl s_client -connect rapidosur.com:443 2>/dev/null | openssl x509 -noout -dates

# Logs de errores
docker logs rapido-sur-backend 2>&1 | grep -i error | tail -50
```

#### 3.1.3 Mensual

**Responsable**: Desarrollador + Admin TI

| Tarea | Semana | Duración | Descripción |
|-------|--------|----------|-------------|
| Actualización de dependencias | Semana 1 | 2 horas | npm update en dev, probar, deploy |
| Análisis de performance | Semana 2 | 1 hora | Queries lentas, carga del servidor |
| Limpieza de logs antiguos | Semana 3 | 30 min | Eliminar logs >30 días |
| Revisión de backups | Semana 4 | 1 hora | Probar restore de backup |
| Reunión de revisión | Última semana | 1 hora | Equipo completo - mejoras y ajustes |

**Acciones**:

```bash
# Actualizar dependencias (en ambiente dev primero)
cd backend && npm update
cd ../frontend && npm update

# Limpiar logs antiguos
find /var/log/rapido-sur/ -name "*.log" -mtime +30 -delete

# Test de restore (en ambiente dev)
docker exec -i rapido-sur-postgres-dev psql -U postgres -d test_restore < backup-latest.sql
```

#### 3.1.4 Trimestral

**Responsable**: Equipo de desarrollo

| Tarea | Duración | Descripción |
|-------|----------|-------------|
| Auditoría de seguridad | 4 horas | Revisar vulnerabilidades conocidas |
| Optimización de base de datos | 2 horas | VACUUM, REINDEX, analizar queries |
| Actualización de documentación | 2 horas | Actualizar manuales si hay cambios |
| Evaluación de nuevas funcionalidades | 4 horas | Revisar solicitudes de usuarios |

### 3.2 Mantenimiento Correctivo

#### 3.2.1 Clasificación de Incidentes

| Prioridad | Descripción | Tiempo de Respuesta | Tiempo de Resolución |
|-----------|-------------|---------------------|----------------------|
| **P1 - Crítico** | Sistema caído, sin acceso | 15 minutos | 2 horas |
| **P2 - Alto** | Funcionalidad crítica no funciona | 1 hora | 4 horas |
| **P3 - Medio** | Funcionalidad secundaria afectada | 4 horas | 24 horas |
| **P4 - Bajo** | Mejora cosmética, documentación | 2 días | 1 semana |

**Ejemplos**:

- **P1**: Sistema no responde, BD caída, frontend no carga
- **P2**: No se pueden crear OTs, alertas no se envían
- **P3**: Filtro de reportes no funciona, error al exportar CSV
- **P4**: Typo en interfaz, sugerencia de mejora UX

#### 3.2.2 Proceso de Resolución

```
Incidente reportado
        ↓
Clasificación (P1-P4)
        ↓
Asignación al responsable
        ↓
Diagnóstico
        ↓
Desarrollo de fix (si aplica)
        ↓
Testing en desarrollo
        ↓
Deploy a producción
        ↓
Verificación
        ↓
Cierre y documentación
```

**Tiempos SLA** (Service Level Agreement):

- P1: Respuesta 15 min, Resolución 2 horas
- P2: Respuesta 1 hora, Resolución 4 horas
- P3: Respuesta 4 horas, Resolución 24 horas
- P4: Respuesta 2 días, Resolución 1 semana

### 3.3 Monitoreo de Salud del Sistema

#### Health Checks Automáticos

**Endpoint de salud**: `https://api.rapidosur.com/health`

```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2025-12-09T10:30:00Z",
  "uptime": "5d 12h 34m"
}
```

**Monitoreo externo** (opcional):

- **UptimeRobot** (gratuito): Verifica cada 5 minutos si el sistema responde
- Alerta por email si el sistema está caído >5 minutos

**Configuración**:

1. Crear cuenta en <https://uptimerobot.com>
2. Agregar monitor: `https://rapidosur.com`
3. Configurar alertas por email
4. Verificar cada 5 minutos

#### Logs Centralizados

**Ubicación de logs**:

```
/var/log/rapido-sur/
├── backend-access.log      # Accesos HTTP
├── backend-error.log        # Errores de backend
├── frontend-error.log       # Errores de frontend
├── postgres.log             # Logs de PostgreSQL
└── cron.log                 # Logs de tareas programadas
```

**Rotación de logs** (logrotate):

```bash
# /etc/logrotate.d/rapido-sur
/var/log/rapido-sur/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 4. Monitoreo y Métricas

### 4.1 KPIs del Sistema

**Técnicos**:

| Métrica | Objetivo | Medición | Herramienta |
|---------|----------|----------|-------------|
| Uptime | >99.5% | Mensual | UptimeRobot |
| Tiempo de respuesta API | <500ms | Diario | New Relic / logs |
| Errores 5xx | <0.1% | Diario | Logs |
| Tiempo de carga frontend | <3s | Semanal | Google Lighthouse |
| Uso de CPU | <70% | Diario | `docker stats` |
| Uso de RAM | <80% | Diario | `docker stats` |
| Uso de disco | <80% | Diario | `df -h` |

**De Negocio**:

| Métrica | Objetivo | Medición | Fuente |
|---------|----------|----------|--------|
| Usuarios activos diarios | >8 | Diario | BD (logs de login) |
| OTs creadas por semana | Variable | Semanal | Reporte del sistema |
| Alertas generadas | ~5-10/semana | Semanal | Tabla de alertas |
| Tiempo promedio de cierre de OT | <3 días | Mensual | Reporte de tiempos |
| Reducción de fallas atrasadas | 40% anual | Trimestral | Comparación histórica |

### 4.2 Dashboard de Monitoreo (Opcional - Futuro)

**Herramientas recomendadas**:

- **Grafana**: Visualización de métricas
- **Prometheus**: Recolección de métricas
- **New Relic** (free tier): APM completo

**Métricas a visualizar**:

- Requests por minuto
- Tiempo de respuesta promedio
- Errores por endpoint
- Usuarios concurrentes
- Queries más lentas de BD

---

## 5. Plan de Respaldo y Recuperación

### 5.1 Estrategia de Backups

#### Backup de Base de Datos

**Frecuencia**: Diario (2:00 AM)

**Método**: pg_dump automático

**Retención**:

- Diarios: 30 días
- Semanales: 12 semanas
- Mensuales: 12 meses

**Script de backup** (`/opt/rapido-sur/backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/opt/rapido-sur/backups"
DATE=$(date +%Y%m%d-%H%M%S)
FILENAME="backup-$DATE.sql"

docker exec rapido-sur-postgres pg_dump -U postgres rapido_sur_db > $BACKUP_DIR/$FILENAME
gzip $BACKUP_DIR/$FILENAME

# Upload a storage externo (Google Drive, S3, etc.)
rclone copy $BACKUP_DIR/$FILENAME.gz remote:rapido-sur-backups/

# Limpiar backups antiguos
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +30 -delete
```

**Cron job**:

```cron
0 2 * * * /opt/rapido-sur/backup.sh >> /var/log/rapido-sur-backup.log 2>&1
```

#### Backup de Código

**Método**: Git + GitHub

**Frecuencia**: Cada commit

**Ramas protegidas**:

- `main`: Solo mediante pull request aprobado
- `develop`: Para desarrollo continuo

#### Backup de Configuración

**Archivos críticos a respaldar**:

- `.env` de producción (en gestor de contraseñas)
- Configuración de Dokploy
- Scripts de backup y mantenimiento

**Almacenamiento**: Gestor de contraseñas corporativo (1Password, Bitwarden, etc.)

### 5.2 Plan de Recuperación ante Desastres (DRP)

#### Escenario 1: Servidor VPS Caído

**RTO** (Recovery Time Objective): 4 horas
**RPO** (Recovery Point Objective): 24 horas

**Pasos**:

1. Verificar status con proveedor (Hostinger) - 15 min
2. Si no se puede recuperar, provisionar nuevo VPS - 30 min
3. Instalar Docker y Dokploy - 30 min
4. Clonar repositorio - 10 min
5. Restaurar variables de entorno - 10 min
6. Deploy del sistema - 20 min
7. Restaurar último backup de BD - 20 min
8. Verificar funcionamiento - 30 min
9. Comunicar a usuarios - 10 min

**Total**: ~2.5 horas

#### Escenario 2: Corrupción de Base de Datos

**RTO**: 1 hora
**RPO**: 24 horas

**Pasos**:

1. Detener backend para evitar más escrituras - 2 min
2. Crear backup de BD corrupta (para análisis) - 5 min
3. Restaurar desde último backup válido - 20 min
4. Verificar integridad de datos - 15 min
5. Reiniciar backend - 5 min
6. Verificar funcionamiento - 10 min
7. Comunicar a usuarios - 5 min

**Total**: ~1 hora

#### Escenario 3: Código con Bug Crítico

**RTO**: 30 minutos
**RPO**: 0 (sin pérdida de datos)

**Pasos**:

1. Identificar commit problemático - 5 min
2. Hacer rollback a versión anterior - 5 min
3. Deploy de versión estable - 10 min
4. Verificar funcionamiento - 5 min
5. Desarrollar fix en paralelo - Variable
6. Deploy del fix cuando esté listo - 5 min

**Total**: ~30 minutos

### 5.3 Procedimientos de Restore

#### Restore de Base de Datos

```bash
# 1. Detener backend
docker stop rapido-sur-backend

# 2. Descomprimir backup
gunzip backup-20251209.sql.gz

# 3. Restaurar
docker exec -i rapido-sur-postgres psql -U postgres -d rapido_sur_db < backup-20251209.sql

# 4. Verificar
docker exec -it rapido-sur-postgres psql -U postgres -d rapido_sur_db -c "SELECT COUNT(*) FROM usuarios;"

# 5. Reiniciar backend
docker start rapido-sur-backend
```

#### Restore de Código

```bash
# Rollback a commit anterior
cd /opt/rapido-sur
git log --oneline -n 10  # Ver commits recientes
git checkout <commit-hash-estable>
docker compose build
docker compose up -d
```

---

## 6. Escalamiento Futuro

### 6.1 Crecimiento Esperado

**Año 1**:

- Usuarios: 10 → 15
- Vehículos: 45 → 50
- OTs mensuales: ~50 → 100

**Año 2-3**:

- Usuarios: 15 → 25
- Vehículos: 50 → 75
- OTs mensuales: 100 → 200

### 6.2 Estrategia de Escalamiento

#### Escalamiento Vertical (primeros 1-2 años)

**Actual**:

- 4 vCPUs, 16GB RAM, 200GB SSD
- Costo: ~$20 USD/mes

**Upgrade Fase 1** (si uso >70%):

- 8 vCPUs, 16GB RAM, 160GB SSD
- Costo: ~$40 USD/mes

**Cuándo escalar**:

- CPU promedio >70% por 7 días consecutivos
- RAM promedio >80% por 7 días consecutivos
- Disco >80% utilizado

#### Escalamiento Horizontal (largo plazo)

**Si usuarios crecen >50**:

- Separar backend en múltiples instancias (load balancing)
- PostgreSQL en servidor dedicado
- CDN para assets estáticos
- Cache con Redis

**Costo estimado**: ~$100-150 USD/mes

### 6.3 Nuevas Funcionalidades (Roadmap)

**Corto plazo (3-6 meses)**:

- Dashboard con gráficos (Chart.js)
- Notificaciones push en navegador
- Modo offline para mecánicos (PWA)

**Mediano plazo (6-12 meses)**:

- App móvil nativa (React Native)
- Integración con proveedores de repuestos (APIs)
- Predicción de fallas con ML

**Largo plazo (>12 meses)**:

- Sistema multi-empresa (SaaS)
- Integración con GPS de vehículos
- Análisis avanzado con BI

---

## 7. Soporte y Contactos

### 7.1 Niveles de Soporte

#### Nivel 1: Usuario Final

**Responsable**: Jefe de Mantenimiento o Administrador interno

**Alcance**:

- Dudas sobre uso del sistema
- Olvido de contraseñas
- Problemas menores de interfaz

**Canal**: Interno (presencial, teléfono, email)

**Horario**: Lunes a Viernes 8:00-18:00

#### Nivel 2: Técnico

**Responsable**: Administrador TI

**Alcance**:

- Problemas de conectividad
- Errores del sistema
- Configuración de usuarios
- Actualizaciones menores

**Canal**: Email técnico + teléfono

**Horario**: Lunes a Viernes 8:00-18:00

#### Nivel 3: Desarrollador

**Responsable**: Equipo de desarrollo

**Alcance**:

- Bugs críticos (P1, P2)
- Desarrollo de nuevas funcionalidades
- Cambios estructurales
- Problemas de arquitectura

**Canal**: Email + GitHub Issues + reuniones programadas

**Horario**: Lunes a Viernes 9:00-18:00

**Emergencias (P1)**: 24/7 por teléfono

### 7.2 Contactos

**Equipo de Desarrollo**:

- **Email**: <dev@rapidosur.cl> (crear alias)
- **GitHub Issues**: <https://github.com/tu-org/rapido-sur/issues>
- **Teléfono emergencias**: +56 9 XXXX XXXX

**Administrador TI**:

- **Email**: <ti@rapidosur.cl>
- **Teléfono**: +56 9 XXXX XXXX

**Jefe de Mantenimiento**:

- **Email**: <jefe@rapidosur.cl>
- **Teléfono**: +56 9 XXXX XXXX

**Proveedor VPS (Hostinger)**:

- **Soporte**: <https://www.hostinger.com/support>
- **Teléfono**: Ver portal de cliente

### 7.3 Documentación de Referencia

| Documento | Ubicación | Audiencia |
|-----------|-----------|-----------|
| Manual de Usuario | docs/MANUAL_USUARIO.md | Todos los usuarios |
| Manual de Instalación | docs/MANUAL_INSTALACION.md | Técnicos |
| Material de Capacitación | docs/MATERIAL_CAPACITACION.md | Nuevos usuarios |
| Arquitectura del Sistema | CLAUDE.md | Desarrolladores |
| Modelo de Base de Datos | docs/DATABASE_MODEL.md | Desarrolladores |
| Guía de Deployment | DEPLOYMENT_GUIDE.md | DevOps |
| Troubleshooting | TROUBLESHOOTING.md | Técnicos |

---

## Anexo A: Checklist de Implementación

```
FASE 1: PREPARACIÓN
─────────────────────────────────────────────
□ VPS contratado y accesible
□ Docker instalado
□ Dokploy instalado
□ Dominio configurado y DNS apuntando
□ Firewall configurado (puertos 22, 80, 443)
□ Secrets generados (JWT, DB password)
□ Variables de entorno configuradas
□ Email configurado y probado

FASE 2: DEPLOYMENT
─────────────────────────────────────────────
□ Código en GitHub rama main
□ Auto-deploy configurado
□ Deployment inicial exitoso
□ Migraciones ejecutadas
□ Seed ejecutado
□ SSL/HTTPS funcionando
□ Health check OK
□ Frontend accesible
□ Backend responde
□ Base de datos conectada

FASE 3: CARGA DE DATOS
─────────────────────────────────────────────
□ Usuarios reales creados
□ 45 vehículos cargados
□ Planes preventivos configurados
□ Catálogo de repuestos cargado
□ Kilometrajes actualizados
□ Historial (opcional) cargado

FASE 4: CAPACITACIÓN
─────────────────────────────────────────────
□ Administrador capacitado
□ Jefes de Mantenimiento capacitados
□ Mecánicos capacitados
□ Período de prueba completado
□ Dudas resueltas
□ Sistema en producción oficial

POST-IMPLEMENTACIÓN
─────────────────────────────────────────────
□ Backups automáticos configurados
□ Monitoreo externo activado (UptimeRobot)
□ Documentación entregada
□ Contactos de soporte documentados
□ Plan de mantención activo
```

---

## Anexo B: Contactos de Emergencia

**Disponibilidad 24/7 solo para incidentes P1** (sistema caído)

| Rol | Nombre | Teléfono | Email |
|-----|--------|----------|-------|
| Desarrollador Principal | [Nombre] | +56 9 XXXX XXXX | <dev1@rapidosur.cl> |
| Desarrollador Backup | [Nombre] | +56 9 XXXX XXXX | <dev2@rapidosur.cl> |
| Admin TI | [Nombre] | +56 9 XXXX XXXX | <ti@rapidosur.cl> |
| Gerente de Operaciones | [Nombre] | +56 9 XXXX XXXX | <gerencia@rapidosur.cl> |

**Proveedores**:

- Hostinger: <https://www.hostinger.com/support>
- GitHub: <https://support.github.com>

---

## Anexo C: Glosario de Términos Técnicos

**Deployment**: Proceso de publicar el código en el servidor de producción.

**Dokploy**: Plataforma de orquestación de Docker que simplifica deployments.

**Docker**: Tecnología de contenedores que encapsula aplicaciones.

**Health Check**: Endpoint que verifica si el sistema está funcionando correctamente.

**Migration**: Script que modifica la estructura de la base de datos.

**RPO (Recovery Point Objective)**: Máxima pérdida de datos aceptable (ej: 24 horas).

**RTO (Recovery Time Objective)**: Tiempo máximo para recuperar el sistema (ej: 4 horas).

**Seed**: Proceso de poblar la base de datos con datos iniciales.

**SLA (Service Level Agreement)**: Acuerdo de nivel de servicio (tiempos de respuesta).

**SSL/TLS**: Protocolo de seguridad que habilita HTTPS.

**Uptime**: Porcentaje de tiempo que el sistema está disponible (ej: 99.5%).

**VPS (Virtual Private Server)**: Servidor virtual donde se aloja el sistema.

---

**Fin del Plan de Implementación y Mantención**

*Versión 1.0 - Diciembre 2025*
*Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur*
*Desarrollado por: Rubilar, Bravo, Loyola, Aguayo*
