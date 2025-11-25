"use client"

import { useStore } from "@/lib/store"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function useAuth() {
  const router = useRouter()
  const { token, user, isAuthenticated, setAuth, clearAuth, hasRole, hasAnyRole } = useStore()

  const login = async (username: string, password: string) => {
    try {
      const response = await api.auth.login({ username, password })
      const { token, user } = response.data

      setAuth(token, user)
      toast.success(`Bienvenido, ${user.nombre_completo`)
      router.push("/dashboard")
      return true
    } catch (error) {
      toast.error("Credenciales inválidas")
      return false
    }
  }

  const logout = () => {
    clearAuth()
    router.push("/login")
    toast.info("Sesión cerrada")
  }

  const checkAuth = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return false
    }
    return true
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    hasAnyRole,
  }
}
