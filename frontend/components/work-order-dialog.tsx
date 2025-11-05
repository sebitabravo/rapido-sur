"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const workOrderSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "INSPECCION"]),
  prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  observaciones: z.string().optional(),
  costoEstimado: z.number().min(0, "El costo debe ser positivo").optional(),
})

type WorkOrderFormData = z.infer<typeof workOrderSchema>

interface WorkOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrder?: any
  onSave: () => void
}

export function WorkOrderDialog({ open, onOpenChange, workOrder, onSave }: WorkOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const isEdit = !!workOrder

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      vehiculoId: 0,
      tipo: "PREVENTIVO",
      prioridad: "MEDIA",
      descripcion: "",
      observaciones: "",
      costoEstimado: 0,
    },
  })

  const vehiculoId = watch("vehiculoId")
  const tipo = watch("tipo")
  const prioridad = watch("prioridad")

  useEffect(() => {
    if (open) {
      loadVehicles()
    }
  }, [open])

  useEffect(() => {
    if (workOrder) {
      reset({
        vehiculoId: workOrder.vehiculo.id,
        tipo: workOrder.tipo,
        prioridad: workOrder.prioridad,
        descripcion: workOrder.descripcion,
        observaciones: workOrder.observaciones || "",
        costoEstimado: workOrder.costoEstimado || 0,
      })
    } else {
      reset({
        vehiculoId: 0,
        tipo: "PREVENTIVO",
        prioridad: "MEDIA",
        descripcion: "",
        observaciones: "",
        costoEstimado: 0,
      })
    }
  }, [workOrder, reset])

  const loadVehicles = async () => {
    try {
      const response = await api.vehicles.getAll({ page: 1, limit: 1000 })
      setVehicles(response.data.items || [])
    } catch (error) {
      console.error("[v0] Error loading vehicles:", error)
    }
  }

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      setLoading(true)
      if (isEdit) {
        await api.workOrders.update(workOrder.id, data)
        toast.success("Orden de trabajo actualizada correctamente")
      } else {
        await api.workOrders.create(data)
        toast.success("Orden de trabajo creada correctamente")
      }
      onSave()
    } catch (error: any) {
      console.error("[v0] Error saving work order:", error)
      toast.error(error.response?.data?.message || "Error al guardar la orden de trabajo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Orden de Trabajo" : "Nueva Orden de Trabajo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos de la orden" : "Complete los datos de la nueva orden"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="vehiculoId">Vehículo *</Label>
              <Select
                value={vehiculoId.toString()}
                onValueChange={(value) => setValue("vehiculoId", Number.parseInt(value))}
                disabled={loading || isEdit}
              >
                <SelectTrigger id="vehiculoId" className="w-full">
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehiculoId && <p className="text-xs text-destructive">{errors.vehiculoId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={(value) => setValue("tipo", value as any)} disabled={loading}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                  <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                  <SelectItem value="INSPECCION">Inspección</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad *</Label>
              <Select
                value={prioridad}
                onValueChange={(value) => setValue("prioridad", value as any)}
                disabled={loading}
              >
                <SelectTrigger id="prioridad" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="BAJA">Baja</SelectItem>
                </SelectContent>
              </Select>
              {errors.prioridad && <p className="text-xs text-destructive">{errors.prioridad.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa el trabajo a realizar..."
                {...register("descripcion")}
                aria-invalid={!!errors.descripcion}
                disabled={loading}
                rows={3}
              />
              {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones adicionales..."
                {...register("observaciones")}
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costoEstimado">Costo Estimado</Label>
              <Input
                id="costoEstimado"
                type="number"
                placeholder="0"
                {...register("costoEstimado", { valueAsNumber: true })}
                aria-invalid={!!errors.costoEstimado}
                disabled={loading}
              />
              {errors.costoEstimado && <p className="text-xs text-destructive">{errors.costoEstimado.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
