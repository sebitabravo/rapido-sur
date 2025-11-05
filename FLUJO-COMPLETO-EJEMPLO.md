# 🚌 Ejemplo Completo de Flujo de Trabajo - Sistema Rápido Sur

Este documento muestra un ejemplo práctico paso a paso de cómo funciona el sistema desde la creación de un vehículo hasta la generación de reportes.

---

## 📋 Escenario del Ejemplo

**Empresa**: Rápido Sur
**Vehículo**: Bus Mercedes-Benz Sprinter 2023
**Situación**: Nuevo vehículo que necesita su primer mantenimiento preventivo
**Involucrados**:
- Admin: María González (admin@rapidosur.cl)
- Jefe de Mantenimiento: Juan Pérez (juan.perez@rapidosur.cl)
- Mecánico: Carlos Rojas (carlos.rojas@rapidosur.cl)

---

## 🔐 PASO 0: Usuarios ya Creados

El sistema ya tiene estos usuarios configurados:

### Admin (María González)
```json
{
  "email": "admin@rapidosur.cl",
  "password": "Admin123!",
  "nombre_completo": "María González",
  "rol": "Administrador",
  "activo": true
}
```

### Jefe de Mantenimiento (Juan Pérez)
```json
{
  "email": "juan.perez@rapidosur.cl",
  "password": "Jefe123!",
  "nombre_completo": "Juan Pérez",
  "rol": "JefeMantenimiento",
  "activo": true
}
```

### Mecánico (Carlos Rojas)
```json
{
  "email": "carlos.rojas@rapidosur.cl",
  "password": "Meca123!",
  "nombre_completo": "Carlos Rojas",
  "rol": "Mecanico",
  "activo": true
}
```

---

## 🚗 PASO 1: Crear Vehículo

**Quién**: Jefe de Mantenimiento (Juan Pérez)
**Cuándo**: 1 de noviembre de 2025
**Dónde**: Frontend → Gestión de Vehículos → Agregar Vehículo

### Formulario Completo:
```json
{
  "patente": "ABCD-12",
  "marca": "Mercedes-Benz",
  "modelo": "Sprinter 515 CDI",
  "anno": 2023,
  "kilometraje_actual": 15000
}
```

### Lo que hace el Backend:
1. Valida formato de patente chilena: ✅ `ABCD-12` cumple regex
2. Valida año: ✅ 2023 está entre 1900 y 2026
3. Valida kilometraje: ✅ 15000 >= 0
4. Crea registro en tabla `vehiculos`:

```sql
INSERT INTO vehiculos (
  patente,
  marca,
  modelo,
  anno,
  kilometraje_actual,
  estado,
  created_at,
  updated_at
) VALUES (
  'ABCD-12',
  'Mercedes-Benz',
  'Sprinter 515 CDI',
  2023,
  15000,
  'Activo',
  '2025-11-01 10:00:00',
  '2025-11-01 10:00:00'
);
```

### Resultado:
```json
{
  "id": 1,
  "patente": "ABCD-12",
  "marca": "Mercedes-Benz",
  "modelo": "Sprinter 515 CDI",
  "anno": 2023,
  "kilometraje_actual": 15000,
  "estado": "Activo",
  "ultima_revision": null,
  "created_at": "2025-11-01T10:00:00.000Z",
  "updated_at": "2025-11-01T10:00:00.000Z"
}
```

✅ **Vehículo creado exitosamente con ID: 1**

---

## 📅 PASO 2: Configurar Plan Preventivo

**Quién**: Jefe de Mantenimiento (Juan Pérez)
**Cuándo**: 1 de noviembre de 2025
**Dónde**: Frontend → Vehículo ABCD-12 → Plan Preventivo

### Formulario Completo:
```json
{
  "vehiculo_id": 1,
  "tipo_intervalo": "KM",
  "intervalo": 10000,
  "descripcion": "Mantenimiento preventivo cada 10,000 km: cambio de aceite, filtros, revisión de frenos y suspensión",
  "activo": true
}
```

