# 📚 Estructura de Documentación - Rápido Sur

## 📁 Organización de Archivos

### **Raíz del Proyecto** (`/`)
Documentación esencial de alto nivel.

```
/
├── README.md                    # Introducción general del proyecto
├── CLAUDE.md                    # Memoria del proyecto y guía de desarrollo
└── DOCS_STRUCTURE.md           # Este archivo - mapa de documentación
```

---

### **Backend** (`/backend/docs/`)
Documentación específica del backend NestJS.

```
backend/docs/
├── README.md                           # Índice de documentación del backend
├── api/
│   ├── API_REFERENCE.md               # Referencia completa de endpoints
│   ├── AUTHENTICATION.md              # Sistema de autenticación JWT
│   └── ERROR_HANDLING.md              # Manejo de errores y códigos HTTP
├── architecture/
│   ├── MODULE_STRUCTURE.md            # Estructura de módulos NestJS
│   ├── DATABASE_SCHEMA.md             # Esquema de base de datos
│   └── BUSINESS_LOGIC.md              # Reglas de negocio críticas
├── deployment/
│   ├── DEPLOYMENT_DOKPLOY.md          # Deploy con Dokploy
│   ├── DEPLOYMENT_QUICK_START.md      # Inicio rápido de deployment
│   └── CHANGELOG_DEPLOYMENT.md        # Historial de deployments
├── testing/
│   ├── TESTS.md                       # Guía de testing
│   └── TEST_COVERAGE.md               # Cobertura de tests
└── compliance/
    ├── COMPLIANCE_REPORT.md           # Reporte de cumplimiento
    └── VALIDATION_GUIDE.md            # Guía de validación
```

---

### **Frontend** (`/frontend/docs/`)
Documentación específica del frontend Next.js/React.

```
frontend/docs/
├── README.md                           # Índice de documentación del frontend
├── components/
│   ├── COMPONENT_LIBRARY.md           # Biblioteca de componentes UI
│   ├── FORMS.md                       # Sistema de formularios
│   └── STATE_MANAGEMENT.md            # Gestión de estado
├── api-integration/
│   ├── API_CLIENT.md                  # Cliente Axios y configuración
│   ├── AUTHENTICATION.md              # Autenticación en el frontend
│   └── ERROR_HANDLING.md              # Manejo de errores HTTP
├── deployment/
│   └── DEPLOYMENT.md                  # Deploy del frontend
├── styling/
│   ├── DESIGN_SYSTEM.md               # Sistema de diseño
│   └── TAILWIND_GUIDE.md              # Guía de Tailwind CSS
└── user-flows/
    ├── WORK_ORDERS_FLOW.md            # Flujo de órdenes de trabajo
    ├── VEHICLES_FLOW.md               # Flujo de gestión de vehículos
    └── ALERTS_FLOW.md                 # Flujo de alertas preventivas
```

---

### **Setup & Configuration** (`/docs/setup/`)
Guías de instalación y configuración.

```
docs/setup/
├── README.md                          # Índice de guías de setup
├── QUICK_START.md                     # Inicio rápido (5 minutos)
├── DOCKER_GUIDE.md                    # Guía completa de Docker
├── DOCKER_SETUP_SUMMARY.md            # Resumen de configuraciones Docker
└── DOKPLOY_SETUP.md                   # Setup de Dokploy para producción
```

---

### **Análisis del Sistema** (`/docs/analysis/`)
Análisis y guías de funcionamiento del sistema completo.

```
docs/analysis/
├── README.md                          # Índice de análisis
├── ANALISIS-COMPLETO-SISTEMA.md       # Análisis exhaustivo del sistema
├── FLUJO-COMPLETO-EJEMPLO.md          # Ejemplo de flujo end-to-end
├── GUIA-FUNCIONAMIENTO.md             # Guía de cómo funciona el sistema
└── PLAN-ACCION.md                     # Plan de acción y roadmap
```

---

## 🗺️ Mapa de Navegación

### Para Nuevos Desarrolladores:
1. Leer [`README.md`](./README.md) - Introducción general
2. Leer [`CLAUDE.md`](./CLAUDE.md) - Memoria y reglas del proyecto
3. Seguir [`docs/setup/QUICK_START.md`](./docs/setup/QUICK_START.md) - Setup inicial
4. Revisar arquitectura en `backend/docs/architecture/` y `frontend/docs/`

### Para Deployment:
1. [`docs/setup/DOCKER_GUIDE.md`](./docs/setup/DOCKER_GUIDE.md) - Containerización
2. [`docs/setup/DOKPLOY_SETUP.md`](./docs/setup/DOKPLOY_SETUP.md) - Setup de producción
3. [`backend/docs/deployment/DEPLOYMENT_DOKPLOY.md`](./backend/docs/deployment/DEPLOYMENT_DOKPLOY.md) - Deploy backend
4. [`frontend/docs/deployment/DEPLOYMENT.md`](./frontend/docs/deployment/DEPLOYMENT.md) - Deploy frontend

