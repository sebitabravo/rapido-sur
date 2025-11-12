"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface WorkOrder {
  id: number
  vehiculo: {
    id: number
    patente: string
    marca: string
    modelo: string
  }
  tipo: string
  estado: string
  prioridad: string
  fechaCreacion: string
  fechaInicio?: string
  fechaFinalizacion?: string
  descripcion: string
  observaciones?: string
  costoEstimado?: number
  costoReal?: number
  mecanico?: {
    id: number
    nombre: string
  }
}

interface UseWorkOrdersOptions {
  page?: number
  size?: number
  search?: string
  estado?: string
  prioridad?: string
  tipo?: string
  sort?: string
  autoLoad?: boolean
}

export function useWorkOrders(options: UseWorkOrdersOptions = {}) {
  const { page = 0, size = 10, search, estado, prioridad, tipo, sort = "fechaCreacion,desc", autoLoad = true } = options

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const loadWorkOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = { page, size, sort }
      if (search) params.search = search
      if (estado && estado !== "all") params.estado = estado
      if (prioridad && prioridad !== "all") params.prioridad = prioridad
      if (tipo && tipo !== "all") params.tipo = tipo

      const response = await api.workOrders.getAll(params)
      const data = response.data

      setWorkOrders(data.items || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.total || 0)
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error("Error al cargar las órdenes de trabajo")
    } finally {
      setLoading(false)
    }
  }, [page, size, search, estado, prioridad, tipo, sort])

  const createWorkOrder = useCallback(
    async (orderData: Partial<WorkOrder>) => {
      try {
        await api.workOrders.create(orderData)
        toast.success("Orden de trabajo creada correctamente")
        await loadWorkOrders()
        return true
      } catch (err) {
        toast.error("Error al crear la orden de trabajo")
        return false
      }
    },
    [loadWorkOrders],
  )

  const updateWorkOrder = useCallback(
    async (id: number, orderData: Partial<WorkOrder>) => {
      try {
        await api.workOrders.update(id, orderData)
        toast.success("Orden de trabajo actualizada correctamente")
        await loadWorkOrders()
        return true
      } catch (err) {
        toast.error("Error al actualizar la orden de trabajo")
        return false
      }
    },
    [loadWorkOrders],
  )

  const deleteWorkOrder = useCallback(
    async (id: number) => {
      try {
        await api.workOrders.delete(id)
        toast.success("Orden de trabajo eliminada correctamente")
        await loadWorkOrders()
        return true
      } catch (err) {
        toast.error("Error al eliminar la orden de trabajo")
        return false
      }
    },
    [loadWorkOrders],
  )

  useEffect(() => {
    if (autoLoad) {
      loadWorkOrders()
    }
  }, [autoLoad, loadWorkOrders])

  return {
    workOrders,
    loading,
    error,
    totalPages,
    totalItems,
    loadWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  }
}
