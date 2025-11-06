"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, Truck, User, DollarSign, Clock } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface WorkOrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrder: any
  onUpdate: () => void
}

export function WorkOrderDetailDialog({ open, onOpenChange, workOrder, onUpdate }: WorkOrderDetailDialogProps) {
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")

  if (!workOrder) return null

  const handleStatusUpdate = async () => {
    if (!newStatus) return

    try {
      setUpdating(true)
      await api.workOrders.updateStatus(workOrder.id, newStatus)
      toast.success("Estado actualizado correctamente")
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setUpdating(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Orden de Trabajo #{workOrder.id}</DialogTitle>
          <DialogDescription>Detalles completos de la orden de trabajo</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estado</p>
              {getStatusBadge(workOrder.estado)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Prioridad</p>
              {getPriorityBadge(workOrder.prioridad)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tipo</p>
              <Badge variant="outline">{workOrder.tipo === "Preventivo" ? "Preventivo" : "Correctivo"}</Badge>
            </div>
          </div>

          <Separator />

          {/* Vehicle Info */}
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Vehículo</p>
              <p className="font-medium">
                {workOrder.vehiculo.patente} - {workOrder.vehiculo.marca} {workOrder.vehiculo.modelo}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha Creación</p>
                <p className="font-medium">{formatDate(workOrder.fechaCreacion, "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
            {workOrder.fechaInicio && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                  <p className="font-medium">{formatDate(workOrder.fechaInicio, "dd/MM/yyyy HH:mm")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mechanic */}
          {workOrder.mecanico && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Mecánico Asignado</p>
                <p className="font-medium">{workOrder.mecanico.nombre}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Descripción</p>
            <p className="text-sm">{workOrder.descripcion}</p>
          </div>

          {/* Observations */}
          {workOrder.observaciones && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Observaciones</p>
              <p className="text-sm">{workOrder.observaciones}</p>
            </div>
          )}

          {/* Costs */}
          <div className="grid grid-cols-2 gap-4">
            {workOrder.costoEstimado && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Costo Estimado</p>
                  <p className="font-medium">${workOrder.costoEstimado.toLocaleString()}</p>
                </div>
              </div>
            )}
            {workOrder.costoReal && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Costo Real</p>
                  <p className="font-medium">${workOrder.costoReal.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Update Status */}
          <div className="space-y-2">
            <Label htmlFor="newStatus">Actualizar Estado</Label>
            <div className="flex items-center gap-2">
              <Select value={newStatus} onValueChange={setNewStatus} disabled={updating}>
                <SelectTrigger id="newStatus" className="flex-1">
                  <SelectValue placeholder="Seleccione un nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Asignada">Asignada</SelectItem>
                  <SelectItem value="EnProgreso">En Progreso</SelectItem>
                  <SelectItem value="Finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate} disabled={!newStatus || updating}>
                {updating ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
