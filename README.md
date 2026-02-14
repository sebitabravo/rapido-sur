# Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/sebitabravo/rapido-sur)
Sistema web completo para la gestión de mantenimiento de la flota vehicular de Rápido Sur. Reduce fallas por mantenimiento atrasado en un 40% durante el primer año.

## 🏗️ Tech Stack

- **Backend**: NestJS + TypeScript + PostgreSQL
- **Frontend**: Next.js 15 + React 18 + Tailwind CSS
- **Deployment**: Docker en Dokploy (Hostinger)

## 📦 Requisitos

- Node.js 20 LTS
- Docker y Docker Compose
- Git

## ⚡ Quick Start

### Opción 1: Desarrollo Local (Recomendado)

```bash
# Instalar dependencias
npm run install:all

# Configurar variables de entorno
cp .env.example .env
cd backend && cp .env.example .env && cd ..
cd frontend && cp .env.example .env.local && cd ..

# Levantar TODO (DB + Backend + Frontend)
npm run dev
```

**Acceso:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- PostgreSQL: localhost:5432

### Opción 2: Docker Completo

```bash
docker-compose up -d
```

**Acceso:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

---

## 📚 Documentación

**Para diferentes casos, consulta:**

| Necesitas... | Lee... |
|-------------|--------|
| Entender qué documento leer | [DOCUMENTACION.md](./DOCUMENTACION.md) |
| Aprender arquitectura y decisiones | [CLAUDE.md](./CLAUDE.md) |
| Entender la BD | [DATABASE_MODEL.md](./docs/DATABASE_MODEL.md) |
| Deployr a producción | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| Resolver un error | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Usar scripts DevOps | [devops/README.md](./devops/README.md)

## 📁 Estructura del Proyecto

```
rapido-sur/
├── docker-compose.yml               # Para PRODUCCIÓN (Dokploy)
├── docker-compose.dev.yml           # Para desarrollo local (solo BD)
├── docker-compose.full.yml          # Stack completo dockerizado
├── DOCKER_GUIDE.md                  # Guía completa de Docker
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

## 🔑 Credenciales de Prueba

Usuarios de prueba para ambiente de desarrollo/demo:

- `admin@rapidosur.cl` → `Admin123!`
- `jefe@rapidosur.cl` → `Manager123!`
- `mecanico@rapidosur.cl` → `Mechanic123!`

⚠️ **Para producción:** Cambia todas las credenciales inmediatamente.

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

---

## 🚀 Deployment en Producción

Para instrucciones completas de deployment en Dokploy, ve a **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

Incluye:
- Generación de secrets seguros
- Configuración de variables de entorno
- Proceso de deployment paso a paso
- Verificación y troubleshooting

---

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
