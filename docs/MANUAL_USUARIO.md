# MANUAL DE USUARIO
## Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur

---

**Versión del Sistema**: 1.0
**Fecha**: Diciembre 2025
**Audiencia**: Usuarios finales (Administrador, Jefe de Mantenimiento, Mecánicos)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Interfaz Principal](#3-interfaz-principal)
4. [Manual por Rol](#4-manual-por-rol)
   - [4.1 Administrador](#41-administrador)
   - [4.2 Jefe de Mantenimiento](#42-jefe-de-mantenimiento)
   - [4.3 Mecánico](#43-mecánico)
5. [Preguntas Frecuentes](#5-preguntas-frecuentes)
6. [Solución de Problemas](#6-solución-de-problemas)
7. [Glosario](#7-glosario)

---

## 1. Introducción

### 1.1 ¿Qué es este sistema?

El Sistema de Gestión de Mantenimiento Vehicular es una plataforma web diseñada para digitalizar y optimizar todos los procesos de mantenimiento de la flota de vehículos de Rápido Sur.

### 1.2 ¿Para qué sirve?

Este sistema permite:
- **Registrar y gestionar** toda la información de los 45 vehículos de la flota
- **Crear y controlar** órdenes de trabajo de mantenimiento
- **Recibir alertas automáticas** cuando un vehículo necesita mantenimiento preventivo
- **Gestionar inventario** de repuestos y su uso
- **Generar reportes** de costos, disponibilidad y tiempos de inactividad
- **Consultar historial completo** de mantenimiento de cada vehículo

### 1.3 Beneficios principales

✅ Elimina el uso de papel y planillas Excel
✅ Reduce fallas mecánicas por mantenimiento atrasado
✅ Controla costos de reparaciones
✅ Mejora la disponibilidad de vehículos
✅ Facilita la toma de decisiones con información en tiempo real

---

## 2. Acceso al Sistema

### 2.1 Requisitos técnicos

**Navegador web compatible**:
- Google Chrome (recomendado)
- Mozilla Firefox
- Microsoft Edge
- Safari

**Conexión a internet**: Requerida (sistema web)

**Dispositivos compatibles**:
- Computadores de escritorio
- Laptops
- Tablets (interfaz responsive)

### 2.2 Inicio de sesión

1. Abra su navegador web
2. Ingrese a la dirección: `https://rapido-sur.ejemplo.com` (URL proporcionada por su administrador)
3. Verá la pantalla de inicio de sesión:

```
┌────────────────────────────────────┐
│   RÁPIDO SUR                       │
│   Sistema de Mantenimiento         │
│                                    │
│   Email:    [____________]         │
│   Contraseña: [____________]       │
│                                    │
│   [ Iniciar Sesión ]               │
│                                    │
│   ¿Olvidó su contraseña?          │
└────────────────────────────────────┘
```

4. Ingrese su **email** y **contraseña**
5. Haga clic en **"Iniciar Sesión"**

**Importante**: Su usuario y contraseña inicial serán proporcionados por el Administrador del sistema.

### 2.3 Primera vez que ingresa

Cuando ingrese por primera vez, se recomienda:

1. **Cambiar su contraseña**:
   - Vaya a su perfil (ícono de usuario en la esquina superior derecha)
   - Seleccione "Cambiar contraseña"
   - Ingrese su contraseña actual
   - Ingrese su nueva contraseña (mínimo 8 caracteres)
   - Confirme la nueva contraseña
   - Guarde los cambios

2. **Verificar sus datos**:
   - Nombre completo
   - Email de contacto
   - Rol asignado

### 2.4 ¿Olvidó su contraseña?

1. En la pantalla de inicio de sesión, haga clic en "¿Olvidó su contraseña?"
2. Ingrese su email registrado
3. Recibirá un correo electrónico con instrucciones para restablecer su contraseña
4. Siga el enlace del correo
5. Ingrese su nueva contraseña
6. Inicie sesión con su nueva contraseña

### 2.5 Cerrar sesión

Para salir del sistema de forma segura:

1. Haga clic en su nombre de usuario (esquina superior derecha)
2. Seleccione "Cerrar Sesión"
3. Será redirigido a la pantalla de inicio de sesión

**Importante**: Siempre cierre sesión cuando termine de usar el sistema, especialmente en computadores compartidos.

---

## 3. Interfaz Principal

### 3.1 Elementos de la interfaz

Una vez que inicie sesión, verá:

```
┌────────────────────────────────────────────────────────────┐
│  RÁPIDO SUR | Mantenimiento     [Usuario ▼] [Cerrar Sesión]│
├────────────┬───────────────────────────────────────────────┤
│            │                                                │
│  MENÚ      │                                                │
│            │         CONTENIDO PRINCIPAL                    │
│  Dashboard │                                                │
│  Vehículos │                                                │
│  Órdenes   │                                                │
│  Alertas   │                                                │
│  Reportes  │                                                │
│  (etc.)    │                                                │
│            │                                                │
└────────────┴───────────────────────────────────────────────┘
```

**Componentes principales**:

1. **Barra superior**:
   - Logo y nombre de la empresa
   - Nombre de usuario y opciones de perfil
   - Botón de cerrar sesión

2. **Menú lateral** (izquierda):
   - Navegación entre módulos
   - Las opciones visibles dependen de su rol

3. **Área de contenido** (centro):
   - Muestra la información del módulo seleccionado
   - Formularios, tablas, gráficos, etc.

### 3.2 Navegación

Para navegar entre módulos:
- Haga clic en cualquier opción del menú lateral
- El contenido cambiará automáticamente

Módulos disponibles (según su rol):
- **Dashboard**: Resumen general del sistema
- **Vehículos**: Gestión de la flota
- **Órdenes de Trabajo**: Mantenimientos programados y correctivos
- **Alertas**: Vehículos que requieren mantenimiento
- **Repuestos**: Catálogo e inventario de partes
- **Usuarios**: Gestión de personal (solo Admin)
- **Reportes**: Informes y exportación de datos

---

## 4. Manual por Rol

Esta sección está organizada según su rol en el sistema. **Busque su rol** y siga las instrucciones correspondientes.

---

## 4.1 ADMINISTRADOR

Como Administrador, usted tiene acceso completo a todas las funcionalidades del sistema.

### 4.1.1 Dashboard del Administrador

Al iniciar sesión verá:
- **Total de vehículos** en la flota
- **Órdenes de trabajo activas** (pendientes, asignadas, en progreso)
- **Alertas pendientes** de atención
- **Usuarios activos** en el sistema
- **Resumen de costos** del último mes

### 4.1.2 Gestión de Usuarios

#### Ver lista de usuarios

1. En el menú lateral, haga clic en **"Usuarios"**
2. Verá una tabla con todos los usuarios:
   - Nombre completo
   - Email
   - Rol
   - Estado (Activo/Inactivo)
   - Acciones

#### Crear un nuevo usuario

1. En la página de Usuarios, haga clic en **"+ Nuevo Usuario"**
2. Complete el formulario:
   - **Nombre completo**: Nombre y apellido del usuario
   - **Email**: Correo electrónico (debe ser único)
   - **Contraseña**: Contraseña inicial (mínimo 8 caracteres)
   - **Confirmar contraseña**: Repita la contraseña
   - **Rol**: Seleccione entre:
     - Administrador
     - Jefe de Mantenimiento
     - Mecánico
   - **Activo**: Marque si el usuario estará activo desde el inicio
3. Haga clic en **"Guardar"**
4. El usuario recibirá un email con sus credenciales

**Importante**: Informe al nuevo usuario que debe cambiar su contraseña en el primer inicio de sesión.

#### Editar un usuario existente

1. En la lista de usuarios, haga clic en el ícono de **"Editar"** (lápiz) junto al usuario
2. Modifique los campos necesarios:
   - Nombre completo
   - Email
   - Rol
3. **NO puede cambiar la contraseña aquí** (el usuario debe hacerlo desde su perfil)
4. Haga clic en **"Guardar cambios"**

#### Desactivar un usuario

Para desactivar temporalmente un usuario (sin eliminarlo):

1. En la lista de usuarios, haga clic en el ícono de **"Editar"**
2. Desmarque la casilla **"Activo"**
3. Haga clic en **"Guardar cambios"**

**Efecto**: El usuario no podrá iniciar sesión hasta que sea reactivado.

#### Eliminar un usuario

**Advertencia**: Esta acción no se puede deshacer. Prefiera desactivar en lugar de eliminar.

1. En la lista de usuarios, haga clic en el ícono de **"Eliminar"** (papelera)
2. Confirme la acción en el mensaje de advertencia
3. El usuario será eliminado permanentemente

**Restricción**: No puede eliminar un usuario que tenga órdenes de trabajo asignadas.

### 4.1.3 Gestión de Vehículos

#### Ver lista de vehículos

1. En el menú lateral, haga clic en **"Vehículos"**
2. Verá una tabla con todos los vehículos:
   - Patente
   - Modelo
   - Año
   - Kilometraje actual
   - Estado
   - Última revisión
   - Acciones

#### Registrar un nuevo vehículo

1. En la página de Vehículos, haga clic en **"+ Nuevo Vehículo"**
2. Complete el formulario:
   - **Patente**: Placa del vehículo (ej: ABCD12 o AB1234, formato chileno)
   - **Modelo**: Marca y modelo (ej: Mercedes-Benz Sprinter)
   - **Año**: Año de fabricación (entre 1990 y año actual)
   - **Kilometraje actual**: Odómetro actual (solo números)
   - **Capacidad de pasajeros**: Número de asientos
   - **Tipo de combustible**: Diesel, Gasolina, GNC, Eléctrico
   - **Fecha de última revisión**: Última vez que recibió mantenimiento
   - **Observaciones**: Notas adicionales (opcional)
3. Haga clic en **"Guardar"**

**Validaciones automáticas**:
- La patente debe ser única
- El kilometraje no puede ser negativo
- El año debe ser válido

#### Editar información de un vehículo

1. En la lista de vehículos, haga clic en **"Editar"** junto al vehículo
2. Modifique los campos necesarios
3. Haga clic en **"Guardar cambios"**

**Campos que puede editar**:
- Modelo
- Kilometraje actual (solo puede aumentar)
- Observaciones

**Campos que NO puede editar**:
- Patente (identificador único)
- Año

#### Actualizar kilometraje

Es importante mantener actualizado el kilometraje para que las alertas preventivas funcionen correctamente.

1. En la lista de vehículos, haga clic en **"Actualizar km"**
2. Ingrese el **nuevo kilometraje**
3. Haga clic en **"Actualizar"**

**Validación**: El nuevo kilometraje debe ser mayor que el actual.

**Recomendación**: Actualice el kilometraje semanalmente o cada vez que un vehículo regrese de ruta.

#### Ver historial de un vehículo

1. En la lista de vehículos, haga clic en **"Ver Historial"**
2. Verá todas las órdenes de trabajo relacionadas con ese vehículo:
   - Número de OT
   - Tipo (Preventivo/Correctivo)
   - Fecha de creación
   - Fecha de cierre
   - Estado
   - Costo total
   - Mecánico asignado

**Utilidad**: Identifique patrones de fallas, vehículos problemáticos, costos acumulados.

#### Configurar plan preventivo

Cada vehículo debe tener un plan preventivo activo para recibir alertas automáticas.

1. En la lista de vehículos, haga clic en **"Plan Preventivo"**
2. Si no existe un plan, haga clic en **"Crear Plan"**
3. Complete:
   - **Tipo de intervalo**:
     - **Por Kilometraje**: Alerta cada X kilómetros (ej: cada 10,000 km)
     - **Por Tiempo**: Alerta cada X días (ej: cada 180 días = 6 meses)
   - **Intervalo**: Número de km o días
   - **Descripción**: Qué incluye el mantenimiento (ej: "Cambio de aceite, filtros, revisión de frenos")
   - **Activo**: Marcar para activar alertas
4. Haga clic en **"Guardar"**

**Ejemplo de configuración**:
- Tipo: Por Kilometraje
- Intervalo: 10000
- Descripción: "Mantenimiento preventivo cada 10,000 km: aceite, filtros, frenos"
- Activo: ✅

**Resultado**: El sistema enviará una alerta cuando el vehículo llegue a 9,000 km desde su última revisión.

### 4.1.4 Gestión de Reportes

#### Reporte de Costos

Muestra el costo total de mantenimiento por vehículo.

1. En el menú lateral, haga clic en **"Reportes"**
2. Seleccione **"Reporte de Costos"**
3. Configure los filtros:
   - **Vehículo**: Seleccione uno específico o "Todos"
   - **Fecha desde**: Fecha de inicio del período
   - **Fecha hasta**: Fecha de fin del período
4. Haga clic en **"Generar Reporte"**

**El reporte muestra**:
- Costo de repuestos por vehículo
- Costo de mano de obra
- Costo total
- Desglose por tipo de mantenimiento (preventivo vs correctivo)

5. Haga clic en **"Exportar a CSV"** para descargar el reporte

#### Reporte de Disponibilidad

Muestra cuánto tiempo cada vehículo estuvo disponible vs en mantenimiento.

1. En **"Reportes"**, seleccione **"Reporte de Disponibilidad"**
2. Configure filtros de fecha
3. Haga clic en **"Generar Reporte"**

**El reporte muestra**:
- Días totales del período
- Días en servicio
- Días en mantenimiento
- Porcentaje de disponibilidad

#### Reporte de Tiempos de Inactividad

Muestra cuánto tiempo tardó cada orden de trabajo.

1. En **"Reportes"**, seleccione **"Tiempos de Inactividad"**
2. Configure filtros
3. Haga clic en **"Generar Reporte"**

**El reporte muestra**:
- Número de OT
- Vehículo
- Fecha de apertura
- Fecha de cierre
- Días de inactividad
- Tipo de mantenimiento

#### Exportar reportes

Todos los reportes pueden exportarse a CSV para análisis en Excel:

1. Después de generar un reporte, haga clic en **"Exportar a CSV"**
2. El archivo se descargará automáticamente
3. Abra con Excel, Google Sheets u otra herramienta

### 4.1.5 Gestión de Repuestos

#### Ver catálogo de repuestos

1. En el menú lateral, haga clic en **"Repuestos"**
2. Verá una tabla con:
   - Código/ID
   - Nombre del repuesto
   - Precio unitario
   - Stock disponible
   - Acciones

#### Agregar un nuevo repuesto

1. Haga clic en **"+ Nuevo Repuesto"**
2. Complete:
   - **Nombre**: Descripción del repuesto (ej: "Filtro de aceite Bosch P3274")
   - **Precio unitario**: Precio en pesos chilenos (ej: 15000)
   - **Cantidad en stock**: Unidades disponibles
   - **Stock mínimo**: Cantidad mínima antes de alertar (opcional)
   - **Proveedor**: Nombre del proveedor (opcional)
3. Haga clic en **"Guardar"**

#### Editar repuesto

1. En la lista, haga clic en **"Editar"**
2. Modifique precio, stock, etc.
3. Haga clic en **"Guardar cambios"**

#### Reponer stock

Cuando reciba más unidades de un repuesto:

1. Haga clic en **"Reponer Stock"** junto al repuesto
2. Ingrese la **cantidad recibida**
3. Haga clic en **"Actualizar"**

**El sistema sumará** automáticamente las nuevas unidades al stock actual.

### 4.1.6 Otras funciones administrativas

#### Configuración del sistema

1. Vaya a **"Configuración"** en el menú
2. Puede ajustar:
   - **Email de alertas**: A dónde se envían las alertas preventivas
   - **Umbral de alerta de km**: Cuántos km antes alertar (default: 1000)
   - **Umbral de alerta de días**: Cuántos días antes alertar (default: 7)
   - **Horario del cron de alertas**: Hora del día para verificar alertas (default: 06:00)

#### Auditoría del sistema

1. Vaya a **"Auditoría"**
2. Verá un log de:
   - Usuario que realizó la acción
   - Tipo de acción (crear, editar, eliminar)
   - Módulo afectado
   - Fecha y hora
   - IP de origen

**Utilidad**: Rastrear cambios, identificar errores, seguridad.

---

## 4.2 JEFE DE MANTENIMIENTO

Como Jefe de Mantenimiento, usted es responsable de crear órdenes de trabajo, asignar mecánicos, y supervisar todo el proceso de mantenimiento.

### 4.2.1 Dashboard del Jefe de Mantenimiento

Al iniciar sesión verá:
- **Alertas pendientes**: Vehículos que necesitan mantenimiento
- **OT pendientes de asignación**: Órdenes sin mecánico asignado
- **OT en progreso**: Trabajos que están siendo realizados
- **OT finalizadas hoy**: Trabajos completados en el día

### 4.2.2 Gestión de Alertas

#### Ver alertas de mantenimiento preventivo

1. En el menú lateral, haga clic en **"Alertas"**
2. Verá una lista de vehículos que necesitan mantenimiento:
   - Patente del vehículo
   - Modelo
   - Razón de la alerta (ej: "9,500 km desde última revisión - límite 10,000 km")
   - Tipo de alerta (Por KM / Por Tiempo)
   - Fecha de la alerta

**Códigos de color**:
- 🟡 Amarillo: Alerta preventiva (cerca del límite)
- 🔴 Rojo: Alerta crítica (límite superado)

#### Crear OT desde una alerta

Cuando vea una alerta, debe crear una orden de trabajo:

1. En la lista de alertas, haga clic en **"Crear OT"** junto al vehículo
2. El sistema pre-completará:
   - Vehículo
   - Tipo: Preventivo
   - Descripción: Basada en el plan preventivo
3. Agregue información adicional si es necesario
4. Haga clic en **"Crear Orden de Trabajo"**

**Resultado**: La alerta desaparecerá y se creará una OT en estado "Pendiente".

#### Recepción de alertas por email

Cada día a las 6:00 AM, recibirá un email con:
- Lista de vehículos que necesitan mantenimiento
- Razón de cada alerta
- Botón para acceder directamente al sistema

**Configure su email**:
- Hable con el Administrador para que registre su email
- Verifique que no caiga en spam
- Revise diariamente

### 4.2.3 Gestión de Órdenes de Trabajo

#### Ver todas las órdenes de trabajo

1. En el menú lateral, haga clic en **"Órdenes de Trabajo"**
2. Verá una tabla con todas las OT:
   - Número de OT (ej: OT-2025-00042)
   - Vehículo (patente)
   - Tipo (Preventivo/Correctivo)
   - Estado (Pendiente/Asignada/En Progreso/Finalizada)
   - Mecánico asignado
   - Fecha de creación
   - Acciones

#### Filtrar órdenes

Use los filtros para encontrar OT específicas:
- **Por estado**: Seleccione Pendiente, Asignada, En Progreso, o Finalizada
- **Por tipo**: Preventivo o Correctivo
- **Por vehículo**: Seleccione una patente
- **Por fecha**: Rango de fechas
- **Por mecánico**: Seleccione un mecánico

Haga clic en **"Aplicar Filtros"**.

#### Crear una nueva orden de trabajo

**Cuándo crear una OT**:
- Cuando reciba una alerta preventiva
- Cuando un conductor reporte una falla (correctivo)
- Cuando detecte un problema en inspección visual

**Pasos**:

1. Haga clic en **"+ Nueva Orden de Trabajo"**
2. Complete el formulario:

   **Datos básicos**:
   - **Vehículo**: Seleccione la patente del selector
   - **Tipo**:
     - **Preventivo**: Mantenimiento programado (cambio de aceite, revisión de frenos, etc.)
     - **Correctivo**: Reparación de falla (motor no arranca, fuga de aceite, etc.)
   - **Prioridad**: Alta, Media, Baja (opcional)
   - **Descripción**: Detalle el trabajo a realizar
     - Sea específico: "Cambio de aceite, filtro de aire y revisión de frenos delanteros"
     - No genérico: "Mantenimiento general"

   **Observaciones iniciales** (opcional):
   - Síntomas reportados por el conductor
   - Notas de inspección visual
   - Kilometraje al momento de crear la OT

3. Haga clic en **"Crear"**

**Resultado**:
- El sistema genera automáticamente un número de OT único (formato: OT-YYYY-NNNNN)
- La fecha de creación se registra automáticamente
- El estado inicial es **"Pendiente"**

#### Asignar un mecánico a una OT

Después de crear la OT (o si hay OT pendientes):

1. En la lista de OT, busque una en estado **"Pendiente"**
2. Haga clic en **"Asignar"**
3. Seleccione el mecánico del desplegable
4. (Opcional) Agregue una nota para el mecánico
5. Haga clic en **"Asignar Mecánico"**

**Resultado**:
- El estado cambia a **"Asignada"**
- El mecánico verá la OT en su dashboard
- (Opcional) Se envía notificación por email al mecánico

**Criterios de asignación**:
- Carga de trabajo actual del mecánico
- Especialización (mecánica eléctrica, motor, transmisión, etc.)
- Disponibilidad

#### Reasignar una OT

Si necesita cambiar el mecánico asignado:

1. Busque la OT
2. Haga clic en **"Reasignar"**
3. Seleccione el nuevo mecánico
4. Indique el motivo (opcional pero recomendado)
5. Haga clic en **"Reasignar"**

**Restricción**: No puede reasignar una OT en estado "Finalizada".

#### Revisar progreso de una OT

Para ver en qué estado está un trabajo:

1. Haga clic en el **número de OT** o en **"Ver Detalle"**
2. Verá:
   - **Datos generales**: Vehículo, tipo, estado, fechas
   - **Mecánico asignado**: Nombre y contacto
   - **Tareas**:
     - Lista de tareas creadas por el mecánico
     - Estado de cada tarea (Completada / Pendiente)
     - Tiempo invertido en cada tarea
   - **Repuestos utilizados**:
     - Nombre del repuesto
     - Cantidad usada
     - Precio unitario
     - Subtotal
   - **Costo total acumulado**: Suma de repuestos + mano de obra
   - **Comentarios del mecánico**: Notas sobre hallazgos o problemas

#### Cerrar una orden de trabajo

Cuando el mecánico notifique que terminó:

1. Vaya al detalle de la OT
2. **Revise que todas las tareas estén marcadas como completadas** ✅
   - Si hay tareas pendientes, el sistema NO permitirá cerrar la OT
3. **Revise los repuestos utilizados**
   - Verifique que sean coherentes con el trabajo
4. **Verifique el costo total**
   - Contraste con presupuesto estimado
5. (Opcional) **Inspeccione físicamente el vehículo**
   - Prueba de ruta
   - Verificación visual
6. Haga clic en **"Cerrar Orden de Trabajo"**
7. Complete:
   - **Observaciones finales**: Resultado del trabajo, hallazgos adicionales
   - **Calidad del trabajo**: Evaluación (1-5 estrellas) - opcional
8. Confirme el cierre

**El sistema ejecutará automáticamente**:
- ✅ Actualiza el estado a **"Finalizada"**
- ✅ Registra la fecha de cierre
- ✅ Actualiza la "última revisión" del vehículo con la fecha actual
- ✅ Si la OT es preventiva, **recalcula la próxima alerta**:
  - Si el plan es por KM: próxima alerta = kilometraje_actual + intervalo
  - Si el plan es por tiempo: próxima alerta = fecha_cierre + intervalo en días
- ✅ Calcula el costo total definitivo

**Importante**: Una vez cerrada, la OT NO puede reabrirse. Si necesita hacer correcciones, debe crear una nueva OT.

#### Cancelar una orden de trabajo

Si una OT ya no es necesaria:

1. Vaya al detalle de la OT
2. Haga clic en **"Cancelar OT"**
3. Indique el motivo
4. Confirme

**Restricción**: Solo puede cancelar OT en estado Pendiente o Asignada. Si está En Progreso o Finalizada, no se puede cancelar.

### 4.2.4 Gestión de Vehículos

Como Jefe de Mantenimiento, puede:
- **Ver todos los vehículos** y su estado
- **Actualizar kilometraje** cuando los vehículos regresen de ruta
- **Consultar historial de mantenimiento** de cada vehículo
- **Ver planes preventivos** configurados

**No puede**:
- Crear o eliminar vehículos (solo el Administrador)
- Modificar datos básicos del vehículo

#### Actualizar kilometraje de un vehículo

**Frecuencia recomendada**: Semanal o cada vez que un vehículo regrese de ruta larga.

1. Vaya a **"Vehículos"**
2. Busque el vehículo
3. Haga clic en **"Actualizar km"**
4. Ingrese el **kilometraje actual** (lectura del odómetro)
5. Haga clic en **"Actualizar"**

**Validación**: El nuevo kilometraje debe ser mayor que el anterior.

**Importancia**: El sistema usa este dato para calcular alertas preventivas por kilometraje.

### 4.2.5 Reportes

Como Jefe de Mantenimiento, puede generar:
- **Reporte de costos**: Cuánto gastó cada vehículo en mantenimiento
- **Reporte de disponibilidad**: Qué porcentaje del tiempo cada vehículo estuvo operativo
- **Reporte de tiempos de inactividad**: Cuánto tardó cada reparación

**Proceso**:
1. Vaya a **"Reportes"**
2. Seleccione el tipo de reporte
3. Configure filtros (vehículo, rango de fechas)
4. Haga clic en **"Generar"**
5. (Opcional) Exporte a CSV

**Uso recomendado**:
- Genere reportes mensuales para reuniones gerenciales
- Identifique vehículos con altos costos (candidatos para reemplazo)
- Identifique vehículos con alta disponibilidad (eficiencia)

---

## 4.3 MECÁNICO

Como Mecánico, usted recibe órdenes de trabajo asignadas, registra las tareas realizadas y los repuestos utilizados.

### 4.3.1 Dashboard del Mecánico

Al iniciar sesión verá:
- **OT asignadas a mí**: Trabajos que debe realizar
- **OT en progreso**: Trabajos que ya comenzó
- **OT completadas hoy**: Trabajos que finalizó en el día
- **Estadísticas personales**: Total de OT completadas, tiempo promedio, etc.

### 4.3.2 Ver mis órdenes de trabajo

1. En el menú lateral, haga clic en **"Mis Órdenes"**
2. Verá solo las OT **asignadas a usted**
3. Filtros disponibles:
   - Por estado (Asignada / En Progreso)
   - Por tipo (Preventivo / Correctivo)
   - Por vehículo

**No verá**: OT asignadas a otros mecánicos (por seguridad y privacidad).

### 4.3.3 Iniciar una orden de trabajo

Cuando vaya a comenzar un trabajo:

1. En **"Mis Órdenes"**, busque la OT asignada
2. Haga clic en **"Ver Detalle"**
3. Lea la descripción y observaciones del Jefe de Mantenimiento
4. Haga clic en **"Iniciar Trabajo"**
5. (Opcional) Agregue una nota inicial (ej: "Iniciando revisión visual")

**Resultado**:
- El estado cambia de **"Asignada"** a **"En Progreso"**
- Se registra la hora de inicio
- El Jefe de Mantenimiento puede ver que ya comenzó

### 4.3.4 Registrar tareas realizadas

A medida que realiza el trabajo, vaya registrando cada tarea:

1. Dentro del detalle de la OT, vaya a la sección **"Tareas"**
2. Haga clic en **"+ Agregar Tarea"**
3. Complete:
   - **Descripción**: Qué hizo exactamente
     - Ejemplo: "Cambio de aceite de motor"
     - Ejemplo: "Revisión y ajuste de frenos delanteros"
     - Ejemplo: "Reemplazo de batería"
   - **Horas trabajadas**: Tiempo invertido en esta tarea (ej: 1.5)
   - **Completada**: ✅ Marcar si ya está lista
     - Si aún no termina, déjelo sin marcar
4. Haga clic en **"Guardar Tarea"**

**Buenas prácticas**:
- Sea específico en las descripciones
- Registre tareas a medida que las completa (no al final)
- Si una tarea toma mucho tiempo, divídala en sub-tareas

**Editar una tarea**:
- Haga clic en el ícono de lápiz junto a la tarea
- Modifique descripción, horas, o estado
- Guarde cambios

**Marcar tarea como completada**:
- En la lista de tareas, marque el checkbox ✅ junto a la tarea
- El sistema la marcará como completada automáticamente

### 4.3.5 Registrar repuestos utilizados

Cuando utilice un repuesto:

1. Dentro del detalle de la OT, vaya a **"Repuestos Utilizados"**
2. Haga clic en **"+ Agregar Repuesto"**
3. Complete:
   - **Repuesto**: Seleccione del catálogo (desplegable)
   - **Cantidad usada**: Número de unidades (ej: 1, 2, 4)
4. Haga clic en **"Agregar"**

**El sistema hará automáticamente**:
- ✅ Verifica que haya stock suficiente
  - Si no hay stock, mostrará error: "Stock insuficiente (disponible: X)"
- ✅ Descuenta la cantidad del stock
- ✅ Guarda el precio unitario del momento (para cálculo de costo)
- ✅ Calcula el subtotal (cantidad × precio)
- ✅ Suma al costo total de la OT

**Si no encuentra el repuesto en el catálogo**:
1. Contacte al Jefe de Mantenimiento
2. Solicite que lo agregue al catálogo
3. Una vez agregado, podrá registrarlo

**Editar o eliminar un repuesto registrado**:
- Haga clic en **"Eliminar"** junto al repuesto
- El stock se devolverá automáticamente

### 4.3.6 Agregar comentarios y observaciones

Si encuentra algo durante el trabajo:

1. En el detalle de la OT, vaya a **"Comentarios"**
2. Escriba su observación:
   - Problemas adicionales encontrados
   - Recomendaciones para el futuro
   - Partes que están desgastadas pero aún funcionales
3. Haga clic en **"Agregar Comentario"**

**Ejemplos de buenos comentarios**:
- ✅ "Detecté desgaste en pastillas de freno traseras (~40% restante). Recomendar reemplazo en próxima revisión."
- ✅ "Batería reemplazada. La antigua tenía 5 años. Revisar sistema de carga eléctrica."
- ❌ "Todo bien" (poco informativo)

### 4.3.7 Notificar que el trabajo está completo

Cuando termine todas las tareas:

1. **Verifique que todas las tareas estén marcadas como completadas** ✅
2. **Verifique que todos los repuestos estén registrados**
3. **Agregue comentarios finales** si es necesario
4. Haga clic en **"Notificar Finalización"**
5. El Jefe de Mantenimiento recibirá una notificación para revisar y cerrar la OT

**Importante**: Usted NO puede cerrar la OT. Solo el Jefe de Mantenimiento puede hacerlo después de revisarla.

### 4.3.8 Ver historial de vehículos

Antes de trabajar en un vehículo, puede revisar su historial:

1. Dentro del detalle de la OT, haga clic en **"Ver Historial del Vehículo"**
2. Verá todas las OT anteriores de ese vehículo:
   - Qué trabajos se hicieron
   - Qué repuestos se usaron
   - Comentarios de otros mecánicos
   - Problemas recurrentes

**Utilidad**:
- Identificar fallas recurrentes
- Ver qué repuestos se cambiaron recientemente
- Leer notas de otros mecánicos

### 4.3.9 Solicitar repuestos (si no hay stock)

Si necesita un repuesto que no está en stock:

1. En la OT, haga clic en **"Solicitar Repuesto"**
2. Complete:
   - Nombre del repuesto
   - Cantidad necesaria
   - Urgencia (Normal / Urgente)
3. Envíe la solicitud

**Resultado**:
- El Administrador recibirá la solicitud
- Cuando el repuesto llegue y se registre en el sistema, recibirá una notificación
- Podrá continuar con la OT

**Alternativa**: Contacte directamente al Jefe de Mantenimiento por teléfono si es urgente.

---

## 5. Preguntas Frecuentes (FAQ)

### 5.1 Generales

**P: ¿Puedo usar el sistema desde mi celular?**
R: Sí, la interfaz es responsive y se adapta a tablets y celulares, pero la experiencia óptima es en computador de escritorio.

**P: ¿Necesito instalar algo en mi computador?**
R: No, es un sistema web. Solo necesita un navegador moderno (Chrome, Firefox, Edge, Safari).

**P: ¿El sistema funciona sin internet?**
R: No, requiere conexión a internet para funcionar.

**P: ¿Mis datos están seguros?**
R: Sí, todas las comunicaciones son encriptadas (HTTPS), las contraseñas están hasheadas, y solo usuarios autorizados pueden acceder a la información.

**P: ¿Se hacen respaldos de la información?**
R: Sí, se realizan respaldos automáticos diarios de la base de datos.

### 5.2 Usuarios y Acceso

**P: ¿Cómo recupero mi contraseña?**
R: En la pantalla de login, haga clic en "¿Olvidó su contraseña?" e ingrese su email. Recibirá instrucciones para restablecerla.

**P: ¿Puedo cambiar mi email registrado?**
R: No directamente. Contacte al Administrador para que actualice su email.

**P: ¿Cuántos intentos de login tengo antes de que se bloquee mi cuenta?**
R: Después de 5 intentos fallidos consecutivos, la cuenta se bloqueará por 15 minutos por seguridad.

**P: ¿Puedo tener múltiples sesiones abiertas?**
R: Sí, puede iniciar sesión desde varios dispositivos simultáneamente.

### 5.3 Vehículos

**P: ¿Qué pasa si ingreso mal el kilometraje?**
R: Contacte al Administrador o Jefe de Mantenimiento para que lo corrija. Es importante tener el dato correcto para las alertas.

**P: ¿Puedo eliminar un vehículo?**
R: Solo el Administrador puede hacerlo, y solo si el vehículo no tiene órdenes de trabajo asociadas.

**P: ¿Cómo sé si un vehículo necesita mantenimiento?**
R: El sistema genera alertas automáticas que aparecen en el módulo "Alertas". El Jefe de Mantenimiento también recibe emails diarios.

### 5.4 Órdenes de Trabajo

**P: ¿Puedo editar una OT después de crearla?**
R: Sí, puede editar la descripción y observaciones, pero no puede cambiar el vehículo ni el número de OT.

**P: ¿Puedo eliminar una OT?**
R: Solo el Administrador puede eliminar OT, y solo si no tienen tareas o repuestos registrados.

**P: ¿Qué pasa si no completo una tarea a tiempo?**
R: El sistema no tiene penalizaciones automáticas, pero el Jefe de Mantenimiento puede ver cuánto tiempo lleva cada OT abierta.

**P: ¿Puedo reabrir una OT cerrada?**
R: No, una vez cerrada no se puede reabrir. Si necesita hacer más trabajo, debe crear una nueva OT.

**P: ¿Cuántas tareas puedo agregar a una OT?**
R: No hay límite, agregue tantas como necesite para documentar el trabajo completo.

### 5.5 Repuestos

**P: ¿Qué hago si no hay stock de un repuesto que necesito?**
R: Use la función "Solicitar Repuesto" o contacte al Administrador/Jefe de Mantenimiento.

**P: ¿Puedo usar un repuesto que no está en el catálogo?**
R: Primero debe pedirle al Administrador que lo agregue al catálogo. Luego podrá registrarlo en la OT.

**P: ¿Qué pasa si registro mal la cantidad de un repuesto?**
R: Puede eliminarlo y volver a agregarlo con la cantidad correcta. El stock se ajustará automáticamente.

**P: ¿El sistema actualiza los precios de repuestos automáticamente?**
R: No, los precios deben actualizarse manualmente por el Administrador. El sistema guarda el precio al momento de uso para cálculos históricos precisos.

### 5.6 Reportes

**P: ¿Puedo personalizar los reportes?**
R: Puede filtrar por vehículo, fecha, tipo de mantenimiento. Para reportes más personalizados, exporte a CSV y use Excel.

**P: ¿Los reportes incluyen OT en progreso?**
R: Depende del reporte. Los de costo solo incluyen OT finalizadas. Los de disponibilidad incluyen todas.

**P: ¿Puedo programar reportes automáticos?**
R: En la versión actual no. Debe generarlos manualmente cuando los necesite.

---

## 6. Solución de Problemas

### 6.1 Problemas de Acceso

**Síntoma**: No puedo iniciar sesión
**Causas posibles**:
- Contraseña incorrecta
- Usuario desactivado
- Cuenta bloqueada por múltiples intentos fallidos

**Solución**:
1. Verifique que esté usando el email correcto
2. Verifique mayúsculas/minúsculas en la contraseña
3. Use "Olvidé mi contraseña" para restablecerla
4. Si persiste, contacte al Administrador

**Síntoma**: La página no carga / error 404
**Causa**: URL incorrecta o servidor caído
**Solución**:
1. Verifique que la URL sea correcta
2. Intente actualizar la página (F5)
3. Limpie caché del navegador
4. Pruebe con otro navegador
5. Contacte al Administrador

### 6.2 Problemas con Órdenes de Trabajo

**Síntoma**: No puedo cerrar una OT
**Causa**: Hay tareas sin completar
**Solución**:
1. Vaya al detalle de la OT
2. Revise que TODAS las tareas tengan el ✅
3. Si hay tareas pendientes, complételas o elimínelas
4. Intente cerrar nuevamente

**Síntoma**: No veo las OT de otros mecánicos
**Causa**: Por diseño, los mecánicos solo ven sus propias OT
**Solución**: Esto es normal. Solo el Jefe de Mantenimiento y el Administrador ven todas las OT.

### 6.3 Problemas con Repuestos

**Síntoma**: Error "Stock insuficiente"
**Causa**: No hay unidades disponibles del repuesto
**Solución**:
1. Verifique el stock actual en el catálogo
2. Use "Solicitar Repuesto" para pedir reposición
3. Contacte al Administrador
4. Considere usar un repuesto alternativo si es posible

**Síntoma**: No puedo eliminar un repuesto de una OT
**Causa**: La OT está finalizada
**Solución**: No puede modificar OT finalizadas. Si es un error crítico, contacte al Administrador.

### 6.4 Problemas de Rendimiento

**Síntoma**: El sistema está lento
**Causas posibles**:
- Conexión a internet lenta
- Muchos usuarios conectados simultáneamente
- Navegador con muchas pestañas abiertas

**Solución**:
1. Verifique su conexión a internet
2. Cierre otras pestañas del navegador
3. Actualice la página
4. Cierre sesión y vuelva a entrar
5. Si persiste, contacte al Administrador

**Síntoma**: Los reportes tardan mucho en generarse
**Causa**: Rango de fechas muy amplio o muchos datos
**Solución**:
1. Reduzca el rango de fechas
2. Filtre por vehículo específico
3. Exporte a CSV y analice en Excel para consultas complejas

### 6.5 Errores Comunes

**Error**: "Token expirado, por favor inicie sesión nuevamente"
**Causa**: Su sesión expiró (24 horas de inactividad)
**Solución**: Cierre sesión y vuelva a iniciar sesión

**Error**: "No tiene permisos para realizar esta acción"
**Causa**: Está intentando acceder a una función de otro rol
**Solución**: Verifique que está en el módulo correcto para su rol. Si necesita ese permiso, hable con el Administrador.

**Error**: "Este vehículo ya tiene una OT abierta"
**Causa**: No puede haber dos OT abiertas simultáneamente para el mismo vehículo
**Solución**: Cierre la OT existente antes de crear una nueva, o agregue tareas adicionales a la OT ya abierta.

---

## 7. Glosario

**Administrador**: Usuario con permisos completos en el sistema. Puede gestionar usuarios, vehículos, repuestos, y acceder a todas las funciones.

**Alerta**: Notificación automática generada por el sistema cuando un vehículo se acerca a su fecha de mantenimiento preventivo.

**Cron Job**: Tarea programada que se ejecuta automáticamente a una hora específica (en este sistema, verifica alertas diariamente a las 6:00 AM).

**CSV**: Comma-Separated Values. Formato de archivo que permite exportar datos para abrirlos en Excel u otras herramientas.

**Dashboard**: Pantalla principal que muestra un resumen de información relevante para cada rol.

**DTO**: Data Transfer Object. Estructura de datos validada que asegura que la información ingresada cumpla requisitos (no visible para el usuario, pero importante para seguridad).

**Jefe de Mantenimiento**: Usuario responsable de crear órdenes de trabajo, asignar mecánicos, revisar alertas, y cerrar trabajos completados.

**JWT**: JSON Web Token. Tecnología de autenticación que permite sesiones seguras.

**Mantenimiento Correctivo**: Reparación realizada después de que ocurre una falla.

**Mantenimiento Preventivo**: Mantenimiento programado realizado antes de que ocurra una falla, basado en kilometraje o tiempo.

**Mecánico**: Usuario que ejecuta las órdenes de trabajo asignadas, registra tareas, y utiliza repuestos.

**Orden de Trabajo (OT)**: Documento digital que registra un evento de mantenimiento desde su creación hasta su cierre. Contiene tareas, repuestos, costos, y fechas.

**Patente**: Placa de identificación única de cada vehículo (ej: ABCD12).

**Plan Preventivo**: Configuración que define cada cuántos kilómetros o días un vehículo debe recibir mantenimiento.

**RBAC**: Role-Based Access Control. Sistema de seguridad que otorga permisos según el rol del usuario.

**Repuesto**: Parte o material utilizado en reparaciones y mantenimientos. El sistema gestiona un catálogo con precios y stock.

**Stock**: Cantidad disponible de un repuesto en el inventario.

**Tarea**: Trabajo específico realizado dentro de una orden de trabajo (ej: "Cambio de aceite", "Ajuste de frenos").

**TypeORM**: Herramienta que permite al sistema interactuar con la base de datos de forma segura (no visible para el usuario).

**URL**: Dirección web donde se accede al sistema (ej: https://rapido-sur.ejemplo.com).

---

## Contacto y Soporte

**Para soporte técnico**:
- Contacte al Administrador del sistema
- Email: admin@rapidosur.com (ejemplo - use el email configurado en su organización)
- Teléfono interno: Extensión 123

**Para reportar errores o sugerencias**:
- Use el formulario de "Feedback" en el menú del sistema
- Envíe un email al equipo de desarrollo: desarrollo@rapidosur.com

**Horario de soporte**:
- Lunes a Viernes: 8:00 AM - 6:00 PM
- Sábados: 9:00 AM - 1:00 PM
- Domingos y festivos: Solo emergencias

---

**Fin del Manual de Usuario**

*Versión 1.0 - Diciembre 2025*
*Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur*
*Desarrollado por: Rubilar, Bravo, Loyola, Aguayo*
