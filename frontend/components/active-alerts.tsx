"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { AlertDetailDialog } from "@/components/alert-detail-dialog"

interface Alert {
  id: number | string
  tipo_alerta: string
  mensaje: string
  fecha_generacion: string
  email_enviado: boolean
  estado: string
  orden_trabajo_id?: number
  descartada_por_id?: number
  vehiculo?: {
    patente: string
    marca: string
    modelo: string
  }
  repuesto?: {
    id: number
    codigo: string
    nombre: string
    cantidad_stock: number
    stock_minimo: number
  }
}

export function ActiveAlerts({ onRefresh }: { onRefresh?: () => void }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      // Get maintenance alerts (kilometraje/fecha)
      const maintenanceResponse = await api.alerts.getAll()
      const maintenanceAlerts = maintenanceResponse.data || []

      // Get low stock alerts
      let lowStockAlerts: Alert[] = []
      try {
        const stockResponse = await api.parts.getLowStock()
        const lowStockParts = stockResponse.data || []

        // Transform low stock parts into Alert format
        lowStockAlerts = lowStockParts.map((part: any) => ({
          id: `stock-${part.id}`,
          tipo_alerta: "Stock Bajo",
          mensaje: `${part.nombre} - Stock: ${part.cantidad_stock} (Mínimo: ${part.stock_minimo})`,
          fecha_generacion: new Date().toISOString(),
          email_enviado: false,
          estado: "Activa",
          repuesto: {
            id: part.id,
            codigo: part.codigo,
            nombre: part.nombre,
            cantidad_stock: part.cantidad_stock,
            stock_minimo: part.stock_minimo,
          },
        }))
      } catch (error) {
        console.error("Error loading low stock alerts:", error)
      }

      // Combine both types of alerts
      const allAlerts = [...maintenanceAlerts, ...lowStockAlerts]

      // DEBUG: Log para ver qué campos vienen del backend
      if (allAlerts.length > 0) {
        console.log("🔍 Primera alerta:", allAlerts[0])
        console.log("🔍 Campos disponibles:", Object.keys(allAlerts[0]))
      }

      // Filter only ACTIVE maintenance alerts (stock alerts are always active)
      const activeMaintenanceAlerts = maintenanceAlerts.filter((alert: Alert) =>
        alert.estado === "Activa"
      )

      const activeAlerts = [...activeMaintenanceAlerts, ...lowStockAlerts]

      console.log(`📊 Total alertas: ${allAlerts.length}, Activas: ${activeAlerts.length}, Stock Bajo: ${lowStockAlerts.length}`)

      setAlerts(activeAlerts.slice(0, 20))
    } catch (error) {
      console.error("Error loading alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAlert = (alert: Alert) => {
    // Don't open detail dialog for stock alerts (they don't have actions like maintenance alerts)
    if (alert.tipo_alerta === "Stock Bajo") {
      return
    }
    setSelectedAlert(alert)
    setDetailDialogOpen(true)
  }

  const handleAlertSuccess = () => {
    // Reload alerts after dismissing or creating work order
    loadAlerts()
    // Trigger refresh for other components (like dashboard stats)
    if (onRefresh) {
      onRefresh()
    }
  }

  const getAlertColor = (tipo: string) => {
    // Different colors for different alert types
    if (tipo === "Kilometraje") return "text-destructive" // Red
    if (tipo === "Stock Bajo") return "text-orange-500" // Orange
    return "text-yellow-600" // Yellow for Fecha
  }

  const getAlertBadge = (tipo: string) => {
    if (tipo === "Kilometraje") return "destructive" // Red badge
    if (tipo === "Stock Bajo") return "default" // Orange badge
    return "outline" // Yellow outline for Fecha
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas Activas
        </CardTitle>
        <CardDescription>Notificaciones que requieren atención</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No hay alertas activas</p>
            <p className="text-xs text-muted-foreground mt-1">Todo está funcionando correctamente</p>
          </div>
        ) : (
          <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                  alert.tipo_alerta !== "Stock Bajo" ? "hover:bg-accent/50 cursor-pointer" : ""
                }`}
                onClick={() => handleViewAlert(alert)}
              >
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
                    {alert.repuesto && (
                      <span className="text-xs text-muted-foreground">
                        {alert.repuesto.codigo}
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
                {alert.tipo_alerta !== "Stock Bajo" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewAlert(alert)
                    }}
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        alertId={selectedAlert?.id || null}
        onSuccess={handleAlertSuccess}
      />
    </Card>
  )
}
