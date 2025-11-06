"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { authService } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PreventivePlanDialog } from "@/components/preventive-plan-dialog"
import { ArrowLeft, Truck, Wrench, AlertTriangle, TrendingUp, Calendar, Plus, Edit } from "lucide-react"
import { formatDate } from "@/lib/utils"
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

interface WorkOrder {
  id: number
  tipo: string
  estado: string
  prioridad: string
  fechaCreacion: string
  fechaFinalizacion?: string
  descripcion: string
  costoReal?: number
}

interface Alert {
  id: number
  tipo: string
  mensaje: string
  prioridad: string
  fechaCreacion: string
  activa: boolean
}

interface PreventivePlan {
  id: number
  tipo_mantenimiento: string
  tipo_intervalo: string
  intervalo: number
  descripcion: string
  proximo_kilometraje?: number
  proxima_fecha?: string
  activo: boolean
  vehiculo: {
    id: number
    patente: string
  }
}

export default function VehicleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [preventivePlan, setPreventivePlan] = useState<PreventivePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadVehicleData()
  }, [router, vehicleId])

  const loadVehicleData = async () => {
    try {
      setLoading(true)

      const [vehicleRes, ordersRes, alertsRes] = await Promise.all([
        api.vehicles.getById(Number(vehicleId)),
        api.workOrders.getAll({ vehiculo_id: Number(vehicleId) }),
        api.alerts.getAll(),
      ])

      setVehicle(vehicleRes.data)
      setWorkOrders(ordersRes.data || [])

      const allAlerts = alertsRes.data || []
      const vehicleAlerts = allAlerts.filter((alert: any) => alert.vehiculo?.id === Number(vehicleId))
      setAlerts(vehicleAlerts)

      // Load preventive plan for this vehicle
      await loadPreventivePlan()
    } catch (error) {
      console.error("[v0] Error loading vehicle data:", error)
      toast.error("Error al cargar los datos del vehículo")
    } finally {
      setLoading(false)
    }
  }

  const loadPreventivePlan = async () => {
    try {
      const response = await api.preventivePlans.getByVehicle(Number(vehicleId))
      setPreventivePlan(response.data)
    } catch (error: any) {
      // It's normal for a vehicle to not have a plan yet
      if (error.response?.status !== 404) {
        console.error("[v0] Error loading preventive plan:", error)
      }
      setPreventivePlan(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Cargando detalles del vehículo..." />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Vehículo no encontrado</p>
          <Button onClick={() => router.push("/vehicles")} className="mt-4">
            Volver a Vehículos
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      OPERATIVO: "default",
      EN_MANTENIMIENTO: "outline",
      FUERA_DE_SERVICIO: "destructive",
    }
    return <Badge variant={variants[estado] || "outline"}>{estado.replace("_", " ")}</Badge>
  }

  const totalCost = workOrders.reduce((sum, order) => sum + (order.costoReal || 0), 0)
  const completedOrders = workOrders.filter((o) => o.estado === "Finalizada").length
  const activeAlerts = alerts.filter((a) => a.activa).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/vehicles")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{vehicle.patente}</h1>
              <p className="text-sm text-muted-foreground">
                {vehicle.marca} {vehicle.modelo} ({vehicle.anio})
              </p>
            </div>
          </div>
          {getStatusBadge(vehicle.estado)}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Vehicle Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Kilometraje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicle.kilometraje.toLocaleString()} km</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{activeAlerts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patente</p>
                <p className="font-medium">{vehicle.patente}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{vehicle.marca}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{vehicle.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Año</p>
                <p className="font-medium">{vehicle.anio}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{vehicle.tipo.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">{vehicle.estado.replace("_", " ")}</p>
              </div>
              {vehicle.ultimoMantenimiento && (
                <div>
                  <p className="text-sm text-muted-foreground">Último Mantenimiento</p>
                  <p className="font-medium">{formatDate(vehicle.ultimoMantenimiento)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preventive Plan Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Plan de Mantenimiento Preventivo</CardTitle>
              </div>
              {preventivePlan ? (
                <Button variant="outline" size="sm" onClick={() => setPlanDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Plan
                </Button>
              ) : (
                <Button size="sm" onClick={() => setPlanDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {preventivePlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Mantenimiento</p>
                  <p className="font-medium">{preventivePlan.tipo_mantenimiento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Intervalo</p>
                  <p className="font-medium">
                    {preventivePlan.tipo_intervalo === "KM" ? "Por Kilometraje" : "Por Tiempo"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Intervalo</p>
                  <p className="font-medium">
                    {preventivePlan.intervalo.toLocaleString()}{" "}
                    {preventivePlan.tipo_intervalo === "KM" ? "km" : "días"}
                  </p>
                </div>
                {preventivePlan.tipo_intervalo === "KM" && preventivePlan.proximo_kilometraje && (
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo Mantenimiento</p>
                    <p className="font-medium">{preventivePlan.proximo_kilometraje.toLocaleString()} km</p>
                  </div>
                )}
                {preventivePlan.tipo_intervalo === "Tiempo" && preventivePlan.proxima_fecha && (
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Fecha</p>
                    <p className="font-medium">{formatDate(preventivePlan.proxima_fecha)}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">{preventivePlan.descripcion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={preventivePlan.activo ? "default" : "secondary"}>
                    {preventivePlan.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Este vehículo no tiene un plan de mantenimiento preventivo configurado
                </p>
                <Button onClick={() => setPlanDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plan Preventivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for History */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">
              <Wrench className="h-4 w-4" />
              Historial de Órdenes
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="stats">
              <TrendingUp className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Órdenes de Trabajo</CardTitle>
                <CardDescription>Total: {workOrders.length} órdenes registradas</CardDescription>
              </CardHeader>
              <CardContent>
                {workOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No hay órdenes de trabajo registradas</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.tipo.replace("_", " ")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.estado.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.prioridad === "ALTA" ? "destructive" : "default"}>
                              {order.prioridad}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(order.fechaCreacion)}</TableCell>
                          <TableCell>${(order.costoReal || 0).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alertas del Vehículo</CardTitle>
                <CardDescription>Total: {alerts.length} alertas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No hay alertas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <AlertTriangle
                          className={`h-5 w-5 ${alert.prioridad === "ALTA" ? "text-destructive" : "text-orange-500"}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={alert.prioridad === "ALTA" ? "destructive" : "default"}>
                              {alert.prioridad}
                            </Badge>
                            <Badge variant="outline">{alert.tipo.replace("_", " ")}</Badge>
                            {!alert.activa && <Badge variant="secondary">Descartada</Badge>}
                          </div>
                          <p className="text-sm font-medium">{alert.mensaje}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(alert.fechaCreacion, "dd MMM yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Órdenes</p>
                      <p className="text-2xl font-bold">{workOrders.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Órdenes Completadas</p>
                      <p className="text-2xl font-bold">{completedOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo Total Acumulado</p>
                      <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo Promedio por Orden</p>
                      <p className="text-2xl font-bold">
                        ${workOrders.length > 0 ? Math.round(totalCost / workOrders.length).toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Órdenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mantenimiento Preventivo</p>
                      <p className="text-2xl font-bold">{workOrders.filter((o) => o.tipo === "Preventivo").length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mantenimiento Correctivo</p>
                      <p className="text-2xl font-bold">{workOrders.filter((o) => o.tipo === "Correctivo").length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Órdenes Pendientes</p>
                      <p className="text-2xl font-bold">{workOrders.filter((o) => o.estado === "Pendiente").length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Órdenes en Progreso</p>
                      <p className="text-2xl font-bold">
                        {workOrders.filter((o) => o.estado === "EnProgreso" || o.estado === "Asignada").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Preventive Plan Dialog */}
      <PreventivePlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        plan={preventivePlan}
        vehicleId={Number(vehicleId)}
        onSave={() => {
          setPlanDialogOpen(false)
          loadPreventivePlan()
        }}
      />
    </div>
  )
}
