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
import { ConfirmDialog } from "@/components/confirm-dialog"

const workOrderSchema = z.object({
  vehiculo_id: z.number().min(1, "Debe seleccionar un vehículo"),
  tipo: z.enum(["Preventivo", "Correctivo"]),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<WorkOrderFormData | null>(null)
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
      vehiculo_id: 0,
      tipo: "Preventivo",
      descripcion: "",
    },
  })

  const vehiculo_id = watch("vehiculo_id")
  const tipo = watch("tipo")

  useEffect(() => {
    if (open) {
      loadVehicles()
    }
  }, [open])

  useEffect(() => {
    if (workOrder) {
      reset({
        vehiculo_id: workOrder.vehiculo.id,
        tipo: workOrder.tipo,
        descripcion: workOrder.descripcion,
      })
    } else {
      reset({
        vehiculo_id: 0,
        tipo: "Preventivo",
        descripcion: "",
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
    setPendingData(data)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingData) return
    
    try {
      setLoading(true)
      setConfirmOpen(false)
      
      const payload = {
        vehiculo_id: pendingData.vehiculo_id,
        tipo: pendingData.tipo,
        descripcion: pendingData.descripcion,
      }

      if (isEdit) {
        await api.workOrders.update(workOrder.id, payload)
        toast.success("Orden de trabajo actualizada correctamente")
      } else {
        await api.workOrders.create(payload)
        toast.success("Orden de trabajo creada correctamente")
      }
      onSave()
      setPendingData(null)
    } catch (error: any) {
      console.error("Error saving work order:", error)
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
              <Label htmlFor="vehiculo_id">Vehículo *</Label>
              <Select
                value={vehiculo_id.toString()}
                onValueChange={(value) => setValue("vehiculo_id", Number.parseInt(value))}
                disabled={loading || isEdit}
              >
                <SelectTrigger id="vehiculo_id" className="w-full">
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
              {errors.vehiculo_id && <p className="text-xs text-destructive">{errors.vehiculo_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={(value) => setValue("tipo", value as any)} disabled={loading}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventivo">Preventivo</SelectItem>
                  <SelectItem value="Correctivo">Correctivo</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa el trabajo a realizar..."
                {...register("descripcion")}
                aria-invalid={!!errors.descripcion}
                disabled={loading}
                rows={4}
              />
              {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        title={isEdit ? "Confirmar Actualización" : "Confirmar Creación"}
        description={
          isEdit
            ? "¿Está seguro que desea actualizar esta orden de trabajo? Los cambios se guardarán inmediatamente."
            : "¿Está seguro que desea crear esta orden de trabajo? Se notificará al mecánico asignado."
        }
        confirmText={isEdit ? "Sí, Actualizar" : "Sí, Crear"}
        cancelText="Cancelar"
      />
    </Dialog>
  )
}
