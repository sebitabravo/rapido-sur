# RESUMEN DEL PROYECTO - SISTEMA DE GESTIÓN DE MANTENIMIENTO RÁPIDO SUR

## 1. ¿Cuál es tu proyecto? - ¿Qué sistema/software desarrollaron? ¿Qué hace?

### Nombre del Sistema
**Sistema de Gestión de Mantenimiento Vehicular Rápido Sur**

### Descripción General
Sistema web para la gestión integral del mantenimiento de flotas vehiculares, desarrollado específicamente para la empresa de transporte Rápido Sur. El sistema digitaliza completamente el proceso de mantenimiento que actualmente se realiza de forma manual con papel y Excel.

### Funcionalidades Principales

#### Para Administradores
- Gestión completa de usuarios (crear, editar, desactivar)
- Generación de reportes ejecutivos (costos, disponibilidad, tiempos de inactividad)
- Exportación de datos a CSV para análisis externos
- Acceso total a todas las funcionalidades del sistema

#### Para Jefes de Mantenimiento
- Creación y gestión de órdenes de trabajo (preventivas y correctivas)
- Asignación de mecánicos a órdenes de trabajo
- Visualización de alertas preventivas automáticas
- Cierre y revisión de órdenes completadas
- Generación de reportes de mantenimiento
- Gestión de planes preventivos por vehículo

#### Para Mecánicos
- Visualización de órdenes de trabajo asignadas
- Registro de tareas realizadas
- Registro de repuestos utilizados con cantidades
- Marcado de tareas como completadas
- Consulta de historial de vehículos

### Problema que Resuelve
Rápido Sur opera 45 vehículos (buses y furgones) y actualmente gestiona el mantenimiento de forma manual, lo que causa:
- Fallas mecánicas frecuentes por mantenimientos atrasados
- Altos costos de reparación
- Tiempos de inactividad significativos de vehículos
- Pérdida de información histórica
- Dificultad para tomar decisiones basadas en datos

### Solución Propuesta
El sistema permite:
- **Digitalización completa**: Elimina papel y Excel, centralizando toda la información
- **Alertas automáticas**: Notifica cuando un vehículo necesita mantenimiento preventivo (por kilometraje o tiempo)
- **Trazabilidad**: Registra todo el historial de mantenimiento de cada vehículo
- **Control de costos**: Suma automáticamente costos de repuestos y mano de obra
- **Disponibilidad**: Calcula tiempos de inactividad de vehículos
- **Control de inventario**: Gestiona stock de repuestos y descuenta automáticamente al usarlos

### Objetivo Medible
Reducir en un 40% las fallas por mantenimiento atrasado durante el primer año de uso.

---

## 2. ¿Para qué empresa o negocio es? - ¿Es real o ficticia?

### Empresa: Rápido Sur (EMPRESA REAL)

**Tipo de Empresa**: Empresa de transporte de pasajeros

**Ubicación**: Chile

**Tamaño de Flota**: 45 vehículos (buses y furgones)

**Contexto Real**:
- Empresa operativa que actualmente utiliza métodos manuales
- Problema real identificado en conjunto con la empresa
- Sistema desarrollado con requisitos reales del negocio
- Implementación planificada para producción real

**Usuarios del Sistema**:
- **Administrador**: Gerente de operaciones (1 persona)
- **Jefes de Mantenimiento**: Supervisores de taller (2 personas)
- **Mecánicos**: Personal técnico (5-7 personas)

**Capacidad Esperada**: 10 usuarios concurrentes

---

## 3. ¿Qué tecnologías usaron?

### Stack Tecnológico Completo

#### Frontend
- **Framework**: React 18
- **Lenguaje**: TypeScript 5
- **Estado Global**: React Context API
- **Enrutamiento**: React Router DOM
- **Peticiones HTTP**: Axios
- **Estilos**: CSS modules / Styled Components

#### Backend
- **Framework**: NestJS 10
- **Runtime**: Node.js 20 LTS
- **Lenguaje**: TypeScript 5
- **Arquitectura**: Modular monolith con patrón N-Tier
- **Validación**: class-validator, class-transformer

