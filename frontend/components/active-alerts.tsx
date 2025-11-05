"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Alert {
  id: number
  tipo: string
  mensaje: string
  prioridad: string
  fechaCreacion: string
  vehiculo?: {
    patente: string
  }
}

export function ActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await api.alerts.getAll()
      const allAlerts = response.data || []
      const activeAlerts = allAlerts.filter((alert: any) => alert.activa === true)
      setAlerts(activeAlerts.slice(0, 5))
    } catch (error) {
      console.error("[v0] Error loading alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (id: number) => {
    // TODO: Backend endpoint not implemented yet. Need to create PATCH /alertas/:id/descartar
    console.warn("Backend endpoint /alertas/:id/descartar not implemented")

    // try {
    //   await api.alerts.dismiss(id)
    //   setAlerts(alerts.filter((alert) => alert.id !== id))
    // } catch (error) {
    //   console.error("[v0] Error dismissing alert:", error)
    // }
  }

  const getPriorityColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      ALTA: "text-destructive",
      MEDIA: "text-orange-500",
      BAJA: "text-yellow-500",
    }
    return colors[prioridad] || "text-muted-foreground"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas Activas
        </CardTitle>
        <CardDescription>Notificaciones que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No hay alertas activas</p>
            <p className="text-xs text-muted-foreground mt-1">Todo está funcionando correctamente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${getPriorityColor(alert.prioridad)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={alert.prioridad === "ALTA" ? "destructive" : "outline"} className="text-xs">
                      {alert.prioridad}
                    </Badge>
                    {alert.vehiculo && <span className="text-xs text-muted-foreground">{alert.vehiculo.patente}</span>}
                  </div>
                  <p className="text-sm font-medium">{alert.tipo.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.mensaje}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(alert.fechaCreacion), "dd MMM yyyy HH:mm", { locale: es })}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDismiss(alert.id)} title="Descartar">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
