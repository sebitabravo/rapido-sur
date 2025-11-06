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

const preventivePlanSchema = z.object({
  vehiculo_id: z.number().min(1, "Debe seleccionar un vehículo"),
  tipo_mantenimiento: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  tipo_intervalo: z.enum(["KM", "Tiempo"]),
  intervalo: z.number().min(1, "El intervalo debe ser mayor a 0"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  proximo_kilometraje: z.number().min(0).optional(),
  proxima_fecha: z.string().optional(),
  activo: z.boolean().default(true),
})

type PreventivePlanFormData = z.infer<typeof preventivePlanSchema>

interface PreventivePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: any
  vehicleId?: number
  onSave: () => void
}

export function PreventivePlanDialog({
  open,
  onOpenChange,
  plan,
  vehicleId,
  onSave,
}: PreventivePlanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const isEdit = !!plan

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PreventivePlanFormData>({
    resolver: zodResolver(preventivePlanSchema),
    defaultValues: {
      vehiculo_id: vehicleId || 0,
      tipo_mantenimiento: "",
      tipo_intervalo: "KM",
      intervalo: 10000,
      descripcion: "",
      activo: true,
    },
  })

  const vehiculo_id_value = watch("vehiculo_id")
  const tipo_intervalo = watch("tipo_intervalo")

  useEffect(() => {
    if (open && !vehicleId) {
      loadVehicles()
    }
  }, [open, vehicleId])

  useEffect(() => {
    if (plan) {
      reset({
        vehiculo_id: plan.vehiculo.id,
        tipo_mantenimiento: plan.tipo_mantenimiento,
        tipo_intervalo: plan.tipo_intervalo,
        intervalo: plan.intervalo,
        descripcion: plan.descripcion,
        proximo_kilometraje: plan.proximo_kilometraje || undefined,
        proxima_fecha: plan.proxima_fecha
          ? new Date(plan.proxima_fecha).toISOString().split("T")[0]
          : undefined,
        activo: plan.activo,
      })
    } else {
      reset({
        vehiculo_id: vehicleId || 0,
        tipo_mantenimiento: "",
        tipo_intervalo: "KM",
        intervalo: 10000,
        descripcion: "",
        activo: true,
      })
    }
  }, [plan, vehicleId, reset])

  const loadVehicles = async () => {
    try {
      const response = await api.vehicles.getAll({ page: 1, limit: 1000 })
      setVehicles(response.data.items || [])
    } catch (error) {
      console.error("Error loading vehicles:", error)
    }
  }

  const onSubmit = async (data: PreventivePlanFormData) => {
    try {
      setLoading(true)

      // Preparar payload según tipo_intervalo
      const payload: any = {
        vehiculo_id: data.vehiculo_id,
        tipo_mantenimiento: data.tipo_mantenimiento,
        tipo_intervalo: data.tipo_intervalo,
        intervalo: data.intervalo,
        descripcion: data.descripcion,
        activo: data.activo,
      }

      if (data.tipo_intervalo === "KM" && data.proximo_kilometraje) {
        payload.proximo_kilometraje = data.proximo_kilometraje
      } else if (data.tipo_intervalo === "Tiempo" && data.proxima_fecha) {
        payload.proxima_fecha = data.proxima_fecha
      }

      if (isEdit) {
        await api.preventivePlans.update(plan.id, payload)
        toast.success("Plan preventivo actualizado correctamente")
      } else {
        await api.preventivePlans.create(payload)
        toast.success("Plan preventivo creado correctamente")
      }
      onSave()
    } catch (error: any) {
      console.error("Error saving preventive plan:", error)
      toast.error(error.response?.data?.message || "Error al guardar el plan preventivo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Plan Preventivo" : "Nuevo Plan Preventivo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos del plan" : "Complete los datos del nuevo plan de mantenimiento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!vehicleId && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="vehiculo_id">Vehículo *</Label>
                <Select
                  value={vehiculo_id_value.toString()}
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
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="tipo_mantenimiento">Tipo de Mantenimiento *</Label>
              <Input
                id="tipo_mantenimiento"
                placeholder="Ej: Mantenimiento general"
                {...register("tipo_mantenimiento")}
                aria-invalid={!!errors.tipo_mantenimiento}
                disabled={loading}
              />
              {errors.tipo_mantenimiento && (
                <p className="text-xs text-destructive">{errors.tipo_mantenimiento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_intervalo">Tipo de Intervalo *</Label>
              <Select
                value={tipo_intervalo}
                onValueChange={(value) => setValue("tipo_intervalo", value as "KM" | "Tiempo")}
                disabled={loading}
              >
                <SelectTrigger id="tipo_intervalo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KM">Por Kilometraje</SelectItem>
                  <SelectItem value="Tiempo">Por Tiempo (días)</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_intervalo && <p className="text-xs text-destructive">{errors.tipo_intervalo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervalo">
                Intervalo * {tipo_intervalo === "KM" ? "(kilómetros)" : "(días)"}
              </Label>
              <Input
                id="intervalo"
                type="number"
                placeholder={tipo_intervalo === "KM" ? "10000" : "180"}
                {...register("intervalo", { valueAsNumber: true })}
                aria-invalid={!!errors.intervalo}
                disabled={loading}
              />
              {errors.intervalo && <p className="text-xs text-destructive">{errors.intervalo.message}</p>}
            </div>

            {tipo_intervalo === "KM" && (
              <div className="space-y-2">
                <Label htmlFor="proximo_kilometraje">Próximo Kilometraje</Label>
                <Input
                  id="proximo_kilometraje"
                  type="number"
                  placeholder="25000"
                  {...register("proximo_kilometraje", { valueAsNumber: true })}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Deje vacío para calcular automáticamente
                </p>
              </div>
            )}

            {tipo_intervalo === "Tiempo" && (
              <div className="space-y-2">
                <Label htmlFor="proxima_fecha">Próxima Fecha</Label>
                <Input id="proxima_fecha" type="date" {...register("proxima_fecha")} disabled={loading} />
                <p className="text-xs text-muted-foreground">
                  Deje vacío para calcular automáticamente
                </p>
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Detalle las tareas a realizar en este mantenimiento..."
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
    </Dialog>
  )
}
