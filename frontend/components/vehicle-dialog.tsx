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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const vehicleSchema = z.object({
  patente: z.string().min(1, "La patente es requerida"),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  anio: z
    .number()
    .min(1900, "Año inválido")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  tipo: z.enum(["CAMION", "CAMIONETA", "AUTO", "FURGON"]),
  estado: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]),
  kilometraje: z.number().min(0, "El kilometraje debe ser positivo"),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onSave: () => void
}

export function VehicleDialog({ open, onOpenChange, vehicle, onSave }: VehicleDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!vehicle

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      patente: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      tipo: "CAMION",
      estado: "OPERATIVO",
      kilometraje: 0,
    },
  })

  const tipo = watch("tipo")
  const estado = watch("estado")

  useEffect(() => {
    if (vehicle) {
      reset({
        patente: vehicle.patente,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio,
        tipo: vehicle.tipo,
        estado: vehicle.estado,
        kilometraje: vehicle.kilometraje,
      })
    } else {
      reset({
        patente: "",
        marca: "",
        modelo: "",
        anio: new Date().getFullYear(),
        tipo: "CAMION",
        estado: "OPERATIVO",
        kilometraje: 0,
      })
    }
  }, [vehicle, reset])

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setLoading(true)
      if (isEdit) {
        await api.vehicles.update(vehicle.id, data)
        toast.success("Vehículo actualizado correctamente")
      } else {
        await api.vehicles.create(data)
        toast.success("Vehículo creado correctamente")
      }
      onSave()
    } catch (error: any) {
      console.error("[v0] Error saving vehicle:", error)
      toast.error(error.response?.data?.message || "Error al guardar el vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Vehículo" : "Agregar Vehículo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos del vehículo" : "Complete los datos del nuevo vehículo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patente">Patente *</Label>
              <Input
                id="patente"
                placeholder="ABC123"
                {...register("patente")}
                aria-invalid={!!errors.patente}
                disabled={loading}
              />
              {errors.patente && <p className="text-xs text-destructive">{errors.patente.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                placeholder="Toyota"
                {...register("marca")}
                aria-invalid={!!errors.marca}
                disabled={loading}
              />
              {errors.marca && <p className="text-xs text-destructive">{errors.marca.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                placeholder="Hilux"
                {...register("modelo")}
                aria-invalid={!!errors.modelo}
                disabled={loading}
              />
              {errors.modelo && <p className="text-xs text-destructive">{errors.modelo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año *</Label>
              <Input
                id="anio"
                type="number"
                placeholder="2024"
                {...register("anio", { valueAsNumber: true })}
                aria-invalid={!!errors.anio}
                disabled={loading}
              />
              {errors.anio && <p className="text-xs text-destructive">{errors.anio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={(value) => setValue("tipo", value as any)} disabled={loading}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAMION">Camión</SelectItem>
                  <SelectItem value="CAMIONETA">Camioneta</SelectItem>
                  <SelectItem value="AUTO">Auto</SelectItem>
                  <SelectItem value="FURGON">Furgón</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={estado} onValueChange={(value) => setValue("estado", value as any)} disabled={loading}>
                <SelectTrigger id="estado" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIVO">Operativo</SelectItem>
                  <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                  <SelectItem value="FUERA_DE_SERVICIO">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="kilometraje">Kilometraje *</Label>
              <Input
                id="kilometraje"
                type="number"
                placeholder="0"
                {...register("kilometraje", { valueAsNumber: true })}
                aria-invalid={!!errors.kilometraje}
                disabled={loading}
              />
              {errors.kilometraje && <p className="text-xs text-destructive">{errors.kilometraje.message}</p>}
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
