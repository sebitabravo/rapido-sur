export interface User {
  id: number
  email: string
  rol: "Administrador" | "JefeMantenimiento" | "Mecanico"
  nombreCompleto: string
  activo?: boolean
}

export interface AuthResponse {
  access_token: string
  user: User
}

const TOKEN_KEY = "rapido_sur_token"
const USER_KEY = "rapido_sur_user"
const AUTH_VERSION_KEY = "rapido_sur_auth_version"
const CURRENT_AUTH_VERSION = "2.0" // Increment this when auth structure changes

/**
 * Migrate old user structure to new structure
 */
function migrateUser(oldUser: any): User {
  // If already migrated, return as is
  if (oldUser.rol) {
    return oldUser as User
  }

  // Migrate old structure to new
  return {
    id: oldUser.id,
    email: oldUser.email,
    rol: oldUser.role || oldUser.rol || "Mecanico", // Map old 'role' to new 'rol'
    nombreCompleto: oldUser.nombreCompleto || oldUser.nombre || oldUser.nombre_completo || "",
    activo: oldUser.activo !== false,
  }
}

export const authService = {
  // Initialize auth service - migrates old data and clears incompatible data
  init() {
    if (typeof window !== "undefined") {
      const storedVersion = localStorage.getItem(AUTH_VERSION_KEY)
      
      // If version mismatch, try to migrate user data
      if (storedVersion !== CURRENT_AUTH_VERSION) {
        const userStr = localStorage.getItem(USER_KEY)
        if (userStr) {
          try {
            const oldUser = JSON.parse(userStr)
            const migratedUser = migrateUser(oldUser)
            // Re-save with migrated structure
            localStorage.setItem(USER_KEY, JSON.stringify(migratedUser))
            localStorage.setItem(AUTH_VERSION_KEY, CURRENT_AUTH_VERSION)
          } catch (error) {
            // If migration fails, clear auth data
            this.clearAuth()
            localStorage.setItem(AUTH_VERSION_KEY, CURRENT_AUTH_VERSION)
          }
        } else {
          localStorage.setItem(AUTH_VERSION_KEY, CURRENT_AUTH_VERSION)
        }
      }
    }
  },

  // Save token and user to localStorage
  saveAuth(token: string, user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(AUTH_VERSION_KEY, CURRENT_AUTH_VERSION)
    }
  },

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  // Get user from localStorage
  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(USER_KEY)
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          // Always apply migration in case data is outdated
          return migrateUser(user)
        } catch (error) {
          return null
        }
      }
    }
    return null
  },

  // Clear auth data
  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Check if user has specific role
  hasRole(rol: User["rol"]): boolean {
    const user = this.getUser()
    return user?.rol === rol
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles: User["rol"][]): boolean {
    const user = this.getUser()
    return user ? roles.includes(user.rol) : false
  },
}
