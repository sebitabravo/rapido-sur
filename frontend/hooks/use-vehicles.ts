"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Vehicle {
  id: number
  patente: string
  marca: string
  modelo: string
  anio: number
  tipo: string
  estado: string
  kilometraje: number
  ultimoMantenimiento?: string
}

interface UseVehiclesOptions {
  page?: number
  size?: number
  search?: string
  estado?: string
  tipo?: string
  sort?: string
  autoLoad?: boolean
}

export function useVehicles(options: UseVehiclesOptions = {}) {
  const { page = 0, size = 10, search, estado, tipo, sort = "patente,asc", autoLoad = true } = options

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = { page, size, sort }
      if (search) params.search = search
      if (estado && estado !== "all") params.estado = estado
      if (tipo && tipo !== "all") params.tipo = tipo

      const response = await api.vehicles.getAll(params)
      const data = response.data

      setVehicles(data.items || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.total || 0)
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error("Error al cargar los vehículos")
    } finally {
      setLoading(false)
    }
  }, [page, size, search, estado, tipo, sort])

  const createVehicle = useCallback(
    async (vehicleData: Partial<Vehicle>) => {
      try {
        await api.vehicles.create(vehicleData)
        toast.success("Vehículo creado correctamente")
        await loadVehicles()
        return true
      } catch (err) {
        toast.error("Error al crear el vehículo")
        return false
      }
    },
    [loadVehicles],
  )

  const updateVehicle = useCallback(
    async (id: number, vehicleData: Partial<Vehicle>) => {
      try {
        await api.vehicles.update(id, vehicleData)
        toast.success("Vehículo actualizado correctamente")
        await loadVehicles()
        return true
      } catch (err) {
        toast.error("Error al actualizar el vehículo")
        return false
      }
    },
    [loadVehicles],
  )

  const deleteVehicle = useCallback(
    async (id: number) => {
      try {
        await api.vehicles.delete(id)
        toast.success("Vehículo eliminado correctamente")
        await loadVehicles()
        return true
      } catch (err) {
        toast.error("Error al eliminar el vehículo")
        return false
      }
    },
    [loadVehicles],
  )

  useEffect(() => {
    if (autoLoad) {
      loadVehicles()
    }
  }, [autoLoad, loadVehicles])

  return {
    vehicles,
    loading,
    error,
    totalPages,
    totalItems,
    loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  }
}
