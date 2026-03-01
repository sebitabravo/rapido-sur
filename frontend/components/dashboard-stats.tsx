"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Truck, Wrench, AlertTriangle } from "lucide-react"

interface Stats {
  totalVehicles: number
  activeVehicles: number
  inMaintenanceVehicles: number
  totalWorkOrders: number
  pendingWorkOrders: number
  completedWorkOrders: number
  activeAlerts: number
  criticalAlerts: number
}

interface VehicleSummary {
  estado: string
}

interface WorkOrderSummary {
  estado: string
}

interface AlertSummary {
  estado: string
  tipo_alerta?: string
}

export function DashboardStats({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  const loadStats = async () => {
    try {
      // Fetch data from multiple endpoints in parallel
      const [vehiclesRes, workOrdersRes, alertsRes] = await Promise.all([
        api.vehicles.getAll({ page: 1, limit: 1000 }),
        api.workOrders.getAll(),
        api.alerts.getAll(),
      ])

      // Backend returns paginated data for vehicles and work orders with 'items' property
      const vehicles: VehicleSummary[] = vehiclesRes.data.items || []
      const workOrders: WorkOrderSummary[] = workOrdersRes.data.items || []
      // Alerts return arrays directly
      const alerts: AlertSummary[] = alertsRes.data || []

      // Calculate statistics
      const statsData: Stats = {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter((v) => v.estado === "Activo").length,
        inMaintenanceVehicles: vehicles.filter((v) => v.estado === "EnMantenimiento").length,
        totalWorkOrders: workOrders.length,
        pendingWorkOrders: workOrders.filter((wo) => wo.estado === "Pendiente").length,
        completedWorkOrders: workOrders.filter((wo) => wo.estado === "Finalizada").length,
        activeAlerts: alerts.filter((a) => a.estado === "Activa").length,
        criticalAlerts: alerts.filter((a) => a.estado === "Activa" && a.tipo_alerta === "Kilometraje").length,
      }

      setStats(statsData)
    } catch (error) {
      console.error("[v0] Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const vehicleAvailability = stats.totalVehicles > 0 ? (stats.activeVehicles / stats.totalVehicles) * 100 : 0
  const workOrderCompletion = stats.totalWorkOrders > 0 ? (stats.completedWorkOrders / stats.totalWorkOrders) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVehicles}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {stats.activeVehicles} operativos
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats.inMaintenanceVehicles} en mantenimiento
            </Badge>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Disponibilidad</span>
              <span className="font-medium">{vehicleAvailability.toFixed(0)}%</span>
            </div>
            <Progress value={vehicleAvailability} />
          </div>
        </CardContent>
      </Card>

      {/* Work Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Órdenes de Trabajo</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkOrders}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {stats.pendingWorkOrders} pendientes
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats.completedWorkOrders} completadas
            </Badge>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Completadas</span>
              <span className="font-medium">{workOrderCompletion.toFixed(0)}%</span>
            </div>
            <Progress value={workOrderCompletion} />
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeAlerts}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="destructive" className="text-xs">
              {stats.criticalAlerts} críticas
            </Badge>
            <Badge variant="outline" className="text-xs">
              {stats.activeAlerts - stats.criticalAlerts} normales
            </Badge>
          </div>
          {stats.criticalAlerts > 0 && <p className="text-xs text-destructive mt-3">Requieren atención inmediata</p>}
        </CardContent>
      </Card>
    </div>
  )
}