#### Base de Datos
- **Motor**: PostgreSQL 15
- **ORM**: TypeORM 0.3
- **Migraciones**: TypeORM migrations
- **Normalización**: Tercera forma normal (3FN)

#### Autenticación y Seguridad
- **Estrategia**: JWT (JSON Web Tokens)
- **Hash de contraseñas**: bcrypt (cost factor 12)
- **Autorización**: RBAC (Role-Based Access Control)
- **Guards**: NestJS Guards y Decoradores personalizados

#### Notificaciones
- **Email**: Nodemailer
- **SMTP**: Gmail SMTP / SendGrid
- **Programación de tareas**: node-cron

#### Infraestructura y Deployment
- **Contenedores**: Docker + Docker Compose
- **Servidor**: VPS en Hostinger
- **Orquestación**: Dokploy
- **Proxy Reverso**: Nginx (incluido en contenedor frontend)
- **SSL**: Let's Encrypt (gestionado por Dokploy)
- **CI/CD**: Auto-deploy desde GitHub

#### Control de Versiones
- **VCS**: Git
- **Repositorio**: GitHub
- **Branching**: Git Flow simplificado

#### Herramientas de Desarrollo
- **IDE**: Visual Studio Code
- **Gestión de paquetes**: npm
- **Linting**: ESLint
- **Testing**: Jest (backend), React Testing Library (frontend)

