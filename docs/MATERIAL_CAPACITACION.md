# MATERIAL DE CAPACITACIÓN
## Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur

---

**Versión del Sistema**: 1.0
**Fecha**: Diciembre 2025
**Audiencia**: Capacitadores, Jefes de proyecto, Nuevos usuarios

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Programa de Capacitación](#2-programa-de-capacitación)
3. [Sesión 1: Administrador](#3-sesión-1-administrador)
4. [Sesión 2: Jefe de Mantenimiento](#4-sesión-2-jefe-de-mantenimiento)
5. [Sesión 3: Mecánico](#5-sesión-3-mecánico)
6. [Ejercicios Prácticos](#6-ejercicios-prácticos)
7. [Evaluación de Aprendizaje](#7-evaluación-de-aprendizaje)
8. [Recursos Adicionales](#8-recursos-adicionales)

---

## 1. Introducción

### 1.1 Objetivo de la Capacitación

Preparar a todos los usuarios de Rápido Sur para utilizar eficientemente el Sistema de Gestión de Mantenimiento Vehicular, asegurando que:

- ✅ Comprendan los beneficios del sistema
- ✅ Dominen las funcionalidades de su rol
- ✅ Puedan realizar sus tareas diarias sin asistencia
- ✅ Conozcan a quién contactar ante dudas o problemas

### 1.2 Metodología

**Enfoque**: 70% práctica, 30% teoría

**Método**:
1. **Demostración**: Instructor muestra la funcionalidad
2. **Práctica guiada**: Usuario ejecuta con supervisión
3. **Práctica independiente**: Usuario ejecuta solo
4. **Verificación**: Instructor confirma aprendizaje

**Herramientas**:
- Proyector para demostraciones
- Computadores individuales con acceso al sistema
- Ambiente de prueba con datos ficticios
- Manual de Usuario impreso o digital

### 1.3 Audiencias y Sesiones

| Rol | Sesión | Duración | Participantes | Prerrequisitos |
|-----|--------|----------|---------------|----------------|
| Administrador | Sesión 1 | 2 horas | 1 persona | Conocimientos básicos de TI |
| Jefe de Mantenimiento | Sesión 2 | 3 horas | 2 personas | Conocimiento del proceso actual |
| Mecánico | Sesión 3 | 4 horas | 5-7 personas (grupos de 2-3) | Ninguno |

---

## 2. Programa de Capacitación

### 2.1 Cronograma

```
SEMANA 1
─────────────────────────────────────────────────────
Día         Sesión                Horario    Grupo
─────────────────────────────────────────────────────
Lunes       Sesión 1: Admin       09:00-11:00  1 persona
Martes      Sesión 2: Jefe Mant.  09:00-12:00  2 personas
Miércoles   Sesión 3: Mecánicos   09:00-13:00  Grupo 1 (3)
Jueves      Sesión 3: Mecánicos   09:00-13:00  Grupo 2 (2-4)
Viernes     Refuerzo y Dudas      09:00-12:00  Todos
─────────────────────────────────────────────────────

SEMANA 2
─────────────────────────────────────────────────────
Lunes-Vie   Práctica Supervisada  Todo el día  Todos
            (Trabajo normal con asistencia del capacitador)
─────────────────────────────────────────────────────
```

### 2.2 Recursos Necesarios

**Por participante**:
- ✅ Computador con navegador web actualizado
- ✅ Conexión a internet estable
- ✅ Usuario y contraseña del sistema
- ✅ Manual de Usuario (impreso o PDF)
- ✅ Hoja de ejercicios prácticos
- ✅ Cuaderno para notas

**Para el capacitador**:
- ✅ Proyector o pantalla grande
- ✅ Pizarra o papelógrafo
- ✅ Marcadores
- ✅ Ambiente de prueba del sistema
- ✅ Datos de ejemplo preparados
- ✅ Lista de asistencia
- ✅ Evaluaciones impresas

---

## 3. Sesión 1: Administrador

**Duración**: 2 horas
**Participantes**: 1 persona (Gerente de Operaciones o Admin TI)
**Objetivo**: Capacitar en gestión completa del sistema

### 3.1 Agenda

| Tiempo | Tema | Metodología |
|--------|------|-------------|
| 0:00-0:15 | Introducción al sistema | Presentación |
| 0:15-0:45 | Gestión de usuarios | Demo + Práctica |
| 0:45-1:15 | Gestión de vehículos y repuestos | Demo + Práctica |
| 1:15-1:45 | Generación de reportes | Demo + Práctica |
| 1:45-2:00 | Q&A y cierre | Discusión |

### 3.2 Contenidos Detallados

#### Bloque 1: Introducción (15 min)

**Objetivos del sistema**:
- Digitalizar proceso de mantenimiento
- Reducir fallas por mantenimiento atrasado en 40%
- Centralizar información de la flota

**Arquitectura general**:
```
┌─────────────┐
│   Usuarios  │ → Login con rol diferenciado
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│          SISTEMA CENTRAL            │
│  ┌──────────────────────────────┐  │
│  │  Vehículos  │  Órdenes de    │  │
│  │             │  Trabajo       │  │
│  ├──────────────────────────────┤  │
│  │  Alertas    │  Repuestos     │  │
│  │             │                │  │
│  ├──────────────────────────────┤  │
│  │  Reportes   │  Usuarios      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       │
┌──────▼──────┐
│  PostgreSQL │ → Base de datos centralizada
└─────────────┘
```

**Roles del sistema**:
- **Administrador** (tú): Acceso total
- **Jefe de Mantenimiento**: Gestión de OTs
- **Mecánico**: Ejecución de trabajos

---

#### Bloque 2: Gestión de Usuarios (30 min)

**Demostración (10 min)**:

1. **Ver lista de usuarios**:
   - Menú → Usuarios
   - Explicar columnas: Nombre, Email, Rol, Estado

2. **Crear nuevo usuario**:
   ```
   Click en "+ Nuevo Usuario"

   Campos a completar:
   - Nombre completo: Pedro González
   - Email: pedro@rapidosur.cl
   - Contraseña: Temporal123! (el usuario la cambiará)
   - Rol: Mecánico
   - Activo: ✅

   Click "Guardar"
   ```

3. **Editar usuario**:
   - Click en ícono de lápiz
   - Cambiar nombre o rol
   - Guardar cambios

4. **Desactivar usuario** (no eliminar):
   - Editar usuario
   - Desmarcar "Activo"
   - Efecto: No podrá iniciar sesión

**Práctica guiada (15 min)**:

El participante debe:
- ✅ Crear 2 usuarios de prueba (un Jefe de Mantenimiento y un Mecánico)
- ✅ Editar uno de ellos (cambiar nombre)
- ✅ Desactivar y reactivar un usuario

**Verificación (5 min)**:
- Instructor confirma que los usuarios fueron creados correctamente
- Prueba de login con uno de los usuarios creados

---

#### Bloque 3: Gestión de Vehículos y Repuestos (30 min)

**Demostración - Vehículos (10 min)**:

1. **Registrar un vehículo**:
   ```
   Menú → Vehículos → "+ Nuevo Vehículo"

   Datos:
   - Patente: ABCD12
   - Modelo: Mercedes-Benz Sprinter 515
   - Año: 2020
   - Kilometraje actual: 85000
   - Capacidad: 20 pasajeros
   - Combustible: Diesel
   - Fecha última revisión: 01/11/2025

   Click "Guardar"
   ```

2. **Configurar plan preventivo**:
   ```
   Click "Plan Preventivo" en el vehículo

   Configuración:
   - Tipo de intervalo: Por Kilometraje
   - Intervalo: 10000 (km)
   - Descripción: "Mantenimiento cada 10,000 km: aceite, filtros, frenos"
   - Activo: ✅

   Click "Guardar"
   ```

3. **Actualizar kilometraje**:
   - Click "Actualizar km"
   - Ingresar nuevo valor (debe ser mayor)
   - Guardar

**Demostración - Repuestos (10 min)**:

1. **Agregar repuesto al catálogo**:
   ```
   Menú → Repuestos → "+ Nuevo Repuesto"

   Datos:
   - Nombre: Filtro de aceite Bosch P3274
   - Precio unitario: 12000 (pesos)
   - Stock: 15
   - Stock mínimo: 3
   - Proveedor: Comercial Automotriz SA

   Click "Guardar"
   ```

2. **Reponer stock**:
   - Click "Reponer Stock"
   - Ingresar cantidad recibida: 10
   - Stock se suma automáticamente (15 + 10 = 25)

**Práctica guiada (10 min)**:

El participante debe:
- ✅ Registrar 1 vehículo de prueba con su plan preventivo
- ✅ Agregar 2 repuestos al catálogo
- ✅ Actualizar el kilometraje del vehículo

---

#### Bloque 4: Generación de Reportes (30 min)

**Demostración (15 min)**:

1. **Reporte de Costos**:
   ```
   Menú → Reportes → Reporte de Costos

   Filtros:
   - Vehículo: Todos (o seleccionar uno)
   - Fecha desde: 01/10/2025
   - Fecha hasta: 30/11/2025

   Click "Generar Reporte"
   ```

   **Interpretar resultados**:
   - Costo de repuestos por vehículo
   - Costo de mano de obra
   - Total por tipo (preventivo vs correctivo)
   - Identificar vehículos más costosos

2. **Reporte de Disponibilidad**:
   ```
   Menú → Reportes → Disponibilidad

   Filtros por fecha

   Click "Generar"
   ```

   **Interpretar**:
   - % de tiempo operativo
   - % de tiempo en mantenimiento
   - Identificar vehículos con baja disponibilidad

3. **Exportar a CSV**:
   - Click "Exportar a CSV"
   - Archivo se descarga
   - Abrir con Excel
   - Mostrar cómo hacer análisis adicionales

**Práctica guiada (15 min)**:

El participante debe:
- ✅ Generar reporte de costos del último mes
- ✅ Generar reporte de disponibilidad
- ✅ Exportar ambos a CSV
- ✅ Abrir en Excel e identificar el vehículo más costoso

---

#### Bloque 5: Q&A y Cierre (15 min)

**Preguntas comunes**:

**P: ¿Puedo eliminar usuarios?**
R: Sí, pero solo si no tienen OTs asignadas. Prefiera desactivar.

**P: ¿Puedo cambiar la contraseña de un usuario?**
R: No directamente. El usuario debe usar "Olvidé mi contraseña" o tú puedes crear un nuevo usuario.

**P: ¿Cada cuánto debo actualizar los precios de repuestos?**
R: Mensualmente o cuando cambien con proveedores. El sistema guarda precio histórico.

**P: ¿Los reportes incluyen OTs en progreso?**
R: Los de costo solo incluyen OTs finalizadas. Los de disponibilidad incluyen todas.

**Próximos pasos**:
- Practicar en el sistema durante la semana
- Contacto para dudas: [email/teléfono del capacitador]
- Manual de Usuario disponible en: [URL o ubicación física]

---

### 3.3 Ejercicio de Certificación

**Tarea**: Realizar las siguientes acciones en el sistema de prueba en 30 minutos:

1. ✅ Crear 3 usuarios (1 Admin, 1 Jefe, 1 Mecánico)
2. ✅ Registrar 2 vehículos con planes preventivos
3. ✅ Agregar 3 repuestos al catálogo
4. ✅ Generar reporte de costos del último mes
5. ✅ Exportar reporte a CSV

**Criterio de aprobación**: 4/5 tareas completadas correctamente.

---

## 4. Sesión 2: Jefe de Mantenimiento

**Duración**: 3 horas
**Participantes**: 2 personas (Jefes de taller)
**Objetivo**: Dominar gestión de órdenes de trabajo y alertas

### 4.1 Agenda

| Tiempo | Tema | Metodología |
|--------|------|-------------|
| 0:00-0:20 | Introducción y navegación | Presentación + Tour |
| 0:20-1:00 | Gestión de alertas | Demo + Práctica |
| 1:00-2:00 | Órdenes de trabajo (crear, asignar) | Demo + Práctica |
| 2:00-2:40 | Cierre de OTs y reportes | Demo + Práctica |
| 2:40-3:00 | Caso práctico completo | Práctica |

### 4.2 Contenidos Detallados

#### Bloque 1: Introducción (20 min)

**Tu rol en el sistema**:
- ✅ Eres el puente entre gerencia y taller
- ✅ Creas y asignas órdenes de trabajo
- ✅ Supervisas el progreso
- ✅ Cierras trabajos terminados
- ✅ Generas reportes para gerencia

**Dashboard del Jefe de Mantenimiento**:
```
┌──────────────────────────────────────────┐
│  DASHBOARD - Jefe de Mantenimiento       │
├──────────────────────────────────────────┤
│  📋 Alertas Pendientes: 3                │
│  ⚠️  OTs Sin Asignar: 2                  │
│  🔧 OTs En Progreso: 5                   │
│  ✅ OTs Finalizadas Hoy: 1               │
└──────────────────────────────────────────┘
```

**Tour rápido del sistema** (5 min):
- Menú lateral: Dónde está cada módulo
- Cómo navegar
- Dónde cerrar sesión

---

#### Bloque 2: Gestión de Alertas (40 min)

**Demostración (15 min)**:

1. **Revisar alertas**:
   ```
   Menú → Alertas

   Lista de vehículos que necesitan mantenimiento:

   Patente    Modelo          Razón
   ─────────────────────────────────────────────
   ABCD12     Sprinter 515    9,500 km desde última
                              revisión (límite 10,000)

   WXYZ89     Iveco Daily     172 días desde última
                              revisión (límite 180)
   ```

2. **Interpretar alertas**:
   - 🟡 Amarillo: Preventiva (cerca del límite)
   - 🔴 Rojo: Crítica (límite superado)

3. **Crear OT desde alerta**:
   ```
   Click "Crear OT" junto al vehículo

   Formulario pre-completado:
   - Vehículo: ABCD12
   - Tipo: Preventivo ✓
   - Descripción: "Mantenimiento cada 10,000 km..."

   Agregar información adicional si necesario

   Click "Crear"
   ```

4. **Email de alertas diarias**:
   - Cada día a las 6 AM recibes email
   - Lista de vehículos que necesitan atención
   - Botón para acceder directo al sistema

**Práctica guiada (20 min)**:

Escenario: Tienes 3 alertas pendientes.

Tarea:
1. ✅ Acceder al módulo de Alertas
2. ✅ Identificar qué vehículos necesitan atención
3. ✅ Crear una OT para cada alerta
4. ✅ Verificar que las alertas desaparecieron

**Verificación (5 min)**:
- Instructor revisa que las 3 OTs fueron creadas
- Confirma que el estado es "Pendiente"

---

#### Bloque 3: Órdenes de Trabajo (60 min)

**Demostración - Crear OT (15 min)**:

1. **OT Preventiva** (desde alerta):
   - Ya vimos en bloque anterior

2. **OT Correctiva** (falla reportada):
   ```
   Escenario: Conductor reporta que el bus EFGH34
   hace ruido en el motor y pierde potencia.

   Menú → Órdenes de Trabajo → "+ Nueva OT"

   Formulario:
   - Vehículo: EFGH34 (selector)
   - Tipo: Correctivo ●
   - Prioridad: Alta
   - Descripción: "Motor hace ruido anormal al
     acelerar y pierde potencia en subidas. Verificar
     sistema de inyección y turbo. Reportado por
     conductor Juan Pérez el 09/12/2025."
   - Observaciones: "Vehículo fuera de servicio
     hasta resolver."

   Click "Crear"
   ```

   **El sistema genera**:
   - Número único: OT-2025-00042
   - Fecha de creación: Automática
   - Estado inicial: Pendiente

**Demostración - Asignar OT (10 min)**:

```
En la lista de OTs, buscar OT-2025-00042

Click "Asignar"

Selector de mecánico:
- Pedro González (disponible - 2 OTs activas)
- María López (ocupada - 4 OTs activas)
- Carlos Díaz (disponible - 1 OT activa)

Seleccionar: Pedro González ✓

Nota para el mecánico: "Revisar con urgencia,
vehículo reporta pérdida de potencia"

Click "Asignar"
```

**Estado cambia a**: Asignada
**Mecánico**: Ve la OT en su dashboard

**Demostración - Seguimiento (5 min)**:

```
Click en el número de OT (OT-2025-00042)

Vista detallada:
┌────────────────────────────────────────┐
│ OT-2025-00042                          │
│ Vehículo: EFGH34 - Iveco Daily        │
│ Tipo: Correctivo | Estado: Asignada   │
│ Mecánico: Pedro González               │
│ Creada: 09/12/2025 09:30              │
├────────────────────────────────────────┤
│ Tareas: (aún no hay)                   │
├────────────────────────────────────────┤
│ Repuestos: (aún no hay)                │
├────────────────────────────────────────┤
│ Costo acumulado: $0                    │
└────────────────────────────────────────┘
```

Aquí puedes:
- Ver progreso en tiempo real
- Ver qué tareas agregó el mecánico
- Ver qué repuestos usó
- Ver comentarios del mecánico

**Práctica guiada (25 min)**:

Escenario: Eres jefe de mantenimiento y tienes 3 situaciones:

**Situación 1**: Mantenimiento preventivo
- Vehículo: IJKL56
- Llegó a 9,800 km (límite 10,000 km)
- Tarea: Crear OT preventiva y asignar a María López

**Situación 2**: Falla reportada
- Vehículo: MNOP78
- Problema: Frenos hacen ruido
- Tarea: Crear OT correctiva con descripción detallada, asignar a Carlos Díaz

**Situación 3**: Reasignar OT
- OT-2025-00035 está asignada a Pedro, pero él está ocupado
- Tarea: Reasignar a María López

Tiempo: 20 minutos para completar las 3 situaciones

**Verificación (5 min)**:
- Instructor revisa que las 3 OTs existen
- Verifica que las asignaciones son correctas
- Confirma que las descripciones son adecuadas

---

#### Bloque 4: Cierre de OTs y Reportes (40 min)

**Demostración - Cierre de OT (15 min)**:

Escenario: El mecánico Pedro notificó que terminó la OT-2025-00042.

```
1. Acceder al detalle de la OT

2. Verificar que todas las tareas estén completadas:
   ✅ Revisión de sistema de inyección
   ✅ Limpieza de inyectores
   ✅ Verificación de turbo
   ✅ Prueba de ruta

3. Verificar repuestos utilizados:
   - Filtro de combustible x1 = $15,000
   - Limpiador de inyectores x1 = $8,000
   Total repuestos: $23,000

4. Verificar horas trabajadas:
   - Total: 4.5 horas x $10,000/hr = $45,000

5. Costo total: $68,000

6. (Opcional) Inspección física del vehículo
   - Prueba de manejo
   - Verificar que el ruido desapareció

7. Click "Cerrar Orden de Trabajo"

8. Completar formulario de cierre:
   - Observaciones finales: "Problema resuelto.
     Inyectores estaban sucios. Vehículo probado
     en ruta, funciona correctamente. Sin ruidos."
   - Calidad del trabajo: ⭐⭐⭐⭐⭐ (5/5)

9. Confirmar cierre
```

**El sistema automáticamente**:
- ✅ Actualiza estado a "Finalizada"
- ✅ Registra fecha de cierre
- ✅ Actualiza "última revisión" del vehículo
- ✅ Si es preventivo, recalcula próxima alerta
- ✅ Calcula costo total definitivo

**Demostración - Reportes (15 min)**:

1. **Reporte de Tiempos de Inactividad**:
   ```
   Menú → Reportes → Tiempos de Inactividad

   Filtros:
   - Fecha desde: 01/11/2025
   - Fecha hasta: 09/12/2025
   - Vehículo: Todos

   Click "Generar"

   Resultados:
   OT          Vehículo   Apertura    Cierre      Días
   ───────────────────────────────────────────────────────
   OT-2025-42  EFGH34     09/12 09:30  09/12 15:00  0.2
   OT-2025-41  ABCD12     05/12 08:00  07/12 17:00  2.4
   OT-2025-40  IJKL56     01/12 10:00  01/12 14:00  0.2
   ```

   **Análisis**:
   - Identificar OTs que tardan mucho
   - Vehículos con alta inactividad
   - Mejorar tiempos de respuesta

2. **Uso típico**:
   - Generar reportes semanales
   - Presentar en reuniones gerenciales
   - Identificar problemas y oportunidades de mejora

**Práctica guiada (10 min)**:

Tarea:
1. ✅ Cerrar una OT de prueba (instructor la prepara)
2. ✅ Generar reporte de tiempos de inactividad del último mes
3. ✅ Identificar el vehículo con mayor tiempo fuera de servicio

---

#### Bloque 5: Caso Práctico Completo (20 min)

**Escenario real**: Lunes 9:00 AM, comienzas tu jornada.

**Situación**:
1. Recibes email con 2 alertas preventivas
2. Un conductor llama reportando falla de frenos
3. Un mecánico notifica que terminó una OT

**Tu tarea** (15 min):
1. ✅ Revisar alertas y crear OTs preventivas
2. ✅ Crear OT correctiva para falla de frenos
3. ✅ Asignar las 3 OTs a mecánicos disponibles
4. ✅ Revisar y cerrar la OT terminada
5. ✅ Generar reporte de la semana

**Verificación (5 min)**:
- Instructor revisa que todas las tareas fueron completadas
- Confirma que el flujo fue correcto
- Resuelve dudas

---

### 4.3 Ejercicio de Certificación

**Tarea**: Completar el siguiente flujo en 45 minutos:

**Escenario**: Día típico de trabajo

1. ✅ Revisar 3 alertas y crear OTs correspondientes
2. ✅ Crear 1 OT correctiva por falla reportada
3. ✅ Asignar las 4 OTs a mecánicos (distribuir carga)
4. ✅ Cerrar 2 OTs que ya están terminadas
5. ✅ Generar reporte de costos del mes
6. ✅ Identificar en el reporte el vehículo más costoso

**Criterio de aprobación**: 5/6 tareas correctas.

---

## 5. Sesión 3: Mecánico

**Duración**: 4 horas (incluye pausas)
**Participantes**: 5-7 personas en grupos de 2-3
**Objetivo**: Ejecutar OTs y registrar trabajos realizados

### 5.1 Agenda

| Tiempo | Tema | Metodología |
|--------|------|-------------|
| 0:00-0:30 | Introducción al sistema | Presentación |
| 0:30-1:00 | Navegación y dashboard | Demo + Práctica |
| 1:00-2:00 | Registro de tareas | Demo + Práctica |
| 2:00-2:15 | PAUSA | Descanso |
| 2:15-3:15 | Registro de repuestos | Demo + Práctica |
| 3:15-3:45 | Caso práctico completo | Práctica |
| 3:45-4:00 | Q&A y cierre | Discusión |

### 5.2 Contenidos Detallados

#### Bloque 1: Introducción (30 min)

**Bienvenida**:
- Nuevo sistema para facilitar tu trabajo diario
- Reemplaza cuadernos de papel y planillas
- Todo queda registrado automáticamente
- No es para "vigilarte", es para ayudarte

**Beneficios para ti**:
- ✅ Ves claramente qué trabajos debes hacer
- ✅ Tienes toda la información del vehículo
- ✅ No necesitas buscar historial en papeles
- ✅ Registras tu trabajo de forma simple
- ✅ El sistema calcula costos automáticamente

**Tu rol**:
```
1. Ver OTs asignadas a ti
   ↓
2. Iniciar el trabajo
   ↓
3. Registrar cada tarea que haces
   ↓
4. Registrar repuestos que usas
   ↓
5. Marcar tareas como completadas
   ↓
6. Notificar que terminaste
```

**¿Qué NO puedes hacer?**:
- ❌ Ver OTs de otros mecánicos (privacidad)
- ❌ Crear OTs (solo el jefe)
- ❌ Cerrar OTs (solo el jefe)
- ❌ Editar precios de repuestos

---

#### Bloque 2: Navegación y Dashboard (30 min)

**Demostración (15 min)**:

1. **Iniciar sesión**:
   ```
   Abrir navegador
   Ir a: https://rapidosur.com

   Email: tu-email@rapidosur.cl
   Contraseña: (la que recibiste)

   Click "Iniciar Sesión"
   ```

2. **Tu dashboard**:
   ```
   ┌────────────────────────────────────────┐
   │  Hola, Pedro González                  │
   ├────────────────────────────────────────┤
   │  🔧 OTs Asignadas a Mí: 3              │
   │  ⚙️  OTs En Progreso: 1                │
   │  ✅ OTs Completadas Hoy: 0             │
   ├────────────────────────────────────────┤
   │  MIS ÓRDENES DE TRABAJO                │
   │                                         │
   │  OT-2025-42  EFGH34  Correctivo  [Asignada]  │
   │  OT-2025-41  ABCD12  Preventivo  [En Progreso]│
   │  OT-2025-40  IJKL56  Preventivo  [Asignada]   │
   └────────────────────────────────────────┘
   ```

3. **Ver detalle de una OT**:
   ```
   Click en OT-2025-42

   Verás:
   - Datos del vehículo
   - Descripción del trabajo
   - Observaciones del jefe
   - Botón "Iniciar Trabajo"
   ```

4. **Menú lateral**:
   - **Mis Órdenes**: Tu página principal
   - **Perfil**: Cambiar contraseña, ver tus datos
   - **Cerrar Sesión**: Salir del sistema

**Práctica guiada (15 min)**:

Cada mecánico:
1. ✅ Inicia sesión con su usuario
2. ✅ Explora su dashboard
3. ✅ Accede al detalle de una OT asignada
4. ✅ Lee la descripción del trabajo
5. ✅ Cierra sesión y vuelve a entrar

**Nota importante**:
- Siempre cierra sesión cuando termines
- Especialmente en computadores compartidos

---

#### Bloque 3: Registro de Tareas (60 min)

**Demostración (20 min)**:

Escenario: Tienes asignada la OT-2025-42 (ruido en motor).

**Paso 1: Iniciar trabajo**:
```
1. Acceder al detalle de OT-2025-42

2. Leer descripción:
   "Motor hace ruido anormal al acelerar..."

3. Click "Iniciar Trabajo"

4. (Opcional) Agregar nota inicial:
   "Iniciando diagnóstico del motor"

5. Estado cambia a: En Progreso
```

**Paso 2: Registrar primera tarea**:
```
Mientras trabajas, registra cada tarea:

1. En la sección "Tareas", click "+ Agregar Tarea"

2. Completar:
   - Descripción: "Revisión visual de motor y turbo"
   - Horas trabajadas: 0.5
   - Completada: ❌ (aún no terminas)

3. Click "Guardar"
```

**Paso 3: Registrar más tareas a medida que avanzas**:
```
Tarea 2:
- Descripción: "Diagnóstico con escáner OBD"
- Horas: 0.5
- Completada: ✅

Tarea 3:
- Descripción: "Desmontaje y limpieza de inyectores"
- Horas: 2.0
- Completada: ✅

Tarea 4:
- Descripción: "Revisión de filtro de combustible - encontrado sucio, reemplazo necesario"
- Horas: 0.5
- Completada: ✅

Tarea 5:
- Descripción: "Prueba de ruta - verificar solución"
- Horas: 1.0
- Completada: ✅
```

**Consejos**:
- ✅ Sé específico en las descripciones
- ✅ Registra tareas a medida que las haces, no al final
- ✅ Si encuentras algo adicional, agrégalo como tarea nueva
- ✅ Las horas ayudan a calcular costo de mano de obra

**Práctica guiada (30 min)**:

Escenario: Mantenimiento preventivo de un bus.

Trabajo a realizar:
1. Cambio de aceite de motor
2. Reemplazo de filtro de aceite
3. Reemplazo de filtro de aire
4. Revisión de frenos
5. Revisión de luces

Tu tarea:
- ✅ Iniciar la OT de prueba
- ✅ Registrar las 5 tareas (con tiempos realistas)
- ✅ Marcar 3 tareas como completadas
- ✅ Dejar 2 pendientes

Tiempo: 25 minutos

**Verificación (10 min)**:
- Instructor revisa que las tareas fueron registradas
- Verifica que las descripciones son claras
- Confirma que las horas son realistas

---

#### PAUSA (15 min) ☕

---

#### Bloque 4: Registro de Repuestos (60 min)

**Demostración (20 min)**:

**Paso 1: Ver catálogo de repuestos**:
```
Antes de registrar, puedes ver qué repuestos hay:

Menú → Repuestos (solo lectura)

Verás:
- Filtro de aceite Bosch P3274 - Stock: 15 - $12,000
- Filtro de aire Mann C24528 - Stock: 8 - $18,000
- Aceite motor 15W40 Mobil - Stock: 30 litros - $8,000/L
...
```

**Paso 2: Registrar repuesto usado**:
```
Dentro de la OT, sección "Repuestos Utilizados"

1. Click "+ Agregar Repuesto"

2. Selector:
   Buscar: "filtro aceite"
   Seleccionar: Filtro de aceite Bosch P3274

3. Cantidad: 1

4. Click "Agregar"
```

**El sistema automáticamente**:
- ✅ Verifica que hay stock (15 disponibles)
- ✅ Descuenta 1 unidad (quedan 14)
- ✅ Guarda el precio actual ($12,000)
- ✅ Calcula subtotal (1 x $12,000 = $12,000)
- ✅ Lo suma al costo total de la OT

**Paso 3: Registrar más repuestos**:
```
Repuesto 2:
- Aceite motor 15W40 Mobil
- Cantidad: 8 (litros)
- Subtotal: 8 x $8,000 = $64,000

Repuesto 3:
- Filtro de aire Mann C24528
- Cantidad: 1
- Subtotal: 1 x $18,000 = $18,000

Total repuestos: $94,000
Total mano de obra: 4.5 hrs x $10,000 = $45,000
TOTAL OT: $139,000
```

**¿Qué pasa si no hay stock?**:
```
Error: "Stock insuficiente. Disponible: 0"

Solución:
1. Click "Solicitar Repuesto"
2. Completar formulario:
   - Nombre: Filtro de aire Mann C24528
   - Cantidad: 5
   - Urgencia: Urgente
3. Enviar solicitud
4. El admin recibirá notificación
5. Cuando llegue el repuesto, recibirás aviso
```

**Práctica guiada (30 min)**:

Escenario: Continuando el mantenimiento preventivo del bloque anterior.

Repuestos utilizados:
1. Aceite de motor 15W40: 8 litros
2. Filtro de aceite: 1 unidad
3. Filtro de aire: 1 unidad
4. Pastillas de freno delanteras: 1 juego

Tu tarea:
- ✅ Registrar los 4 repuestos en la OT
- ✅ Verificar que el stock se descuenta automáticamente
- ✅ Ver el costo total acumulado
- ✅ (Si algún repuesto no tiene stock) Solicitar reposición

Tiempo: 25 minutos

**Verificación (10 min)**:
- Instructor revisa que los 4 repuestos fueron registrados
- Verifica que las cantidades son correctas
- Confirma que el costo total es correcto

---

#### Bloque 5: Caso Práctico Completo (30 min)

**Escenario real**: Reparación de frenos de un bus.

**Situación**:
- OT-2025-99 asignada a ti
- Vehículo: QRST01 - Mercedes-Benz OF-1722
- Problema: "Frenos delanteros hacen ruido y vibran al frenar"

**Trabajo a realizar**:
1. Diagnóstico de sistema de frenos
2. Desmontaje de ruedas delanteras
3. Inspección de discos y pastillas
4. Reemplazo de pastillas de freno (gastadas)
5. Limpieza y lubricación de guías
6. Montaje de ruedas
7. Prueba de frenado

**Repuestos utilizados**:
- Pastillas de freno delanteras: 1 juego
- Grasa para guías: 1 tubo

**Tu tarea completa** (25 min):
1. ✅ Iniciar la OT
2. ✅ Registrar las 7 tareas (con tiempos realistas)
3. ✅ Marcar cada tarea como completada a medida que "avanzas"
4. ✅ Registrar los 2 repuestos utilizados
5. ✅ Agregar un comentario: "Discos en buen estado, solo se requirió cambio de pastillas. Ruido desapareció después del reemplazo."
6. ✅ Verificar que todas las tareas estén ✅
7. ✅ Notificar finalización

**Verificación (5 min)**:
- Instructor revisa el flujo completo
- Confirma que todo está registrado correctamente
- La OT está lista para que el jefe la cierre

---

#### Bloque 6: Q&A y Cierre (15 min)

**Preguntas comunes**:

**P: ¿Qué pasa si me olvido de registrar una tarea?**
R: Puedes agregarla en cualquier momento mientras la OT esté en progreso. Pero intenta registrar a medida que trabajas.

**P: ¿Puedo editar una tarea después de guardarla?**
R: Sí, click en el ícono de lápiz junto a la tarea. Pero no puedes editar si la OT ya fue cerrada.

**P: ¿Qué hago si uso un repuesto que no está en el catálogo?**
R: Contacta al jefe de mantenimiento para que lo agregue. Mientras tanto, anótalo en los comentarios.

**P: ¿Puedo ver las OTs de otros mecánicos?**
R: No, solo ves las tuyas (privacidad y foco en tu trabajo).

**P: ¿Qué pasa si cierro el navegador sin guardar?**
R: Cada tarea y repuesto se guarda inmediatamente. No perderás información.

**P: ¿Debo llenar todo desde el computador del taller?**
R: Sí, por ahora. En el futuro puede haber app móvil.

**Recomendaciones finales**:
- ✅ Registra tu trabajo a medida que avanzas
- ✅ Sé específico en las descripciones
- ✅ Reporta problemas adicionales que encuentres
- ✅ Si tienes dudas, pregunta al jefe o admin
- ✅ Cierra sesión cuando termines

---

### 5.3 Ejercicio de Certificación

**Tarea**: Completar una OT completa en 60 minutos:

**Escenario**: Mantenimiento preventivo 10,000 km

**Vehículo**: Bus Marcopolo (datos ficticios)

**Trabajo a realizar**:
1. Cambio de aceite y filtro
2. Reemplazo de filtro de aire
3. Revisión de frenos (delanteros y traseros)
4. Revisión de luces y fusibles
5. Revisión de niveles de fluidos
6. Prueba de ruta

**Tu tarea completa**:
1. ✅ Iniciar la OT
2. ✅ Registrar las 6 tareas con tiempos realistas
3. ✅ Marcar todas como completadas
4. ✅ Registrar repuestos utilizados (aceite, filtros)
5. ✅ Agregar comentario final
6. ✅ Notificar finalización

**Criterio de aprobación**: Todas las tareas completadas correctamente en el tiempo asignado.

---

## 6. Ejercicios Prácticos

### 6.1 Ejercicio 1: Administrador

**Nombre**: Configuración inicial del sistema

**Duración**: 45 minutos

**Tareas**:
1. Crear 5 usuarios (1 admin, 2 jefes, 2 mecánicos)
2. Registrar 5 vehículos con datos completos
3. Configurar plan preventivo para cada vehículo
4. Agregar 10 repuestos al catálogo
5. Generar reporte de costos (aunque esté vacío)

**Entregable**: Captura de pantalla de cada módulo completado

---

### 6.2 Ejercicio 2: Jefe de Mantenimiento

**Nombre**: Día típico de trabajo

**Duración**: 60 minutos

**Tareas**:
1. Revisar 3 alertas de mantenimiento preventivo
2. Crear OT para cada alerta
3. Recibir reporte de falla (simular llamada de conductor)
4. Crear OT correctiva para la falla
5. Asignar las 4 OTs a mecánicos (distribuir carga)
6. Revisar progreso de OTs en curso
7. Cerrar 1 OT que fue notificada como terminada
8. Generar reporte de tiempos de inactividad

**Entregable**: Lista de OTs creadas y reporte generado

---

### 6.3 Ejercicio 3: Mecánico

**Nombre**: Reparación completa de vehículo

**Duración**: 45 minutos

**Tareas**:
1. Iniciar OT asignada (problema de transmisión)
2. Registrar diagnóstico inicial
3. Registrar 5 tareas realizadas
4. Registrar 3 repuestos utilizados
5. Agregar comentario sobre hallazgos
6. Marcar todas las tareas como completadas
7. Notificar finalización

**Entregable**: OT completa lista para cierre

---

## 7. Evaluación de Aprendizaje

### 7.1 Evaluación del Administrador

**Formato**: Práctica + preguntas teóricas

**Parte Práctica** (70 puntos):
- Crear 2 usuarios correctamente: 20 pts
- Registrar 1 vehículo con plan preventivo: 20 pts
- Agregar 3 repuestos: 15 pts
- Generar y exportar 1 reporte: 15 pts

**Parte Teórica** (30 puntos):
1. ¿Cuáles son los 3 roles del sistema y qué puede hacer cada uno? (10 pts)
2. ¿Cómo funciona el sistema de alertas preventivas? (10 pts)
3. ¿Qué reportes puedes generar y para qué sirven? (10 pts)

**Aprobación**: 70/100 puntos

---

### 7.2 Evaluación del Jefe de Mantenimiento

**Formato**: Caso práctico completo

**Escenario** (100 puntos):
- Tienes 2 alertas preventivas (20 pts)
- Un conductor reporta falla de motor (20 pts)
- Debes crear las 3 OTs correspondientes (20 pts)
- Asignar a mecánicos disponibles (15 pts)
- Cerrar 1 OT que ya terminó (15 pts)
- Generar reporte de costos (10 pts)

**Aprobación**: 70/100 puntos

---

### 7.3 Evaluación del Mecánico

**Formato**: Ejecución completa de OT

**Tareas** (100 puntos):
- Iniciar OT correctamente (10 pts)
- Registrar 5 tareas con descripciones claras (30 pts)
- Registrar 3 repuestos correctamente (30 pts)
- Marcar tareas como completadas (15 pts)
- Agregar comentario final (10 pts)
- Notificar finalización (5 pts)

**Aprobación**: 70/100 puntos

---

## 8. Recursos Adicionales

### 8.1 Material de Apoyo

**Documentación**:
- Manual de Usuario completo (PDF)
- Guía rápida por rol (1 página cada uno)
- Videos tutoriales (opcional, si se graban)

**Accesos**:
- URL del sistema: https://rapidosur.com
- Email de soporte: soporte@rapidosur.cl
- Teléfono de soporte: +56 9 XXXX XXXX

### 8.2 Glosario para Usuarios

**OT**: Orden de Trabajo. Documento que registra un mantenimiento.

**Preventivo**: Mantenimiento programado antes de que ocurra una falla.

**Correctivo**: Reparación después de que ocurre una falla.

**Alerta**: Notificación automática de que un vehículo necesita mantenimiento.

**Dashboard**: Página principal con resumen de información.

**Stock**: Cantidad disponible de un repuesto.

**Tarea**: Trabajo específico dentro de una OT (ej: "Cambio de aceite").

**Repuesto**: Parte o material usado en reparaciones.

---

### 8.3 Guía Rápida de Referencia

**ADMINISTRADOR - Cheat Sheet**:
```
Crear usuario:      Usuarios → + Nuevo Usuario
Agregar vehículo:   Vehículos → + Nuevo Vehículo
Plan preventivo:    Vehículos → Plan Preventivo
Agregar repuesto:   Repuestos → + Nuevo Repuesto
Generar reporte:    Reportes → Seleccionar tipo
```

**JEFE MANTENIMIENTO - Cheat Sheet**:
```
Ver alertas:        Alertas → Lista
Crear OT:           Órdenes → + Nueva OT
Asignar OT:         Órdenes → Asignar
Cerrar OT:          Órdenes → Detalle → Cerrar
Generar reporte:    Reportes → Seleccionar tipo
```

**MECÁNICO - Cheat Sheet**:
```
Mis OTs:            Mis Órdenes (dashboard)
Iniciar OT:         Detalle OT → Iniciar Trabajo
Agregar tarea:      Detalle OT → + Agregar Tarea
Agregar repuesto:   Detalle OT → + Agregar Repuesto
Notificar fin:      Detalle OT → Notificar Finalización
```

---

**Fin del Material de Capacitación**

*Versión 1.0 - Diciembre 2025*
*Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur*
*Desarrollado por: Rubilar, Bravo, Loyola, Aguayo*

**Contacto para dudas sobre capacitación**:
- Email: capacitacion@rapidosur.cl
- Teléfono: +56 9 XXXX XXXX