### Lo que hace el Backend:
1. Valida que vehículo existe: ✅ ID 1 existe
2. Valida tipo_intervalo: ✅ es "KM" o "Tiempo"
3. Valida intervalo: ✅ 10000 > 0
4. Crea registro en tabla `planes_preventivos`:

```sql
INSERT INTO planes_preventivos (
  vehiculo_id,
  tipo_intervalo,
  intervalo,
  descripcion,
  activo,
  created_at,
  updated_at
) VALUES (
  1,
  'KM',
  10000,
  'Mantenimiento preventivo cada 10,000 km: cambio de aceite, filtros, revisión de frenos y suspensión',
  true,
  '2025-11-01 10:15:00',
  '2025-11-01 10:15:00'
);
```

✅ **Plan preventivo configurado: cada 10,000 km**

---

## 🔔 PASO 3: Sistema Genera Alerta Automática

**Cuándo**: 10 de noviembre de 2025 a las 6:00 AM
**Qué**: Cron job diario ejecuta verificación de alertas

### Cálculo Automático:

1. **Obtiene datos del vehículo**:
   - Kilometraje actual: 15,000 km
   - Última revisión: null (nunca ha tenido mantenimiento)
   - Plan: cada 10,000 km

2. **Calcula si necesita alerta**:
   ```javascript
   // Como ultima_revision es null, asume que necesita primer mantenimiento
   const km_desde_ultima = 15000 - 0 // null se trata como 0
   const intervalo_alerta = 10000 - 1000 // Alerta 1,000 km antes

   if (km_desde_ultima >= intervalo_alerta) {
     // 15000 >= 9000 → ✅ GENERA ALERTA
     crearAlerta()
   }
   ```

3. **Crea registro en tabla `alertas`**:
```sql
INSERT INTO alertas (
  vehiculo_id,
  tipo,
  mensaje,
  estado,
  fecha_generacion,
  created_at,
  updated_at
) VALUES (
  1,
  'Preventivo',
  'El vehículo ABCD-12 (Mercedes-Benz Sprinter 515 CDI) requiere mantenimiento preventivo. Ha recorrido 15,000 km desde la última revisión. Plan: cada 10,000 km',
  'Pendiente',
  '2025-11-10 06:00:00',
  '2025-11-10 06:00:00',
  '2025-11-10 06:00:00'
);
```

4. **Envía email a Juan Pérez**:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Alertas de Mantenimiento Preventivo - Rápido Sur</title>
</head>
<body>
  <h1>🚨 Alertas de Mantenimiento Preventivo</h1>
  <p>Los siguientes vehículos requieren mantenimiento:</p>

  <table border="1">
    <tr>
      <th>Patente</th>
      <th>Modelo</th>
      <th>Razón</th>
      <th>Acción</th>
    </tr>
    <tr>
      <td>ABCD-12</td>
      <td>Mercedes-Benz Sprinter 515 CDI</td>
      <td>15,000 km desde última revisión (Plan: cada 10,000 km)</td>
      <td><button>Crear Orden de Trabajo</button></td>
    </tr>
  </table>

  <p>Generado: 10 de noviembre de 2025 a las 06:00 hrs</p>