### Arquitectura General
```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                         │
│                    (Navegador Web - HTTPS)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                     │
│                   Puerto 80/443 (Nginx)                      │
│  - Componentes React  - Context API  - Axios API Client     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (NestJS + TS)                      │
│                        Puerto 3000                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers (Validación + Autorización)            │   │
│  └───────────────────────┬─────────────────────────────┘   │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │  Services (Lógica de Negocio)                       │   │
│  └───────────────────────┬─────────────────────────────┘   │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │  Repositories (TypeORM)                             │   │
│  └───────────────────────┬─────────────────────────────┘   │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 BASE DE DATOS (PostgreSQL)                   │
│                        Puerto 5432                           │
│  - 10+ tablas normalizadas  - Índices  - Foreign Keys       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. ¿Tienes los Informes 1 y 2 anteriores?

**NO** - Este proyecto se documenta desde cero basándose en el código implementado y la arquitectura actual del sistema.

Toda la documentación se genera a partir de:
- Código fuente actual
- Archivo CLAUDE.md (memoria completa del proyecto)
- README.md (documentación principal)
- DATABASE_MODEL.md (modelo de datos)
- Implementación funcional del sistema

---

## 5. ¿Cuántas personas son en el equipo? - ¿Qué rol tuvo cada uno?

### Equipo de Desarrollo: 4 personas

**Composición del Equipo**: Estudiantes de Ingeniería Civil en Computación e Informática

#### Integrantes
1. **Sebastián Rubilar**
   - Rol principal: Arquitectura y Backend
   - Responsabilidades: Diseño de arquitectura, módulos NestJS, integración TypeORM

2. **Cristóbal Bravo**
   - Rol principal: Frontend y UX
   - Responsabilidades: Componentes React, interfaces de usuario, integración con API

3. **Felipe Loyola**
   - Rol principal: Base de Datos y DevOps
   - Responsabilidades: Modelo de datos, migraciones, deployment con Docker/Dokploy

4. **Rodrigo Aguayo**
   - Rol principal: Testing y Documentación
   - Responsabilidades: Pruebas, validaciones, documentación técnica

### Metodología de Trabajo
- **Modelo**: Desarrollo ágil con sprints de 2 semanas
- **Comunicación**: Reuniones semanales + comunicación asíncrona
- **Control de versiones**: Git con branching por feature
- **Revisión de código**: Pull requests revisadas por al menos un compañero

---

## 6. ¿Cuándo es la fecha de entrega/presentación?

**ESTA SEMANA** - Entrega urgente

**Documentación requerida para entrega**:
- ✅ Manual de Usuario
- ✅ Manual de Instalación
- ✅ Plan de Implementación y Mantención
- ✅ Material de Capacitación
- ✅ Prototipo/Ejecutable (código fuente)
- ✅ Script de Base de Datos
- ✅ Diagramas (Arquitectura, Componentes, Procesos, ER, Casos de Uso)

---

## 7. ¿Tienen el prototipo funcionando? - ¿En qué estado está?

### Estado: **FUNCIONANDO COMPLETO** ✅

### Funcionalidades Implementadas (100%)

#### Módulo de Autenticación ✅
- Login con JWT
- Registro de usuarios
- Recuperación de contraseña
- Sesiones persistentes

#### Módulo de Usuarios ✅
- CRUD completo de usuarios
- Gestión de roles (Admin, Jefe Mantenimiento, Mecánico)
- Activación/desactivación de usuarios

#### Módulo de Vehículos ✅
- CRUD completo de vehículos
- Registro de kilometraje
- Historial de mantenimiento por vehículo
- Validación de patentes chilenas

#### Módulo de Planes Preventivos ✅
- Creación de planes por vehículo
- Configuración de intervalos (por KM o por tiempo)
- Activación/desactivación de planes

#### Módulo de Órdenes de Trabajo ✅
- Creación de OT (numeración automática OT-YYYY-NNNNN)
- Asignación a mecánicos
- Gestión de estados (Pendiente → Asignada → En Progreso → Finalizada)
- Cierre con validaciones
- Filtros y búsqueda

#### Módulo de Tareas ✅
- Creación de tareas dentro de OT
- Asignación a mecánicos
- Marcado de completado
- Registro de horas trabajadas

#### Módulo de Repuestos ✅
- CRUD completo de catálogo
- Control de stock
- Registro de uso en tareas
- Precios históricos

#### Módulo de Alertas ✅
- Cron job diario (6:00 AM)
- Alertas por kilometraje (1000 km antes)
- Alertas por tiempo (7 días antes)
- Envío de emails automáticos

#### Módulo de Reportes ✅
- Reporte de costos por vehículo
- Reporte de tiempos de inactividad
- Reporte de disponibilidad de flota
- Exportación a CSV

### Detalles Técnicos del Deployment

**Ambiente de Desarrollo**: Completamente funcional
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Base de datos: PostgreSQL en Docker

**Ambiente de Producción**: Listo para deploy
- Dockerfiles creados y probados
- docker-compose.yml configurado
- Variables de entorno documentadas
- Healthchecks implementados
- SSL ready (Let's Encrypt)

### Calidad del Código

**Cobertura de Tests**:
- Servicios críticos testeados
- Validaciones de DTOs completas
- Tests E2E de flujos principales

**Seguridad**:
- Contraseñas hasheadas con bcrypt (cost 12)
- JWT con expiración
- RBAC implementado en todos los endpoints
- Validación de inputs con class-validator
- CORS configurado
- Headers de seguridad (helmet)

**Performance**:
- Queries optimizadas con índices
- Eager/lazy loading según necesidad
- Paginación en listados
- Cache donde aplica

### Próximos Pasos (Post-Entrega)

Aunque el sistema está completo para la entrega, posibles mejoras futuras:
- Dashboard con gráficos (Chart.js)
- Notificaciones en tiempo real (WebSockets)
- App móvil para mecánicos
- Integración con APIs de proveedores de repuestos
- Análisis predictivo con Machine Learning

---

## Resumen Ejecutivo

**Proyecto**: Sistema de Gestión de Mantenimiento Vehicular para Rápido Sur

**Equipo**: 4 estudiantes de Ingeniería Civil en Computación e Informática (Rubilar, Bravo, Loyola, Aguayo)

**Cliente**: Rápido Sur - Empresa de transporte real con 45 vehículos

**Stack**: React + TypeScript + NestJS + PostgreSQL + Docker

**Estado**: Sistema 100% funcional, listo para entrega y deployment en producción

**Impacto Esperado**: Reducción del 40% en fallas por mantenimiento atrasado en el primer año

**Duración del Proyecto**: 15 semanas (MVP completo)

**Entrega**: Esta semana con documentación completa

---

*Documento generado el 9 de diciembre de 2025*
*Versión 1.0*
