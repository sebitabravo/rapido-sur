# 🗄️ MODELO DE DATOS - RÁPIDO SUR

**Versión:** 1.0  
**Fecha:** 2025-01-10  
**Base de Datos:** PostgreSQL 15  
**ORM:** TypeORM 0.3

---

## 📊 DIAGRAMA ENTIDAD-RELACIÓN

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│   Usuario   │◄───────│  OrdenTrabajo    │───────►│  Vehiculo   │
│             │        │                  │        │             │
│ id          │        │ id               │        │ id          │
│ username    │        │ numero_ot        │        │ patente     │
│ email       │        │ tipo             │        │ marca       │
│ nombre      │        │ estado           │        │ modelo      │
│ rol         │        │ descripcion      │        │ año         │
│ password    │        │ prioridad        │        │ kilometraje │
│ activo      │        │ fecha_creacion   │        │ estado      │
└─────────────┘        │ fecha_inicio     │        └─────────────┘
                       │ fecha_cierre     │               │
                       │ costo_estimado   │               │
                       │ costo_real       │               │
                       │ vehiculo_id  ────┘               │
                       │ mecanico_id  ────┐               │
                       └──────────────────┘               │
                                │                         │
                                │                         │
                                ▼                         ▼
                       ┌──────────────────┐    ┌──────────────────┐
                       │     Tarea        │    │  PlanPreventivo  │
                       │                  │    │                  │
                       │ id               │    │ id               │
                       │ descripcion      │    │ tipo_intervalo   │
                       │ completada       │    │ intervalo        │
                       │ fecha_vencimiento│    │ descripcion      │
                       │ orden_trabajo_id │    │ activo           │
                       │ mecanico_id      │    │ vehiculo_id  ────┘
                       └──────────────────┘    └──────────────────┘
                                │
                                │
                                ▼
                       ┌──────────────────┐
                       │ DetalleRepuesto  │
                       │                  │
                       │ id               │
                       │ tarea_id     ────┘
                       │ repuesto_id  ────┐
                       │ cantidad_usada   │
                       │ precio_momento   │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │    Repuesto      │
                       │                  │
                       │ id               │
                       │ codigo           │
                       │ nombre           │
                       │ categoria        │
                       │ precio_unitario  │
                       │ stock_actual     │
                       │ stock_minimo     │
                       │ proveedor        │
                       │ ubicacion        │
                       └──────────────────┘

                       ┌──────────────────┐
                       │     Alerta       │
                       │                  │
                       │ id               │
                       │ tipo             │
                       │ descripcion      │
                       │ prioridad        │
                       │ estado           │
                       │ vehiculo_id  ────┐
                       │ fecha_generacion │
                       │ fecha_resolucion │
                       └──────────────────┘
