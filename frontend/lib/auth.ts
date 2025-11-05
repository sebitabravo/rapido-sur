export interface User {
  id: number
  username: string
  email: string
  role: "ADMIN" | "SUPERVISOR" | "MECANICO"
  nombre: string
}

export interface AuthResponse {
  token: string
  user: User
}

const TOKEN_KEY = "rapido_sur_token"
const USER_KEY = "rapido_sur_user"

export const authService = {
  // Save token and user to localStorage
  saveAuth(token: string, user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
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
      return userStr ? JSON.parse(userStr) : null
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
  hasRole(role: User["role"]): boolean {
    const user = this.getUser()
    return user?.role === role
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles: User["role"][]): boolean {
    const user = this.getUser()
    return user ? roles.includes(user.role) : false
  },
}
