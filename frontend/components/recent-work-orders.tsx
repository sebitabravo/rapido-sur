"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

interface WorkOrder {
  id: number
  vehiculo: {
    patente: string
    marca: string
    modelo: string
  }
  tipo: string
  estado: string
  prioridad: string
  fechaCreacion: string
  descripcion: string
}

export function RecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkOrders()
  }, [])

  const loadWorkOrders = async () => {
    try {
      const response = await api.workOrders.getAll()
      let allOrders = response.data.items || response.data || []

      // Map backend snake_case to frontend camelCase
      allOrders = allOrders.map((order: any) => ({
        ...order,
        fechaCreacion: order.fecha_creacion || order.fechaCreacion,
        fechaInicio: order.fecha_inicio || order.fechaInicio,
        fechaCierre: order.fecha_cierre || order.fechaCierre,
        fechaFinalizacion: order.fecha_cierre || order.fechaFinalizacion,
        costoEstimado: order.costo_estimado || order.costoEstimado,
        costoReal: order.costo_real || order.costoReal,
        mecanico: order.mecanico ? {
          id: order.mecanico.id,
          nombre: order.mecanico.nombre_completo || order.mecanico.nombre,
          email: order.mecanico.email,
        } : null,
      }))

      setWorkOrders(allOrders.slice(0, 20))
    } catch (error) {
      console.error("Error loading work orders:", error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Órdenes de Trabajo Recientes</CardTitle>
        <CardDescription>Últimas órdenes de mantenimiento registradas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {workOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay órdenes de trabajo registradas</p>
        ) : (
          <div className="h-[300px] overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.vehiculo.patente}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.vehiculo.marca} {order.vehiculo.modelo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.tipo === "Preventivo" ? "Preventivo" : "Correctivo"}</TableCell>
                    <TableCell>{getStatusBadge(order.estado)}</TableCell>
                    <TableCell>{getPriorityBadge(order.prioridad)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.fechaCreacion, "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
