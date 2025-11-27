"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { authService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wrench, Clock, CheckCircle2, AlertCircle, Eye, Calendar } from "lucide-react"
import { WorkOrderDetailDialog } from "@/components/work-order-detail-dialog"
import { formatDate } from "@/lib/utils"
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
  descripcion: string
  observaciones?: string
}

export function MechanicDashboard() {
  const router = useRouter()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const user = authService.getUser()

  useEffect(() => {
    loadMyWorkOrders()
  }, [])

  const loadMyWorkOrders = async () => {
    try {
      setLoading(true)
      const response = await api.workOrders.getAll({})
      const orders = Array.isArray(response.data) ? response.data : (response.data?.items || [])
      setWorkOrders(orders)
    } catch (error) {
      console.error("Error loading work orders:", error)
      toast.error("Error al cargar tus órdenes de trabajo")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (order: WorkOrder) => {
    setSelectedWorkOrder(order)
    setDetailDialogOpen(true)
  }

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pendiente: "outline",
      Asignada: "default",
      EnProgreso: "default",
      Finalizada: "secondary",
    }
    const labels: Record<string, string> = {
      Pendiente: "Pendiente",
      Asignada: "Asignada",
      EnProgreso: "En Progreso",
      Finalizada: "Finalizada",
    }
    return <Badge variant={variants[estado] || "outline"}>{labels[estado] || estado}</Badge>
  }

  const getPriorityBadge = (prioridad: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ALTA: "destructive",
      MEDIA: "default",
      BAJA: "secondary",
    }
    return <Badge variant={variants[prioridad] || "outline"}>{prioridad}</Badge>
  }

  // Statistics
  const pendingOrders = workOrders.filter(wo => wo.estado === "Pendiente" || wo.estado === "Asignada")
  const inProgressOrders = workOrders.filter(wo => wo.estado === "EnProgreso")
  const completedOrders = workOrders.filter(wo => wo.estado === "Finalizada")
  const activeOrders = workOrders.filter(wo => wo.estado !== "Finalizada")

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-1">¡Bienvenido, {user?.nombre_completo}!</h2>
        <p className="text-muted-foreground">
          Aquí puedes ver tus órdenes de trabajo asignadas y registrar el progreso.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asignadas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders.length}</div>
            <p className="text-xs text-muted-foreground">Órdenes en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Iniciar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">Pendientes y asignadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders.length}</div>
            <p className="text-xs text-muted-foreground">Trabajos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Trabajos finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Work Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Órdenes de Trabajo</CardTitle>
              <CardDescription>
                {activeOrders.length > 0
                  ? `Tienes ${activeOrders.length} orden${activeOrders.length !== 1 ? 'es' : ''} activa${activeOrders.length !== 1 ? 's' : ''}`
                  : "No tienes órdenes asignadas en este momento"
                }
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push("/work-orders")}>
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando órdenes...</p>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                No tienes órdenes de trabajo asignadas
              </p>
              <p className="text-xs text-muted-foreground">
                Cuando se te asignen órdenes, aparecerán aquí
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.vehiculo.patente}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.vehiculo.marca} {order.vehiculo.modelo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {order.descripcion}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.tipo === "Preventivo" ? "Preventivo" : "Correctivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.estado)}</TableCell>
                    <TableCell>{getPriorityBadge(order.prioridad)}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.fechaCreacion)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>Acciones frecuentes para gestionar tu trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/work-orders")}
            >
              <Wrench className="h-6 w-6" />
              <span>Mis Órdenes</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/vehicles")}
            >
              <Eye className="h-6 w-6" />
              <span>Ver Vehículos</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/parts")}
            >
              <CheckCircle2 className="h-6 w-6" />
              <span>Repuestos</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <WorkOrderDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        workOrder={selectedWorkOrder}
        onUpdate={loadMyWorkOrders}
      />
    </div>
  )
}