```

---

## 📋 TABLAS DEL SISTEMA

### 1. **Usuario**
**Descripción:** Almacena información de los usuarios del sistema (Administrador, Jefe de Mantenimiento, Mecánicos)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Nombre de usuario para login |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico |
| `password_hash` | VARCHAR(255) | NOT NULL | Contraseña encriptada (bcrypt cost 12) |
| `nombre_completo` | VARCHAR(255) | NOT NULL | Nombre completo del usuario |
| `rol` | ENUM | NOT NULL | Administrador, JefeMantenimiento, Mecanico |
| `activo` | BOOLEAN | DEFAULT true | Si el usuario está activo |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- UNIQUE: `username`, `email`
- INDEX: `rol`, `activo`

---

### 2. **Vehiculo**
**Descripción:** Información de cada vehículo de la flota

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `patente` | VARCHAR(10) | UNIQUE, NOT NULL | Patente del vehículo (formato chileno) |
| `marca` | VARCHAR(50) | NOT NULL | Marca del vehículo |
| `modelo` | VARCHAR(50) | NOT NULL | Modelo del vehículo |
| `anno` | INT | NOT NULL | Año de fabricación |
| `kilometraje_actual` | INT | DEFAULT 0 | Kilometraje actual |
| `estado` | ENUM | DEFAULT 'Activo' | Activo, Mantenimiento, FueraServicio |
| `ultima_revision` | DATE | NULL | Fecha de última revisión |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- UNIQUE: `patente`
- INDEX: `estado`

---

### 3. **OrdenTrabajo**
**Descripción:** Órdenes de mantenimiento (preventivo o correctivo)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `numero_ot` | VARCHAR(20) | UNIQUE, NOT NULL | Número de OT (OT-YYYY-NNNNN) |
| `tipo` | ENUM | NOT NULL | Preventivo, Correctivo |
| `estado` | ENUM | DEFAULT 'Pendiente' | Pendiente, Asignada, EnProgreso, Finalizada |
| `prioridad` | ENUM | DEFAULT 'MEDIA' | BAJA, MEDIA, ALTA |
| `descripcion` | TEXT | NOT NULL | Descripción del trabajo |
| `observaciones` | TEXT | NULL | Observaciones adicionales |
| `fecha_creacion` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `fecha_inicio` | TIMESTAMP | NULL | Fecha de inicio del trabajo |
| `fecha_cierre` | TIMESTAMP | NULL | Fecha de finalización |
| `costo_estimado` | DECIMAL(10,2) | NULL | Costo estimado |
| `costo_real` | DECIMAL(10,2) | NULL | Costo real final |
| `vehiculo_id` | INT | FK, NOT NULL | Vehículo asociado |
| `mecanico_id` | INT | FK, NULL | Mecánico asignado |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- UNIQUE: `numero_ot`
- FK: `vehiculo_id` → `vehiculo(id)`
- FK: `mecanico_id` → `usuario(id)`
- INDEX: `estado`, `tipo`, `fecha_creacion`

**Restricciones:**
- `ON DELETE RESTRICT` para FKs (no eliminar si tiene OTs)

---

### 4. **Tarea**
**Descripción:** Tareas específicas dentro de una Orden de Trabajo

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `descripcion` | TEXT | NOT NULL | Descripción de la tarea |
| `completada` | BOOLEAN | DEFAULT false | Si está completada |
| `fecha_vencimiento` | DATE | NULL | Fecha límite |
| `orden_trabajo_id` | INT | FK, NOT NULL | OT a la que pertenece |
| `mecanico_asignado_id` | INT | FK, NULL | Mecánico específico |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- FK: `orden_trabajo_id` → `orden_trabajo(id)` ON DELETE CASCADE
- FK: `mecanico_asignado_id` → `usuario(id)`
- INDEX: `completada`, `orden_trabajo_id`

---

### 5. **Repuesto**
**Descripción:** Catálogo de repuestos y materiales

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `codigo` | VARCHAR(50) | UNIQUE, NOT NULL | Código del repuesto |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre del repuesto |
| `categoria` | VARCHAR(100) | NULL | Categoría (Filtros, Aceites, etc.) |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL | Precio unitario actual |
| `stock_actual` | INT | DEFAULT 0 | Stock disponible |
| `stock_minimo` | INT | DEFAULT 0 | Stock mínimo antes de alerta |
| `proveedor` | VARCHAR(255) | NULL | Nombre del proveedor |
| `ubicacion` | VARCHAR(100) | NULL | Ubicación en almacén |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- UNIQUE: `codigo`
- INDEX: `categoria`, `stock_actual`

**Check Constraints:**
- `stock_actual >= 0`
- `precio_unitario > 0`

---

### 6. **DetalleRepuesto**
**Descripción:** Relación muchos-a-muchos entre Tareas y Repuestos (registro de uso)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `tarea_id` | INT | FK, NOT NULL | Tarea donde se usó |
| `repuesto_id` | INT | FK, NOT NULL | Repuesto usado |
| `cantidad_usada` | INT | NOT NULL | Cantidad utilizada |
| `precio_unitario_momento` | DECIMAL(10,2) | NOT NULL | Precio histórico |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |

**Índices:**
- PK: `id`
- FK: `tarea_id` → `tarea(id)` ON DELETE CASCADE
- FK: `repuesto_id` → `repuesto(id)` ON DELETE RESTRICT
- INDEX: `tarea_id`, `repuesto_id`

**Lógica de Negocio:**
- Al crear, se descuenta del `stock_actual` del repuesto
- Se guarda el `precio_unitario_momento` para cálculos históricos

---

### 7. **PlanPreventivo**
**Descripción:** Planes de mantenimiento preventivo por vehículo

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `tipo_intervalo` | ENUM | NOT NULL | KM, Tiempo |
| `intervalo` | INT | NOT NULL | Cada X km o X días |
| `descripcion` | TEXT | NOT NULL | Descripción del mantenimiento |
| `activo` | BOOLEAN | DEFAULT true | Si está activo |
| `vehiculo_id` | INT | FK, NOT NULL | Vehículo asociado |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- FK: `vehiculo_id` → `vehiculo(id)` ON DELETE RESTRICT
- INDEX: `activo`, `vehiculo_id`

**Restricciones:**
- Solo un plan activo por vehículo (lógica en aplicación)

---

### 8. **Alerta**
**Descripción:** Alertas de mantenimiento preventivo

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `tipo` | ENUM | NOT NULL | MANTENIMIENTO_PREVENTIVO, STOCK_BAJO |
| `descripcion` | TEXT | NOT NULL | Descripción de la alerta |
| `prioridad` | ENUM | DEFAULT 'MEDIA' | BAJA, MEDIA, ALTA |
| `estado` | ENUM | DEFAULT 'Pendiente' | Pendiente, Resuelta, Ignorada |
| `vehiculo_id` | INT | FK, NULL | Vehículo relacionado (si aplica) |
| `fecha_generacion` | TIMESTAMP | DEFAULT NOW() | Cuándo se generó |
| `fecha_resolucion` | TIMESTAMP | NULL | Cuándo se resolvió |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Índices:**
- PK: `id`
- FK: `vehiculo_id` → `vehiculo(id)` ON DELETE SET NULL
- INDEX: `estado`, `tipo`, `fecha_generacion`

---

## 🔗 RELACIONES

### Relaciones 1:N (Uno a Muchos)

1. **Usuario → OrdenTrabajo**
   - Un mecánico puede tener muchas órdenes asignadas
   - FK: `orden_trabajo.mecanico_id` → `usuario.id`
   - ON DELETE: RESTRICT

2. **Vehiculo → OrdenTrabajo**
   - Un vehículo puede tener muchas órdenes
   - FK: `orden_trabajo.vehiculo_id` → `vehiculo.id`
   - ON DELETE: RESTRICT

3. **Vehiculo → PlanPreventivo**
   - Un vehículo tiene un plan preventivo
   - FK: `plan_preventivo.vehiculo_id` → `vehiculo.id`
   - ON DELETE: RESTRICT

4. **Vehiculo → Alerta**
   - Un vehículo puede tener muchas alertas
   - FK: `alerta.vehiculo_id` → `vehiculo.id`
   - ON DELETE: SET NULL

5. **OrdenTrabajo → Tarea**
   - Una orden puede tener muchas tareas
   - FK: `tarea.orden_trabajo_id` → `orden_trabajo.id`
   - ON DELETE: CASCADE

### Relaciones N:M (Muchos a Muchos)

6. **Tarea ↔ Repuesto** (a través de `DetalleRepuesto`)
   - Una tarea puede usar muchos repuestos
   - Un repuesto puede usarse en muchas tareas
   - Tabla intermedia: `detalle_repuesto`

---

## 🎯 REGLAS DE NEGOCIO EN BD

### Validaciones a Nivel de Base de Datos

1. **Usuario:**
   - Email formato válido (validación en app)
   - Password mínimo 12 caracteres con bcrypt (aplicación)

2. **Vehiculo:**
   - Patente formato chileno: `XXXX99` o `XX-XX-99`
   - Año entre 1990 y año actual + 1
   - Kilometraje >= 0

3. **OrdenTrabajo:**
   - Número único: `OT-YYYY-NNNNN`
   - Fecha cierre >= Fecha inicio
   - Costo real >= 0
   - Estado: flujo unidireccional (Pendiente → Asignada → EnProgreso → Finalizada)

4. **Tarea:**
   - No se puede cerrar OT si hay tareas pendientes

5. **Repuesto:**
   - Stock no puede ser negativo
   - Precio > 0

6. **DetalleRepuesto:**
   - Cantidad > 0
   - Al crear, descuenta stock automáticamente

---

## 📊 ÍNDICES Y PERFORMANCE

### Índices Principales

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_orden_trabajo_estado ON orden_trabajo(estado);
CREATE INDEX idx_orden_trabajo_fecha ON orden_trabajo(fecha_creacion DESC);
CREATE INDEX idx_vehiculo_estado ON vehiculo(estado);
CREATE INDEX idx_alerta_pendiente ON alerta(estado) WHERE estado = 'Pendiente';

-- Foreign Keys (automáticos con TypeORM)
CREATE INDEX idx_ot_vehiculo ON orden_trabajo(vehiculo_id);
CREATE INDEX idx_ot_mecanico ON orden_trabajo(mecanico_id);
CREATE INDEX idx_tarea_orden ON tarea(orden_trabajo_id);
```

