import axios, { type AxiosError } from "axios"
import { authService } from "./auth"
import { toast } from "sonner"

// Base URL from environment variable or default
// Frontend runs on :8080, but API (backend) runs on :3000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Added 30 second timeout
})

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error("La solicitud tardó demasiado tiempo. Por favor, intente nuevamente.")
      } else if (error.message === "Network Error") {
        toast.error("Error de conexión. Verifique su conexión a internet.")
      } else {
        toast.error("Error de red. No se pudo conectar al servidor.")
      }
      return Promise.reject(error)
    }

    // Handle HTTP errors
    const status = error.response.status
    const data = error.response.data as any

    switch (status) {
      case 400:
        toast.error(data?.message || "Solicitud inválida. Verifique los datos ingresados.")
        break
      case 401:
        // Token expired or invalid
        authService.clearAuth()
        toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.")
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        break
      case 403:
        toast.error("No tiene permisos para realizar esta acción.")
        break
      case 404:
        toast.error(data?.message || "Recurso no encontrado.")
        break
      case 409:
        toast.error(data?.message || "Conflicto. El recurso ya existe.")
        break
      case 422:
        toast.error(data?.message || "Error de validación. Verifique los datos ingresados.")
        break
      case 500:
        toast.error("Error interno del servidor. Por favor, intente más tarde.")
        break
      case 503:
        toast.error("Servicio no disponible. Por favor, intente más tarde.")
        break
      default:
        toast.error(data?.message || "Ha ocurrido un error inesperado.")
    }

    return Promise.reject(error)
  },
)

// API endpoints
export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) => apiClient.post("/auth/login", { email, password }),
    register: (data: { username: string; email: string; password: string; nombre: string }) =>
      apiClient.post("/auth/register", data),
  },

  // Vehicles
  vehicles: {
    getAll: (params?: {
      page?: number
      limit?: number
      search?: string
      estado?: string
      marca?: string
      patente?: string
    }) => apiClient.get("/vehiculos", { params }),
    getById: (id: number) => apiClient.get(`/vehiculos/${id}`),
    create: (data: any) => apiClient.post("/vehiculos", data),
    update: (id: number, data: any) => apiClient.put(`/vehiculos/${id}`, data),
    delete: (id: number) => apiClient.delete(`/vehiculos/${id}`),
  },

  // Preventive Plans
  preventivePlans: {
    getAll: () => apiClient.get("/planes-preventivos"),
    getById: (id: number) => apiClient.get(`/planes-preventivos/${id}`),
    getByVehicle: (vehiculoId: number) => apiClient.get(`/planes-preventivos/vehiculo/${vehiculoId}`),
    create: (data: any) => apiClient.post("/planes-preventivos", data),
    update: (id: number, data: any) => apiClient.patch(`/planes-preventivos/${id}`, data),
    delete: (id: number) => apiClient.delete(`/planes-preventivos/${id}`),
  },

  // Work Orders
  workOrders: {
    getAll: (params?: {
      vehiculo_id?: number
      estado?: string
      tipo?: string
      fecha_inicio?: string
      fecha_fin?: string
      mecanico_id?: number
    }) => apiClient.get("/ordenes-trabajo", { params }),
    getById: (id: number) => apiClient.get(`/ordenes-trabajo/${id}`),
    create: (data: any) => apiClient.post("/ordenes-trabajo", data),
    update: (id: number, data: any) => apiClient.put(`/ordenes-trabajo/${id}`, data),
    updateStatus: (id: number, estado: string) => apiClient.patch(`/ordenes-trabajo/${id}/estado`, { estado }),
    assignMechanic: (id: number, mecanico_id: number) =>
      apiClient.patch(`/ordenes-trabajo/${id}/asignar`, { mecanico_id }),
  },

  // Alerts
  alerts: {
    getAll: () => apiClient.get("/alertas"),
    getPendientes: () => apiClient.get("/alertas/pendientes"),
    getByVehiculo: (vehiculoId: number) => apiClient.get(`/alertas/vehiculo/${vehiculoId}`),
    // TODO: Backend endpoint not implemented yet
    // dismiss: (id: number) => apiClient.patch(`/alertas/${id}/descartar`),
  },

  // Reports
  reports: {
    unavailability: (params: { fecha_inicio: string; fecha_fin: string }) =>
      apiClient.get("/reportes/indisponibilidad", { params }),
    costs: (params: { fecha_inicio: string; fecha_fin: string }) => apiClient.get("/reportes/costos", { params }),
  },

  // Users (Admin only)
  users: {
    getAll: (params?: { page?: number; size?: number; search?: string; role?: string; sort?: string }) =>
      apiClient.get("/usuarios", { params }),
    getById: (id: number) => apiClient.get(`/usuarios/${id}`),
    create: (data: any) => apiClient.post("/usuarios", data),
    update: (id: number, data: any) => apiClient.put(`/usuarios/${id}`, data),
    delete: (id: number) => apiClient.delete(`/usuarios/${id}`),
  },

  // Tasks
  tasks: {
    getAll: () => apiClient.get("/tareas"),
    getById: (id: number) => apiClient.get(`/tareas/${id}`),
    getByWorkOrder: (ordenTrabajoId: number) => apiClient.get(`/tareas/orden-trabajo/${ordenTrabajoId}`),
    create: (data: any) => apiClient.post("/tareas", data),
    update: (id: number, data: any) => apiClient.patch(`/tareas/${id}`, data),
    complete: (id: number) => apiClient.patch(`/tareas/${id}/completar`),
    delete: (id: number) => apiClient.delete(`/tareas/${id}`),
  },

  // Parts (Repuestos)
  parts: {
    getAll: (params?: { search?: string; categoria?: string }) => apiClient.get("/repuestos", { params }),
    getById: (id: number) => apiClient.get(`/repuestos/${id}`),
    create: (data: any) => apiClient.post("/repuestos", data),
    update: (id: number, data: any) => apiClient.patch(`/repuestos/${id}`, data),
    delete: (id: number) => apiClient.delete(`/repuestos/${id}`),
    updateStock: (id: number, cantidad: number) => apiClient.patch(`/repuestos/${id}/stock`, { cantidad }),
  },

  // Part Details (Detalles de Repuestos en Tareas)
  partDetails: {
    getByTask: (tareaId: number) => apiClient.get(`/detalle-repuestos/tarea/${tareaId}`),
    create: (data: any) => apiClient.post("/detalle-repuestos", data),
    update: (id: number, data: any) => apiClient.patch(`/detalle-repuestos/${id}`, data),
    delete: (id: number) => apiClient.delete(`/detalle-repuestos/${id}`),
  },
}
