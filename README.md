# Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur

Sistema web completo para la gestión de mantenimiento de la flota vehicular de Rápido Sur. Desarrollado con NestJS (backend) y React + TypeScript (frontend).

## 🎯 Objetivo del Proyecto

Reducir las fallas por mantenimiento atrasado en un 40% durante el primer año mediante la digitalización completa del proceso de mantenimiento vehicular.

## 🏗️ Arquitectura

- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Frontend**: React + TypeScript + Vite
- **Base de Datos**: PostgreSQL 15
- **Deployment**: Docker con docker-compose en servidor Hostinger gestionado por Dokploy

## 📋 Alcance del MVP

1. Gestión completa de vehículos con historial
2. Ciclo completo de órdenes de trabajo (preventivas/correctivas)
3. Sistema de alertas preventivas con notificaciones por email
4. Autenticación con roles (Admin, Jefe de Mantenimiento, Mecánico)
5. Reportes básicos exportables a CSV

## 📦 Prerequisitos

- Node.js 20 LTS
- Docker y Docker Compose
- npm o yarn
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd rapido-sur
```

### 2. Configurar la base de datos

Iniciar PostgreSQL con Docker:

```bash
docker-compose up -d
```

Esto iniciará:

- PostgreSQL en puerto 5432
- PgAdmin en puerto 5050 (<http://localhost:5050>)

Credenciales de PgAdmin:

- Email: <admin@rapidosur.com>
- Password: admin123

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones (cuando estén disponibles)
npm run migration:run

# Iniciar en modo desarrollo
npm run start:dev
```

El backend estará disponible en <http://localhost:3000>

### 4. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en <http://localhost:5173>

## 📁 Estructura del Proyecto

```
rapido-sur/
├── docker-compose.yml               # Orquestación de servicios
├── .gitignore                       # Archivos ignorados por Git
├── README.md                        # Documentación general
├── CLAUDE.md                        # Memoria del proyecto
│
├── backend/                         # API NestJS
│   ├── src/
│   │   ├── modules/                 # Módulos funcionales
│   │   │   ├── auth/                # Autenticación JWT
│   │   │   ├── users/               # Gestión de usuarios y roles
│   │   │   ├── vehicles/            # CRUD de vehículos
│   │   │   ├── preventive-plans/    # Planes de mantenimiento
│   │   │   ├── work-orders/         # Órdenes de trabajo (CORE)
│   │   │   ├── tasks/               # Tareas dentro de OT
│   │   │   ├── parts/               # Catálogo de repuestos
│   │   │   ├── part-details/        # Relación many-to-many tareas-repuestos
│   │   │   ├── alerts/              # Sistema de alertas preventivas
│   │   │   └── reports/             # Generación de reportes
│   │   ├── common/                  # Guards, decorators, pipes
│   │   ├── app.module.ts            # Módulo raíz
│   │   └── main.ts                  # Punto de entrada de la aplicación
│   ├── test/                        # Tests E2E
│   ├── .env                         # Variables de entorno (NO subir a Git)
│   ├── .env.example                 # Template de variables (SÍ subir)
│   ├── Dockerfile                   # Imagen Docker para backend
│   └── package.json                 # Dependencias del backend
│
└── frontend/                        # Aplicación React
    ├── src/
    │   ├── components/              # Componentes reutilizables
    │   ├── pages/                   # Páginas completas por ruta
    │   ├── services/                # Llamadas a API con axios
    │   ├── context/                 # AuthContext y otros contextos
    │   ├── hooks/                   # Custom hooks
    │   ├── types/                   # Interfaces TypeScript
    │   ├── utils/                   # Funciones auxiliares
    │   └── App.tsx                  # Componente raíz
    ├── public/                      # Assets estáticos
    ├── .env                         # Variables de entorno (NO subir)
    ├── .env.example                 # Template de variables (SÍ subir)
    ├── Dockerfile                   # Multi-stage build con nginx
    └── package.json                 # Dependencias del frontend
```

## 👥 Roles y Permisos

- **Administrador**: Gestión completa del sistema
- **Jefe de Mantenimiento**: Crea y supervisa órdenes de trabajo
- **Mecánico**: Ve y trabaja en órdenes asignadas

## 🧪 Testing

### Backend

```bash
cd backend
npm run test              # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Cobertura de tests
```

### Frontend

```bash
cd frontend
npm run test              # Tests con Vitest
```

## 🏗️ Build para Producción

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
# Los archivos estarán en dist/
```

## 📜 Scripts Útiles

### Backend

- `npm run start:dev` - Inicia en modo desarrollo con hot-reload
- `npm run start:debug` - Inicia en modo debug
- `npm run build` - Compila el proyecto
- `npm run format` - Formatea el código con Prettier
- `npm run lint` - Ejecuta ESLint

### Frontend

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa del build de producción
- `npm run lint` - Ejecuta ESLint

## 🗄️ Base de Datos

La base de datos PostgreSQL incluye:

- Gestión de vehículos y su historial
- Órdenes de trabajo (preventivas y correctivas)
- Usuarios y roles
- Registro de tareas y repuestos
- Logs de auditoría

## ✅ Estado Actual

✓ Estructura del proyecto configurada
✓ Backend con NestJS inicializado
✓ Frontend con React + Vite inicializado
✓ Base de datos PostgreSQL en Docker
✓ Configuración de TypeORM
✓ Validación global configurada
✓ CORS habilitado

## 📝 Próximos Pasos

1. Implementar entidades del sistema (Vehicle, WorkOrder, User, etc.)
2. Crear módulos de autenticación y autorización
3. Desarrollar endpoints REST para cada módulo
4. Implementar interfaz de usuario en React
5. Configurar sistema de alertas por email
6. Implementar generación de reportes
7. Testing exhaustivo
8. Deployment en Hostinger con Dokploy

## 👨‍💻 Equipo

Proyecto universitario para Rápido Sur

## 📄 Licencia

MIT

## 💬 Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.