</body>
</html>
```

✅ **Email enviado a juan.perez@rapidosur.cl**

---

## 📝 PASO 4: Crear Orden de Trabajo

**Quién**: Jefe de Mantenimiento (Juan Pérez)
**Cuándo**: 10 de noviembre de 2025 a las 9:00 AM
**Dónde**: Frontend → Órdenes de Trabajo → Crear OT

Juan abre su email, ve la alerta y decide crear la orden de trabajo.

### Formulario Completo:
```json
{
  "vehiculo_id": 1,
  "tipo": "Preventivo",
  "descripcion": "Mantenimiento preventivo programado según plan. Vehículo con 15,000 km. Revisar: aceite, filtros, frenos, suspensión.",
  "prioridad": "Media",
  "observaciones_iniciales": "Vehículo reportado sin problemas mecánicos. Mantenimiento preventivo de rutina."
}
```

### Lo que hace el Backend:

1. **Genera número único de OT**:
   ```javascript
   const year = 2025
   const lastOT = await findLastOTOfYear(2025) // null
   const sequence = lastOT ? lastOT.sequence + 1 : 1
   const numero_ot = `OT-${year}-${sequence.toString().padStart(5, '0')}`
   // Resultado: "OT-2025-00001"
   ```

2. **Crea registro en tabla `ordenes_trabajo`**:
```sql
INSERT INTO ordenes_trabajo (
  numero_ot,
  vehiculo_id,
  tipo,
  estado,
  descripcion,
  prioridad,
  observaciones_iniciales,
  fecha_creacion,
  created_at,
  updated_at
) VALUES (
  'OT-2025-00001',
  1,
  'Preventivo',
  'Pendiente',
  'Mantenimiento preventivo programado según plan. Vehículo con 15,000 km. Revisar: aceite, filtros, frenos, suspensión.',
  'Media',
  'Vehículo reportado sin problemas mecánicos. Mantenimiento preventivo de rutina.',
  '2025-11-10 09:00:00',
  '2025-11-10 09:00:00',
  '2025-11-10 09:00:00'
);
```

✅ **Orden de Trabajo creada: OT-2025-00001**

---

## 👨‍🔧 PASO 5: Asignar Mecánico

**Quién**: Jefe de Mantenimiento (Juan Pérez)
**Cuándo**: 10 de noviembre de 2025 a las 9:05 AM
**Dónde**: Frontend → OT-2025-00001 → Asignar Mecánico

### Acción:
```json
{
  "orden_trabajo_id": 1,
  "mecanico_id": 3,  // ID de Carlos Rojas
  "fecha_asignacion": "2025-11-10T09:05:00.000Z"
}
```

### Lo que hace el Backend:
```sql
UPDATE ordenes_trabajo
SET
  mecanico_asignado_id = 3,
  estado = 'Asignada',
  fecha_asignacion = '2025-11-10 09:05:00',
  updated_at = '2025-11-10 09:05:00'
WHERE id = 1;
```

### Resultado:
```json
{
  "id": 1,
  "numero_ot": "OT-2025-00001",
  "vehiculo_id": 1,
  "mecanico_asignado_id": 3,
  "tipo": "Preventivo",
  "estado": "Asignada",
  "fecha_creacion": "2025-11-10T09:00:00.000Z",
  "fecha_asignacion": "2025-11-10T09:05:00.000Z"
}
```

✅ **OT asignada a Carlos Rojas**

---

## 🔧 PASO 6: Mecánico Ejecuta el Trabajo

**Quién**: Mecánico (Carlos Rojas)
**Cuándo**: 10-11 de noviembre de 2025
**Dónde**: Frontend → Mis Órdenes de Trabajo → OT-2025-00001

### 6.1 Iniciar Trabajo (10 nov, 10:00 AM)
Carlos ve la OT en su dashboard y comienza a trabajar.

```sql
UPDATE ordenes_trabajo
SET
  estado = 'EnProgreso',
  fecha_inicio = '2025-11-10 10:00:00',
  updated_at = '2025-11-10 10:00:00'
WHERE id = 1;
```

### 6.2 Registrar Primera Tarea (10 nov, 12:00 PM)
**Tarea**: Cambio de aceite de motor

```json
{
  "orden_trabajo_id": 1,
  "descripcion": "Cambio de aceite de motor 15W-40. Drenado, cambio de filtro y rellenado.",
  "horas_trabajadas": 2,
  "mecanico_id": 3,
  "completada": true
}
```

```sql
INSERT INTO tareas (
  orden_trabajo_id,
  descripcion,
  horas_trabajadas,
  mecanico_id,
  completada,
  fecha_completada,
  created_at,
  updated_at
) VALUES (
  1,
  'Cambio de aceite de motor 15W-40. Drenado, cambio de filtro y rellenado.',
  2,
  3,
  true,
  '2025-11-10 12:00:00',
  '2025-11-10 12:00:00',
  '2025-11-10 12:00:00'
);
-- Resultado: tarea_id = 1
```

### 6.3 Registrar Repuestos para Tarea 1

**Repuesto 1**: Aceite de Motor
```json
{
  "tarea_id": 1,
  "repuesto_id": 10,  // Aceite Motor 15W-40
  "cantidad_usada": 8,
  "precio_unitario_momento": 8500  // Precio al momento de uso
}
```

```sql
-- Primero verifica stock
SELECT cantidad_stock FROM repuestos WHERE id = 10;
-- Resultado: 50 litros disponibles ✅