---

## 🔒 SEGURIDAD

### Datos Sensibles

1. **Usuario.password_hash:**
   - Encriptado con bcrypt (cost factor 12)
   - NUNCA se retorna en API
   - Solo se compara para login

2. **Auditoría:**
   - Todos los campos `created_at` y `updated_at`
   - Soft deletes (activo=false) en lugar de DELETE

3. **Acceso:**
   - RBAC implementado a nivel de aplicación
   - Mecánicos solo ven sus OTs
   - Admin ve todo

---

## 📦 TAMAÑO ESTIMADO

| Tabla | Registros Estimados (1 año) | Tamaño Aprox |
|-------|---------------------------|--------------|
| Usuario | 50 | 10 KB |
| Vehiculo | 45 | 20 KB |
| OrdenTrabajo | 2,000 | 500 KB |
| Tarea | 8,000 | 1.5 MB |
| Repuesto | 500 | 100 KB |
| DetalleRepuesto | 15,000 | 800 KB |
| PlanPreventivo | 45 | 10 KB |
| Alerta | 1,000 | 200 KB |
| **TOTAL** | **~27,000** | **~3 MB** |

---

## ✅ CONCLUSIÓN

**Modelo normalizado en 3FN**  
**8 tablas principales**  
**Integridad referencial completa**  
**Preparado para 10+ usuarios concurrentes**  
**Optimizado con índices estratégicos**

---

**Versión:** 1.0  
**Estado:** Producción Ready ✅
