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
    login: (data: { username: string; password: string }) => apiClient.post("/auth/login", data),
    register: (data: { username: string; email: string; password: string; nombre: string }) =>
      apiClient.post("/auth/register", data),
  },

  // Vehicles
  vehicles: {
    getAll: (params?: {
      page?: number
      size?: number
      search?: string
      estado?: string
      tipo?: string
      sort?: string
    }) => apiClient.get("/vehiculos", { params }),
    getById: (id: number) => apiClient.get(`/vehiculos/${id}`),
    create: (data: any) => apiClient.post("/vehiculos", data),
    update: (id: number, data: any) => apiClient.put(`/vehiculos/${id}`, data),
    delete: (id: number) => apiClient.delete(`/vehiculos/${id}`),
  },

  // Work Orders
  workOrders: {
    getAll: (params?: {
      page?: number
      size?: number
      estado?: string
      prioridad?: string
      tipo?: string
      search?: string
      sort?: string
      vehiculoId?: string
    }) => apiClient.get("/ordenes-trabajo", { params }),
    getById: (id: number) => apiClient.get(`/ordenes-trabajo/${id}`),
    create: (data: any) => apiClient.post("/ordenes-trabajo", data),
    update: (id: number, data: any) => apiClient.put(`/ordenes-trabajo/${id}`, data),
    updateStatus: (id: number, estado: string) => apiClient.patch(`/ordenes-trabajo/${id}/estado`, { estado }),
  },

  // Alerts
  alerts: {
    getAll: (params?: { activa?: boolean; vehiculoId?: string }) => apiClient.get("/alertas", { params }),
    getById: (id: number) => apiClient.get(`/alertas/${id}`),
    dismiss: (id: number) => apiClient.patch(`/alertas/${id}/desactivar`),
  },

  // Reports
  reports: {
    unavailability: (params: { fechaInicio: string; fechaFin: string }) =>
      apiClient.get("/reportes/indisponibilidad", { params }),
    costs: (params: { fechaInicio: string; fechaFin: string }) => apiClient.get("/reportes/costos", { params }),
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
}