-- Registra uso
INSERT INTO detalles_repuestos (
  tarea_id,
  repuesto_id,
  cantidad_usada,
  precio_unitario_momento,
  created_at,
  updated_at
) VALUES (
  1,
  10,
  8,
  8500,
  '2025-11-10 12:00:00',
  '2025-11-10 12:00:00'
);

-- Deduce del stock
UPDATE repuestos
SET
  cantidad_stock = cantidad_stock - 8,
  updated_at = '2025-11-10 12:00:00'
WHERE id = 10;
-- Nuevo stock: 42 litros
```

**Repuesto 2**: Filtro de Aceite
```json
{
  "tarea_id": 1,
  "repuesto_id": 11,  // Filtro aceite MB Sprinter
  "cantidad_usada": 1,
  "precio_unitario_momento": 12500
}
```

```sql
INSERT INTO detalles_repuestos (
  tarea_id,
  repuesto_id,
  cantidad_usada,
  precio_unitario_momento,
  created_at,
  updated_at
) VALUES (
  1,
  11,
  1,
  12500,
  '2025-11-10 12:00:00',
  '2025-11-10 12:00:00'
);

UPDATE repuestos
SET cantidad_stock = cantidad_stock - 1
WHERE id = 11;
```

**Costo parcial Tarea 1**:
- Aceite: 8 x $8,500 = $68,000
- Filtro: 1 x $12,500 = $12,500
- **Subtotal repuestos**: $80,500
- **Mano de obra**: 2 horas x $15,000 = $30,000
- **Total Tarea 1**: $110,500

---

### 6.4 Registrar Segunda Tarea (10 nov, 3:00 PM)
**Tarea**: Cambio de filtro de aire

```json
{
  "orden_trabajo_id": 1,
  "descripcion": "Reemplazo de filtro de aire de motor. Limpieza de carcasa.",
  "horas_trabajadas": 0.5,
  "mecanico_id": 3,
  "completada": true
}
```

```sql
INSERT INTO tareas (...) VALUES (...);
-- Resultado: tarea_id = 2
```

**Repuesto**: Filtro de Aire
```json
{
  "tarea_id": 2,
  "repuesto_id": 12,
  "cantidad_usada": 1,
  "precio_unitario_momento": 18000
}
```

**Costo Tarea 2**:
- Filtro aire: $18,000
- Mano de obra: 0.5 h x $15,000 = $7,500
- **Total Tarea 2**: $25,500

---

### 6.5 Registrar Tercera Tarea (11 nov, 10:00 AM)
**Tarea**: Revisión y ajuste de frenos

```json
{
  "orden_trabajo_id": 1,
  "descripcion": "Revisión completa sistema de frenos. Medición de pastillas y discos. Ajuste de freno de mano. Todo en buen estado.",
  "horas_trabajadas": 1.5,
  "mecanico_id": 3,
  "completada": true
}
```

**Sin repuestos usados** (solo revisión)

**Costo Tarea 3**:
- Mano de obra: 1.5 h x $15,000 = $22,500
- **Total Tarea 3**: $22,500

---

### 6.6 Registrar Cuarta Tarea (11 nov, 1:00 PM)
**Tarea**: Revisión de suspensión y neumáticos

```json
{
  "orden_trabajo_id": 1,
  "descripcion": "Inspección de amortiguadores, bujes y rotulas. Revisión de presión y desgaste de neumáticos. Todo en condiciones normales.",
  "horas_trabajadas": 1,
  "mecanico_id": 3,
  "completada": true
}
```

**Sin repuestos usados**

**Costo Tarea 4**:
- Mano de obra: 1 h x $15,000 = $15,000
- **Total Tarea 4**: $15,000

---

✅ **Trabajo completado por Carlos Rojas**
- **Total de tareas**: 4 (todas completadas)
- **Total horas**: 5 horas
- **Total repuestos**: $110,500
- **Total mano de obra**: $75,000
- **COSTO TOTAL**: $185,500

---

## ✅ PASO 7: Cerrar Orden de Trabajo

**Quién**: Jefe de Mantenimiento (Juan Pérez)
**Cuándo**: 11 de noviembre de 2025 a las 2:30 PM
**Dónde**: Frontend → OT-2025-00001 → Cerrar OT

### Validaciones Antes de Cerrar:
```javascript
// Backend valida automáticamente
const tareas = await getTareasByOrdenTrabajo(1)
const tareasIncompletas = tareas.filter(t => !t.completada)

