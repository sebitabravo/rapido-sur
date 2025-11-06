"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface User {
  id: number
  username: string
  email: string
  nombre: string
  role: "ADMIN" | "SUPERVISOR" | "MECANICO"
}

interface UseUsersOptions {
  page?: number
  size?: number
  search?: string
  role?: string
  sort?: string
  autoLoad?: boolean
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, size = 10, search, role, sort = "nombre,asc", autoLoad = true } = options

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = { page, size, sort }
      if (search) params.search = search
      if (role && role !== "all") params.role = role

      const response = await api.users.getAll(params)
      const data = response.data

      setUsers(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.totalElements || 0)
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error("Error al cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }, [page, size, search, role, sort])

  const createUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        await api.users.create(userData)
        toast.success("Usuario creado correctamente")
        await loadUsers()
        return true
      } catch (err) {
        toast.error("Error al crear el usuario")
        return false
      }
    },
    [loadUsers],
  )

  const updateUser = useCallback(
    async (id: number, userData: Partial<User>) => {
      try {
        await api.users.update(id, userData)
        toast.success("Usuario actualizado correctamente")
        await loadUsers()
        return true
      } catch (err) {
        toast.error("Error al actualizar el usuario")
        return false
      }
    },
    [loadUsers],
  )

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        await api.users.delete(id)
        toast.success("Usuario eliminado correctamente")
        await loadUsers()
        return true
      } catch (err) {
        toast.error("Error al eliminar el usuario")
        return false
      }
    },
    [loadUsers],
  )

  useEffect(() => {
    if (autoLoad) {
      loadUsers()
    }
  }, [autoLoad, loadUsers])

  return {
    users,
    loading,
    error,
    totalPages,
    totalItems,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}
