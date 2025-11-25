import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: number
  username: string
  email: string
  role: "Administrador" | "JefeMantenimiento" | "Mecanico"
  nombre: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  hasRole: (role: User["role"]) => boolean
  hasAnyRole: (roles: User["role"][]) => boolean
}

interface NotificationState {
  notifications: Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  addNotification: (message: string, type: "success" | "error" | "info") => void
  removeNotification: (id: string) => void
}

interface AppState extends AuthState, NotificationState {}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true })
      },

      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      hasRole: (role: User["role"]) => {
        const { user } = get()
        return user?.rol === role
      },

      hasAnyRole: (roles: User["role"][]) => {
        const { user } = get()
        return user ? roles.includes(user.rol) : false
      },

      // Notification state
      notifications: [],

      addNotification: (message: string, type: "success" | "error" | "info") => {
        const id = Math.random().toString(36).substring(7)
        set((state) => ({
          notifications: [...state.notifications, { id, message, type }],
        }))
        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id)
        }, 5000)
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
    }),
    {
      name: "rapido-sur-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
