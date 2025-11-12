"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, X } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Alert {
  id: number
  tipo_alerta: string
  mensaje: string
  fecha_generacion: string
  email_enviado: boolean
  vehiculo?: {
    patente: string
    marca: string
    modelo: string
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
      // Get all alerts (they are all "active" by definition - pending deletion when WO is created)
      const allAlerts = response.data || []
      setAlerts(allAlerts.slice(0, 5))
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

  const getAlertColor = (tipo: string) => {
    // Kilometraje alerts are more critical than Fecha alerts
    return tipo === "Kilometraje" ? "text-destructive" : "text-orange-500"
  }
  
  const getAlertBadge = (tipo: string) => {
    return tipo === "Kilometraje" ? "destructive" : "outline"
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
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${getAlertColor(alert.tipo_alerta)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getAlertBadge(alert.tipo_alerta)} className="text-xs">
                      {alert.tipo_alerta}
                    </Badge>
                    {alert.vehiculo && (
                      <span className="text-xs text-muted-foreground">
                        {alert.vehiculo.patente}
                      </span>
                    )}
                    {!alert.email_enviado && (
                      <Badge variant="secondary" className="text-xs">
                        Nueva
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{alert.mensaje}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(alert.fecha_generacion, "dd MMM yyyy HH:mm")}
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
