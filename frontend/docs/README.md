# 📱 Frontend Documentation - Rápido Sur

Documentación completa del frontend Next.js/React del sistema de gestión de mantenimiento vehicular.

---

## 🗂️ Índice de Documentación

### 🎨 Components
Biblioteca de componentes UI reutilizables.

- **[Component Library](./components/COMPONENT_LIBRARY.md)** - Catálogo completo de componentes
- **[Forms](./components/FORMS.md)** - Sistema de formularios con React Hook Form + Zod
- **[State Management](./components/STATE_MANAGEMENT.md)** - Gestión de estado con Zustand

### 🔌 API Integration
Integración con el backend.

- **[API Client](./api-integration/API_CLIENT.md)** - Configuración de Axios y endpoints
- **[Authentication](./api-integration/AUTHENTICATION.md)** - Autenticación JWT en el frontend
- **[Error Handling](./api-integration/ERROR_HANDLING.md)** - Manejo de errores HTTP y UI

### 🚀 Deployment
Despliegue del frontend.

- **[Deployment Guide](./deployment/DEPLOYMENT.md)** - Guía de deploy en producción

### 🎨 Styling
Sistema de diseño y estilos.

- **[Design System](./styling/DESIGN_SYSTEM.md)** - Sistema de diseño y tokens
- **[Tailwind Guide](./styling/TAILWIND_GUIDE.md)** - Guía de Tailwind CSS v4

### 👤 User Flows
Flujos de usuario principales.

- **[Work Orders Flow](./user-flows/WORK_ORDERS_FLOW.md)** - Flujo completo de órdenes de trabajo
- **[Vehicles Flow](./user-flows/VEHICLES_FLOW.md)** - Gestión de vehículos
- **[Alerts Flow](./user-flows/ALERTS_FLOW.md)** - Sistema de alertas preventivas

---

## 🚀 Quick Start

### Instalación
```bash
cd frontend
npm install
```

### Configuración
```bash
cp .env.example .env.local
# Configurar NEXT_PUBLIC_API_URL
```

### Ejecutar en Desarrollo
```bash
npm run dev
# Abre http://localhost:8080
```

### Build para Producción
```bash
npm run build
npm start
```

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15.1.3 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Component Library**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Notifications**: Sonner (toast)

---

## 📄 Estructura de Páginas

```
app/
├── (auth)/
│   └── login/                  # Página de inicio de sesión
├── dashboard/                  # Dashboard principal
├── vehicles/                   # Gestión de vehículos
│   ├── page.tsx               # Lista de vehículos
│   └── [id]/                  # Detalle de vehículo
├── work-orders/               # Órdenes de trabajo
│   └── page.tsx              # Lista y gestión de OT
├── alerts/                    # Alertas preventivas
│   └── page.tsx              # Gestión de alertas
└── reports/                   # Reportes
    └── page.tsx              # Generación de reportes
```

---

## 🧩 Componentes Principales

### Layout Components
- `<Header />` - Header con navegación
- `<Sidebar />` - Barra lateral de navegación
- `<DashboardLayout />` - Layout principal del dashboard

### Feature Components
- `<VehicleDialog />` - Crear/editar vehículos
- `<WorkOrderDialog />` - Crear/editar órdenes de trabajo
- `<WorkOrderDetailDialog />` - Detalle de OT
- `<PreventivePlanDialog />` - Gestión de planes preventivos
- `<ActiveAlerts />` - Widget de alertas activas
- `<RecentWorkOrders />` - Widget de OT recientes
- `<DashboardStats />` - Estadísticas del dashboard

### UI Components (shadcn/ui)
- Button, Card, Dialog, Input, Select, Table, Badge, Tabs, etc.

---

## 🔐 Autenticación

### Flujo de Login
```typescript
// 1. Usuario ingresa credenciales
const response = await api.auth.login(email, password)

// 2. Backend devuelve JWT + user data
{ token: "eyJhbG...", user: { id, email, role } }

// 3. Frontend guarda en localStorage
authService.saveAuth(token, user)

// 4. Axios agrega token automáticamente
headers: { Authorization: `Bearer ${token}` }
```

### Protección de Rutas
```typescript
// Cada página verifica autenticación
if (!authService.isAuthenticated()) {
  router.push("/login")
}
```

---

## 📊 Gestión de Estado

### Estado Global (Zustand)
```typescript
// store.ts
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))
```

### Estado Local (React Hooks)
```typescript
const [workOrders, setWorkOrders] = useState([])
const [loading, setLoading] = useState(true)
```

---

## 🎨 Sistema de Diseño

### Colores
- **Primary**: Azul corporativo de Rápido Sur
- **Success**: Verde para estados completados
- **Warning**: Amarillo para alertas
- **Danger**: Rojo para errores y prioridades altas

### Espaciado
- Sigue escala de Tailwind: 4px base unit

### Tipografía
- **Font**: Inter (system font)
- **Sizes**: text-sm, text-base, text-lg, text-xl, text-2xl

---

## 🔗 Enlaces Relacionados

- [Documentación General del Proyecto](../../README.md)
- [CLAUDE.md - Memoria del Proyecto](../../CLAUDE.md)
- [Backend Documentation](../../backend/docs/README.md)
- [API Reference](../../backend/docs/api/API_REFERENCE.md)

---

**Última actualización**: Noviembre 2025
**Equipo**: Rápido Sur Development Team
