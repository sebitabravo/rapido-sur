"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Alert {
  id: number
  tipo: string
  mensaje: string
  prioridad: string
  fechaCreacion: string
  activa: boolean
  vehiculo?: {
    id: number
    patente: string
    marca: string
    modelo: string
  }
  ordenTrabajo?: {
    id: number
  }
}

interface UseAlertsOptions {
  activa?: boolean
  autoLoad?: boolean
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { activa, autoLoad = true } = options

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {}
      if (activa !== undefined) params.activa = activa

      const response = await api.alerts.getAll(params)
      setAlerts(response.data.content || [])
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error("Error al cargar las alertas")
    } finally {
      setLoading(false)
    }
  }, [activa])

  const dismissAlert = useCallback(
    async (id: number) => {
      // TODO: Backend endpoint not implemented yet. Need to create PATCH /alertas/:id/descartar
      toast.error("Función de descartar alertas no disponible aún. El endpoint del backend debe ser implementado.")
      console.warn("Backend endpoint /alertas/:id/descartar not implemented")
      return false

      // try {
      //   await api.alerts.dismiss(id)
      //   toast.success("Alerta descartada correctamente")
      //   await loadAlerts()
      //   return true
      // } catch (err) {
      //   toast.error("Error al descartar la alerta")
      //   return false
      // }
    },
    [loadAlerts],
  )

  useEffect(() => {
    if (autoLoad) {
      loadAlerts()
    }
  }, [autoLoad, loadAlerts])

  return {
    alerts,
    loading,
    error,
    loadAlerts,
    dismissAlert,
  }
}
