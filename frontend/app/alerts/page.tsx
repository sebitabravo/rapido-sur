"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { AlertTriangle, ArrowLeft, CheckCircle, Bell, Eye, Package } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { AlertDetailDialog } from "@/components/alert-detail-dialog"

interface Alert {
  id: number | string
  tipo_alerta: string
  mensaje: string
  fecha_generacion: string
  email_enviado: boolean
  estado: string
  vehiculo?: {
    id: number
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

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "dismissed">("all")
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    // Solo Admin y JefeMantenimiento pueden ver alertas
    if (!authService.hasAnyRole(["Administrador", "JefeMantenimiento"])) {
      toast.error("No tienes permiso para acceder a esta sección")
      router.push("/dashboard")
      return
    }
    loadAlerts()
  }, [router, filter])

  const loadAlerts = async () => {
    try {
      setLoading(true)

      // Get maintenance alerts (kilometraje/fecha)
      const maintenanceResponse = await api.alerts.getAll()
      const maintenanceAlerts = maintenanceResponse.data || []

      // Get low stock alerts
      let lowStockAlerts: Alert[] = []
      try {
        const stockResponse = await api.parts.getLowStock()
        const lowStockParts = stockResponse.data || []

        // Transform low stock parts into Alert format
        lowStockAlerts = lowStockParts.map((part: unknown) => ({
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

      // Combine alerts
      let allAlerts = [...maintenanceAlerts, ...lowStockAlerts]

      // Filter based on selected filter
      if (filter === "active") {
        allAlerts = allAlerts.filter((a: Alert) => a.estado === "Activa" || a.estado === "EnProceso")
      } else if (filter === "dismissed") {
        allAlerts = allAlerts.filter((a: Alert) => a.estado === "Descartada" || a.estado === "Atendida")
      }

      setAlerts(allAlerts)
    } catch (error) {
      console.error("[v0] Error loading alerts:", error)
      toast.error("Error al cargar las alertas")
    } finally {
      setLoading(false)
    }
  }

  // Solo alertas de mantenimiento (no stock) pueden ver detalles
  const handleViewDetails = (alert: Alert) => {
    // Las alertas de stock tienen id de tipo string "stock-X", no se pueden abrir
    if (typeof alert.id === "string" && alert.id.startsWith("stock-")) {
      toast.info("Alerta de Stock", {
        description: `${alert.repuesto?.nombre}: ${alert.repuesto?.cantidad_stock} unidades (mín: ${alert.repuesto?.stock_minimo})`,
        action: {
          label: "Ir a Repuestos",
          onClick: () => router.push("/parts"),
        },
      })
      return
    }
    setSelectedAlertId(alert.id as number)
    setDetailDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    loadAlerts()
  }

  const getAlertColor = (tipoAlerta: string) => {
    switch (tipoAlerta) {
      case "Kilometraje":
        return "text-destructive"
      case "Stock Bajo":
        return "text-amber-500"
      default:
        return "text-orange-500"
    }
  }

  const getAlertBadge = (tipoAlerta: string) => {
    let variant: "destructive" | "default" | "secondary" = "default"
    if (tipoAlerta === "Kilometraje") variant = "destructive"
    if (tipoAlerta === "Stock Bajo") variant = "secondary"

    return (
      <Badge variant={variant}>
        {tipoAlerta}
      </Badge>
    )
  }

  const getAlertTypeIcon = (tipoAlerta: string) => {
    if (tipoAlerta === "Stock Bajo") {
      return <Package className="h-5 w-5" />
    }
    return <AlertTriangle className="h-5 w-5" />
  }

  const kilometrajeAlerts = alerts.filter((a) => a.tipo_alerta === "Kilometraje")
  const fechaAlerts = alerts.filter((a) => a.tipo_alerta === "Fecha")
  const stockAlerts = alerts.filter((a) => a.tipo_alerta === "Stock Bajo")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <AlertTriangle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Sistema de Alertas</h1>
              <p className="text-sm text-muted-foreground">Monitoree alertas y notificaciones</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-end">
          <Button variant="outline" onClick={loadAlerts} className="gap-2">
            <Bell className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Por Kilometraje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{kilometrajeAlerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Por Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{fechaAlerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stockAlerts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Alertas</CardTitle>
            <CardDescription>Gestione las alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as unknown)} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  <Bell className="h-4 w-4 mr-2" />
                  Todas
                </TabsTrigger>
                <TabsTrigger value="active">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Activas
                </TabsTrigger>
                <TabsTrigger value="dismissed">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Archivadas
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No hay alertas registradas</p>
                <p className="text-xs text-muted-foreground mt-1">Todo está funcionando correctamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-card"
                  >
                    <div className={getAlertColor(alert.tipo_alerta)}>
                      {getAlertTypeIcon(alert.tipo_alerta)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getAlertBadge(alert.tipo_alerta)}
                        {alert.vehiculo && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.vehiculo.patente}
                          </Badge>
                        )}
                        {alert.repuesto && (
                          <Badge variant="outline" className="text-xs">
                            {alert.repuesto.codigo}
                          </Badge>
                        )}
                        {alert.estado === "Activa" && (
                          <Badge variant="destructive" className="text-xs">
                            Activa
                          </Badge>
                        )}
                        {alert.estado === "EnProceso" && (
                          <Badge variant="default" className="text-xs">
                            En Proceso
                          </Badge>
                        )}
                        {alert.estado === "Atendida" && (
                          <Badge variant="outline" className="text-xs">
                            Atendida
                          </Badge>
                        )}
                        {alert.estado === "Descartada" && (
                          <Badge variant="secondary" className="text-xs">
                            Descartada
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium mb-1">{alert.mensaje}</p>

                      {alert.vehiculo && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Vehículo: {alert.vehiculo.marca} {alert.vehiculo.modelo}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {formatDate(alert.fecha_generacion, "dd MMM yyyy HH:mm")}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(alert)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {typeof alert.id === "string" ? "Ver" : "Detalles"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Detail Dialog */}
        <AlertDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          alertId={selectedAlertId}
          onSuccess={handleDialogSuccess}
        />

        {/* Alert Types Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tipos de Alertas</CardTitle>
            <CardDescription>Información sobre los diferentes tipos de alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Alerta por Kilometraje</p>
                  <p className="text-xs text-muted-foreground">
                    Se genera cuando un vehículo está a 1000 km de su próximo mantenimiento preventivo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Alerta por Fecha</p>
                  <p className="text-xs text-muted-foreground">
                    Se activa cuando un vehículo está a 7 días de su próximo mantenimiento preventivo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Package className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Alerta de Stock Bajo</p>
                  <p className="text-xs text-muted-foreground">
                    Se muestra cuando un repuesto tiene menos unidades que su stock mínimo configurado
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