if (tareasIncompletas.length > 0) {
  throw new BadRequestException('No se puede cerrar la OT. Hay tareas incompletas.')
}
// ✅ Todas las 4 tareas están completadas
```

### Acción de Cierre:
```json
{
  "orden_trabajo_id": 1,
  "observaciones_cierre": "Mantenimiento preventivo completado satisfactoriamente. Vehículo en óptimas condiciones. Todas las revisiones OK.",
  "fecha_cierre": "2025-11-11T14:30:00.000Z"
}
```

### Lo que hace el Backend Automáticamente:

1. **Calcula costo total**:
```sql
-- Suma repuestos
SELECT SUM(cantidad_usada * precio_unitario_momento) as costo_repuestos
FROM detalles_repuestos dr
JOIN tareas t ON t.id = dr.tarea_id
WHERE t.orden_trabajo_id = 1;
-- Resultado: $110,500

-- Suma mano de obra
SELECT SUM(horas_trabajadas * 15000) as costo_mano_obra
FROM tareas
WHERE orden_trabajo_id = 1;
-- Resultado: $75,000

-- Total
SET @costo_total = 110500 + 75000; -- $185,500
```

2. **Actualiza orden de trabajo**:
```sql
UPDATE ordenes_trabajo
SET
  estado = 'Finalizada',
  fecha_cierre = '2025-11-11 14:30:00',
  observaciones_cierre = 'Mantenimiento preventivo completado satisfactoriamente. Vehículo en óptimas condiciones. Todas las revisiones OK.',
  costo_total = 185500,
  updated_at = '2025-11-11 14:30:00'
WHERE id = 1;
```

3. **Actualiza vehículo** (porque es OT Preventiva):
```sql
UPDATE vehiculos
SET
  ultima_revision = '2025-11-11 14:30:00',
  kilometraje_actual = 15000,  -- Se puede actualizar si cambió
  updated_at = '2025-11-11 14:30:00'
WHERE id = 1;
```

4. **Recalcula próximo mantenimiento**:
```javascript
// Como tipo_intervalo = 'KM' e intervalo = 10000
const proximo_mantenimiento_km = 15000 + 10000 // = 25000 km
const alerta_en_km = 25000 - 1000 // = 24000 km

// El sistema generará alerta cuando kilometraje_actual >= 24000
```

5. **Marca alerta como resuelta**:
```sql
UPDATE alertas
SET
  estado = 'Resuelta',
  fecha_resolucion = '2025-11-11 14:30:00',
  updated_at = '2025-11-11 14:30:00'
WHERE vehiculo_id = 1 AND estado = 'Pendiente';
```

✅ **Orden de Trabajo OT-2025-00001 CERRADA**

---

## 📊 PASO 8: Generar Reportes

**Quién**: Jefe de Mantenimiento (Juan Pérez) o Admin (María González)
**Cuándo**: 15 de noviembre de 2025
**Dónde**: Frontend → Reportes

### 8.1 Reporte de Indisponibilidad

**Filtros aplicados**:
```json
{
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-15",
  "vehiculo_id": 1  // Opcional
}
```

**Consulta SQL**:
```sql
SELECT
  v.patente,
  v.marca,
  v.modelo,
  ot.numero_ot,
  ot.tipo,
  ot.fecha_creacion,
  ot.fecha_cierre,
  TIMESTAMPDIFF(HOUR, ot.fecha_creacion, ot.fecha_cierre) as horas_indisponible,
  TIMESTAMPDIFF(DAY, ot.fecha_creacion, ot.fecha_cierre) as dias_indisponible
