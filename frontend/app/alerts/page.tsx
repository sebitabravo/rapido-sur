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
import { AlertTriangle, ArrowLeft, X, CheckCircle, Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "dismissed">("active")

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadAlerts()
  }, [router, filter])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const response = await api.alerts.getAll()
      const allAlerts = response.data || []

      let filteredAlerts = allAlerts
      if (filter === "active") {
        filteredAlerts = allAlerts.filter((alert: Alert) => alert.activa === true)
      } else if (filter === "dismissed") {
        filteredAlerts = allAlerts.filter((alert: Alert) => alert.activa === false)
      }

      setAlerts(filteredAlerts)
    } catch (error) {
      console.error("[v0] Error loading alerts:", error)
      toast.error("Error al cargar las alertas")
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (id: number) => {
    // TODO: Backend endpoint not implemented yet. Need to create PATCH /alertas/:id/descartar
    toast.error("Función de descartar alertas no disponible aún. El endpoint del backend debe ser implementado.")
    console.warn("Backend endpoint /alertas/:id/descartar not implemented")

    // try {
    //   await api.alerts.dismiss(id)
    //   toast.success("Alerta descartada correctamente")
    //   loadAlerts()
    // } catch (error) {
    //   console.error("[v0] Error dismissing alert:", error)
    //   toast.error("Error al descartar la alerta")
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

  const getPriorityBadge = (prioridad: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ALTA: "destructive",
      MEDIA: "default",
      BAJA: "secondary",
    }
    return <Badge variant={variants[prioridad] || "outline"}>{prioridad}</Badge>
  }

  const getAlertTypeIcon = (tipo: string) => {
    return <AlertTriangle className="h-5 w-5" />
  }

  const activeAlerts = alerts.filter((a) => a.activa)
  const criticalAlerts = activeAlerts.filter((a) => a.prioridad === "ALTA")

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{criticalAlerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
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
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
              <TabsList>
                <TabsTrigger value="active">
                  <Bell className="h-4 w-4" />
                  Activas
                </TabsTrigger>
                <TabsTrigger value="dismissed">
                  <BellOff className="h-4 w-4" />
                  Descartadas
                </TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
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
                <p className="text-sm text-muted-foreground">
                  {filter === "active"
                    ? "No hay alertas activas"
                    : filter === "dismissed"
                      ? "No hay alertas descartadas"
                      : "No hay alertas registradas"}
                </p>
                {filter === "active" && (
                  <p className="text-xs text-muted-foreground mt-1">Todo está funcionando correctamente</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg ${
                      alert.activa ? "bg-card" : "bg-muted/30 opacity-75"
                    }`}
                  >
                    <div className={getPriorityColor(alert.prioridad)}>{getAlertTypeIcon(alert.tipo)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getPriorityBadge(alert.prioridad)}
                        <Badge variant="outline" className="text-xs">
                          {alert.tipo.replace("_", " ")}
                        </Badge>
                        {alert.vehiculo && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.vehiculo.patente}
                          </Badge>
                        )}
                        {!alert.activa && (
                          <Badge variant="outline" className="text-xs">
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
                        {format(new Date(alert.fechaCreacion), "dd MMM yyyy HH:mm", { locale: es })}
                      </p>
                    </div>

                    {alert.activa && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDismiss(alert.id)}
                        title="Descartar alerta"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Types Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tipos de Alertas</CardTitle>
            <CardDescription>Información sobre los diferentes tipos de alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Mantenimiento Vencido</p>
                  <p className="text-xs text-muted-foreground">
                    Se genera cuando un vehículo tiene mantenimiento preventivo vencido
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Kilometraje Alto</p>
                  <p className="text-xs text-muted-foreground">
                    Se activa cuando un vehículo alcanza el umbral de kilometraje
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Orden Pendiente</p>
                  <p className="text-xs text-muted-foreground">
                    Notifica sobre órdenes de trabajo pendientes de atención
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Vehículo Fuera de Servicio</p>
                  <p className="text-xs text-muted-foreground">
                    Alerta cuando un vehículo está fuera de servicio por tiempo prolongado
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