### Para Entender el Negocio:
1. [`docs/analysis/GUIA-FUNCIONAMIENTO.md`](./docs/analysis/GUIA-FUNCIONAMIENTO.md) - Cómo funciona
2. [`docs/analysis/FLUJO-COMPLETO-EJEMPLO.md`](./docs/analysis/FLUJO-COMPLETO-EJEMPLO.md) - Ejemplo práctico
3. [`docs/analysis/ANALISIS-COMPLETO-SISTEMA.md`](./docs/analysis/ANALISIS-COMPLETO-SISTEMA.md) - Análisis del sistema

### Para Setup Inicial:
1. [`docs/setup/QUICK_START.md`](./docs/setup/QUICK_START.md) - Inicio rápido
2. [`docs/setup/DOCKER_SETUP_SUMMARY.md`](./docs/setup/DOCKER_SETUP_SUMMARY.md) - Opciones de Docker
3. [`docs/setup/DOCKER_GUIDE.md`](./docs/setup/DOCKER_GUIDE.md) - Docker completo

---

## 📋 Convenciones de Documentación

### Formato de Archivos:
- **Markdown (`.md`)** para toda la documentación
- **Títulos en español** para documentos de negocio
- **Títulos en inglés** para documentos técnicos
- **Emojis** para mejorar navegación visual

### Estructura de Documentos:
```markdown
# 📘 Título del Documento

## 🎯 Propósito
Breve descripción del propósito del documento.

## 📋 Contenido
- Sección 1
- Sección 2

## 🔗 Enlaces Relacionados
- [Documento relacionado 1](./path/to/doc.md)
- [Documento relacionado 2](./path/to/doc.md)

---
**Última actualización**: [Fecha]
**Autor**: [Nombre/Equipo]
```

### Mantenimiento:
- Actualizar documentación al hacer cambios significativos
- Incluir fecha de última actualización
- Mantener enlaces relativos para portabilidad

---

## 🔄 Migración de Documentación Existente

### Plan de Reorganización:

#### Backend (`/backend/docs/`):
- ✅ Mover `DEPLOYMENT_DOKPLOY.md` → `backend/docs/deployment/`
- ✅ Mover `DEPLOYMENT_QUICK_START.md` → `backend/docs/deployment/`
- ✅ Mover `CHANGELOG_DEPLOYMENT.md` → `backend/docs/deployment/`
- ✅ Mover `COMPLIANCE_REPORT.md` → `backend/docs/compliance/`
- ✅ Mover `GUIA_COMPLETA_VALIDATION.md` → `backend/docs/compliance/VALIDATION_GUIDE.md`
- ✅ Mover `TESTS.md` → `backend/docs/testing/`

#### Frontend (`/frontend/docs/`):
- ✅ Mover `DEPLOYMENT.md` → `frontend/docs/deployment/`

#### Análisis (`/docs/analysis/`):
- ✅ Mover `ANALISIS-COMPLETO-SISTEMA.md` → `docs/analysis/`
- ✅ Mover `FLUJO-COMPLETO-EJEMPLO.md` → `docs/analysis/`
- ✅ Mover `GUIA-FUNCIONAMIENTO.md` → `docs/analysis/`
- ✅ Mover `PLAN-ACCION.md` → `docs/analysis/`

#### Raíz (mantener):
- ✅ `README.md` - Punto de entrada principal
- ✅ `CLAUDE.md` - Memoria del proyecto
- ✅ `QUICK_START.md` - Setup rápido
- ✅ `DOCKER_GUIDE.md` - Docker general
- ✅ `DOCKER_SETUP_SUMMARY.md` - Resumen Docker
- ✅ `DOKPLOY_SETUP.md` - Setup Dokploy
- ✅ `INDEX.md` - Índice general

---

## 📝 Próximos Pasos

1. ✅ Crear estructura de carpetas (`backend/docs/`, `frontend/docs/`, `docs/analysis/`)
2. ✅ Crear archivos README.md en cada carpeta
3. ⏳ Mover documentación existente a ubicaciones correctas
4. ⏳ Crear documentación faltante (API_REFERENCE.md, COMPONENT_LIBRARY.md, etc.)
5. ⏳ Actualizar enlaces en documentos existentes
6. ⏳ Eliminar duplicados y consolidar

---

**Última actualización**: Noviembre 2025
**Equipo**: Rubilar, Bravo, Loyola, Aguayo