FROM ordenes_trabajo ot
JOIN vehiculos v ON v.id = ot.vehiculo_id
WHERE ot.estado = 'Finalizada'
  AND ot.fecha_creacion BETWEEN '2025-11-01' AND '2025-11-15'
  AND ot.vehiculo_id = 1;
```

**Resultado**:
```json
{
  "reporte": "Indisponibilidad de Vehículos",
  "periodo": {
    "desde": "2025-11-01",
    "hasta": "2025-11-15"
  },
  "datos": [
    {
      "patente": "ABCD-12",
      "marca": "Mercedes-Benz",
      "modelo": "Sprinter 515 CDI",
      "numero_ot": "OT-2025-00001",
      "tipo": "Preventivo",
      "fecha_creacion": "2025-11-10T09:00:00.000Z",
      "fecha_cierre": "2025-11-11T14:30:00.000Z",
      "horas_indisponible": 29.5,
      "dias_indisponible": 1.23
    }
  ],
  "resumen": {
    "total_ordenes": 1,
    "promedio_dias_indisponible": 1.23,
    "total_dias_perdidos": 1.23
  }
}
```

**Interpretación**: El vehículo ABCD-12 estuvo fuera de servicio por **1.23 días** (29.5 horas) para mantenimiento preventivo.

---

### 8.2 Reporte de Costos

**Filtros aplicados**:
```json
{
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-15",
  "tipo": "Preventivo",
  "vehiculo_id": 1
}
```

**Consulta SQL**:
```sql
SELECT
  v.patente,
  v.marca,
  v.modelo,
  ot.numero_ot,
  ot.tipo,
  ot.fecha_creacion,
  ot.fecha_cierre,
  ot.costo_total,
  -- Desglose de costos
  (SELECT SUM(dr.cantidad_usada * dr.precio_unitario_momento)
   FROM detalles_repuestos dr
   JOIN tareas t ON t.id = dr.tarea_id
   WHERE t.orden_trabajo_id = ot.id) as costo_repuestos,
  (SELECT SUM(t.horas_trabajadas * 15000)
   FROM tareas t
   WHERE t.orden_trabajo_id = ot.id) as costo_mano_obra
FROM ordenes_trabajo ot
JOIN vehiculos v ON v.id = ot.vehiculo_id
WHERE ot.estado = 'Finalizada'
  AND ot.fecha_creacion BETWEEN '2025-11-01' AND '2025-11-15'
  AND ot.tipo = 'Preventivo'
  AND ot.vehiculo_id = 1;
