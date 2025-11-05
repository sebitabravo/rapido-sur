# 📋 Cómo Funciona el Sistema de Gestión de Mantenimiento de Rápido Sur

## 🎯 Objetivo del Sistema
Digitalizar completamente el proceso de mantenimiento de los 45 vehículos (buses y vans) de Rápido Sur, eliminando el papel y Excel para **reducir en 40% las fallas por mantenimiento atrasado**.

---

## 👥 Tres Tipos de Usuarios (RBAC)

### 1️⃣ **Administrador**
- Gestiona usuarios (crear, editar, desactivar)
- Acceso total a todos los reportes
- Exporta datos a CSV
- Tiene acceso a TODAS las funcionalidades

### 2️⃣ **Jefe de Mantenimiento** (El rol más importante para el flujo)
- ✅ Crea órdenes de trabajo
- ✅ Asigna mecánicos a las OT
- ✅ Ve todas las OT y su estado
- ✅ Cierra OT después de revisarlas
- ✅ Ve alertas preventivas
- ✅ Genera reportes

### 3️⃣ **Mecánico**
- Ve SOLO las OT asignadas a él
- Registra tareas realizadas
- Marca tareas como completadas
- Registra repuestos usados
- Ve historial del vehículo que está reparando

---

## 🔄 Flujo Principal: Órdenes de Trabajo (El Corazón del Sistema)

### **Paso 1: Creación** (Jefe de Mantenimiento)
1. El Jefe identifica necesidad de mantenimiento:
   - Viene de una **alerta preventiva** automática, O
   - Viene de un **reporte de falla** del conductor

2. Crea OT en el sistema:
   - Selecciona **vehículo** (de la lista que creaste)
   - Especifica **tipo**: Preventivo o Correctivo
   - Agrega **observaciones iniciales**

3. Sistema automáticamente:
   - Genera número único: `OT-2025-00001`
   - Asigna fecha de creación automática
   - Estado inicial: **Pendiente**

### **Paso 2: Asignación** (Jefe de Mantenimiento)
1. Jefe revisa disponibilidad de mecánicos
2. Asigna OT a un mecánico específico
3. Sistema cambia estado a: **Asignada**
4. Opcionalmente envía notificación al mecánico

### **Paso 3: Ejecución** (Mecánico)
1. Mecánico ve la OT en su dashboard
2. Revisa descripción y vehículo
3. Cambia estado a: **EnProgreso** cuando inicia
4. **Registra tareas realizadas**:
   - Descripción de la tarea
   - Tiempo invertido (horas)
5. **Registra repuestos usados**:
   - Selecciona repuesto
   - Cantidad utilizada
   - Sistema automáticamente:
     - Deduce del stock
     - Guarda precio en ese momento (para historial exacto)
6. Marca tareas como completadas

### **Paso 4: Revisión y Cierre** (Jefe de Mantenimiento)
1. Mecánico notifica que terminó
2. Jefe revisa que todas las tareas estén completas
3. Sistema valida: **NO permite cerrar si hay tareas incompletas**
4. Si todo está OK, Jefe cierra la OT
5. **Sistema automáticamente ejecuta**:
   - Actualiza `ultima_revision` del vehículo con fecha actual
   - Si es OT Preventiva: recalcula próximo mantenimiento
   - Calcula costo total (repuestos + mano de obra)
   - Cambia estado a: **Finalizada**
   - Guarda `fecha_cierre`

---

## 🔔 Sistema de Alertas Preventivas (Automático)

### **Cron Job Diario** (6:00 AM)
1. Recorre todos los vehículos activos
2. Obtiene su plan preventivo

### **Alerta por Kilometraje**
- Si tipo = KM
- Calcula: `kilometros_desde_ultima_revision`
- **Genera alerta**: 1,000 km ANTES del intervalo
- Ejemplo: Mantenimiento cada 10,000 km → Alerta a los 9,000 km

### **Alerta por Tiempo**
- Si tipo = Tiempo
- Calcula: `dias_desde_ultima_revision`
- **Genera alerta**: 7 días ANTES del intervalo
- Ejemplo: Mantenimiento cada 6 meses (180 días) → Alerta a los 173 días

### **Envío de Email**
- Agrupa todas las alertas generadas
- Email HTML con tabla:
  - Patente
  - Modelo
  - Razón (X km o X días desde último servicio)
  - Botón para crear OT
- Envía al email del Jefe de Mantenimiento

---

## 📊 Reportes

### **1. Reporte de Indisponibilidad**
- Calcula: `fecha_cierre - fecha_creacion`
- Muestra tiempo que el vehículo estuvo fuera de servicio
- Filtros: vehículo, rango de fechas

### **2. Reporte de Costos**
- Suma: repuestos (precio histórico) + mano de obra
- Filtros: vehículo, rango de fechas

### **3. Exportar a CSV**
- Admin puede exportar cualquier reporte

---

## 🗂️ Datos Principales

### **Vehículos**
- Patente (formato chileno: AB-CD-12 o ABCD-12)
- Marca, Modelo, Año
- Kilometraje actual
- Estado: Activo/Inactivo
- Última revisión

### **Plan Preventivo** (Para cada vehículo)
- Tipo intervalo: KM o Tiempo
- Intervalo: número (ej: 10000 km o 180 días)
- Descripción
- Activo/Inactivo

### **Orden de Trabajo**
- Número OT: OT-2025-00001
- Tipo: Preventivo/Correctivo
- Estado: Pendiente → Asignada → EnProgreso → Finalizada
- Vehículo asociado
- Mecánico asignado
- Fechas
- Costo total

### **Tareas** (Dentro de cada OT)
- Descripción
- Horas trabajadas
- Completada: Sí/No
- Mecánico asignado
- Repuestos usados

### **Repuestos**
- Nombre
- Código
- Precio unitario
- Stock disponible

---

## 🎯 Validaciones Críticas

✅ **NO** se puede cerrar OT con tareas incompletas
✅ **NO** se puede registrar repuesto con cantidad > stock
✅ **NO** se puede editar OT que no está asignada a ti (mecánico)
✅ **SIEMPRE** se valida que el vehículo existe y está activo

---

## 📱 Acceso por Rol

| Funcionalidad | Admin | Jefe Mantenimiento | Mecánico |
|--------------|-------|-------------------|----------|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Crear vehículos | ✅ | ✅ | ❌ |
| Crear OT | ✅ | ✅ | ❌ |
| Asignar mecánico | ✅ | ✅ | ❌ |
| Ver todas las OT | ✅ | ✅ | ❌ |
| Ver solo mis OT | - | - | ✅ |
| Registrar trabajo | ✅ | ✅ | ✅ |
| Cerrar OT | ✅ | ✅ | ❌ |
| Ver alertas | ✅ | ✅ | ❌ |
| Generar reportes | ✅ | ✅ | ❌ |
| Exportar CSV | ✅ | ❌ | ❌ |

---

## 🚀 Flujo de Datos

```
VEHÍCULO → PLAN PREVENTIVO → ALERTA (automática)
    ↓
ORDEN DE TRABAJO (creada por Jefe)
    ↓
ASIGNACIÓN (a Mecánico)
    ↓
TAREAS + REPUESTOS (registrados por Mecánico)
    ↓
CIERRE (validado por Jefe)
    ↓
REPORTES (disponibles para análisis)
```

---

**Última actualización**: Noviembre 2025
**Versión del sistema**: MVP 1.0