```

**Resultado**:
```json
{
  "reporte": "Costos de Mantenimiento",
  "periodo": {
    "desde": "2025-11-01",
    "hasta": "2025-11-15"
  },
  "datos": [
    {
      "patente": "ABCD-12",
      "marca": "Mercedes-Benz",
      "modelo": "Sprinter 515 CDI",
      "numero_ot": "OT-2025-00001",
      "tipo": "Preventivo",
      "fecha_creacion": "2025-11-10T09:00:00.000Z",
      "fecha_cierre": "2025-11-11T14:30:00.000Z",
      "costo_total": 185500,
      "desglose": {
        "repuestos": 110500,
        "mano_obra": 75000
      },
      "detalle_repuestos": [
        {
          "nombre": "Aceite Motor 15W-40",
          "cantidad": 8,
          "precio_unitario": 8500,
          "subtotal": 68000
        },
        {
          "nombre": "Filtro Aceite MB Sprinter",
          "cantidad": 1,
          "precio_unitario": 12500,
          "subtotal": 12500
        },
        {
          "nombre": "Filtro Aire Motor",
          "cantidad": 1,
          "precio_unitario": 18000,
          "subtotal": 18000
        }
      ],
      "detalle_tareas": [
        {
          "descripcion": "Cambio de aceite de motor 15W-40",
          "horas": 2,
          "costo": 30000
        },
        {
          "descripcion": "Reemplazo de filtro de aire de motor",
          "horas": 0.5,
          "costo": 7500
        },
        {
          "descripcion": "Revisión completa sistema de frenos",
          "horas": 1.5,
          "costo": 22500
        },
        {
          "descripcion": "Revisión de suspensión y neumáticos",
          "horas": 1,
          "costo": 15000
        }
      ]
    }
  ],
  "resumen": {
    "total_ordenes": 1,
    "costo_total_periodo": 185500,
    "costo_total_repuestos": 110500,
    "costo_total_mano_obra": 75000,
    "costo_promedio_por_orden": 185500
  }
}
```

**Interpretación**:
- El mantenimiento preventivo del vehículo ABCD-12 costó **$185,500 CLP**
- El 60% del costo fue en repuestos ($110,500)
- El 40% del costo fue mano de obra ($75,000)
- Se trabajaron 5 horas en total

---

### 8.3 Exportar a CSV

**Quién**: Solo Admin (María González)
**Formato**: Archivo CSV descargable

**Reporte de Costos - costos_2025-11-01_2025-11-15.csv**:
```csv
Patente,Marca,Modelo,Numero OT,Tipo,Fecha Creacion,Fecha Cierre,Costo Total,Costo Repuestos,Costo Mano Obra,Horas Trabajadas
ABCD-12,Mercedes-Benz,Sprinter 515 CDI,OT-2025-00001,Preventivo,2025-11-10 09:00:00,2025-11-11 14:30:00,185500,110500,75000,5.0
```

✅ **Reportes generados exitosamente**

---

## 🔁 CICLO CONTINÚA: Próxima Alerta

### ¿Cuándo se generará la próxima alerta para ABCD-12?

**Datos actuales**:
- Kilometraje actual: 15,000 km
- Última revisión: 11 de noviembre de 2025
- Plan: cada 10,000 km
- Próximo mantenimiento: a los 25,000 km
- Alerta se genera: a los 24,000 km (1,000 km antes)

**Escenario hipotético**:

1. **15 de diciembre de 2025**: El vehículo ha recorrido hasta 18,000 km
   - Cron job evalúa: 18,000 < 24,000 → ❌ No genera alerta

2. **10 de enero de 2026**: El vehículo alcanza 24,000 km
   - Cron job evalúa: 24,000 >= 24,000 → ✅ **GENERA ALERTA**
   - Email enviado a Juan Pérez

3. **11 de enero de 2026**: Juan crea OT-2026-00001 y el ciclo se repite

---

## 📈 Métricas de Éxito

Este flujo completo demuestra cómo el sistema logra el objetivo de **reducir en 40% las fallas por mantenimiento atrasado**:

### Antes (con Excel y papel):
- ❌ Mantenimientos olvidados
- ❌ Sin alertas automáticas
- ❌ Costos no registrados
- ❌ Sin trazabilidad
- ❌ Tiempo perdido buscando información

### Ahora (con el sistema):
- ✅ Alertas automáticas 1,000 km antes
- ✅ Toda la información centralizada
- ✅ Costos calculados automáticamente
- ✅ Historial completo por vehículo
- ✅ Reportes en segundos
- ✅ Acceso desde cualquier dispositivo

---

## 🎯 Resumen del Flujo Completo

| Paso | Actor | Tiempo | Resultado |
|------|-------|--------|-----------|
| 1. Crear vehículo | Jefe | 5 min | Vehículo ABCD-12 en sistema |
| 2. Configurar plan | Jefe | 3 min | Plan preventivo cada 10,000 km |
| 3. Alerta automática | Sistema | 0 min | Email enviado al Jefe |
| 4. Crear OT | Jefe | 2 min | OT-2025-00001 creada |
| 5. Asignar mecánico | Jefe | 1 min | OT asignada a Carlos |
| 6. Ejecutar trabajo | Mecánico | 5 horas | 4 tareas completadas |
| 7. Cerrar OT | Jefe | 2 min | OT cerrada, costo: $185,500 |
| 8. Generar reportes | Jefe/Admin | 1 min | Reportes de costos e indisponibilidad |

**Tiempo total de gestión**: ~15 minutos (sin contar ejecución del trabajo)
**Tiempo ahorrado vs. papel/Excel**: ~2 horas por OT

---

**Documento creado**: Noviembre 2025
**Última actualización**: Noviembre 2025
**Sistema**: Rápido Sur - MVP 1.0
