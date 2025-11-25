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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const vehicleSchema = z.object({
  patente: z
    .string()
    .min(1, "La patente es requerida")
    .regex(
      /^([A-Z]{2}-[A-Z]{2}-\d{2}|[A-Z]{4}-\d{2})$/i,
      "Formato de patente chilena inválido. Use formato AA-BB-12 o ABCD-12"
    )
    .transform((val) => val.toUpperCase()),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  anno: z
    .number({ invalid_type_error: "El año debe ser un número" })
    .int("El año debe ser un número entero")
    .min(1900, "Año inválido")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  kilometraje_actual: z
    .number({ invalid_type_error: "El kilometraje debe ser un número" })
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje debe ser positivo")
    .optional()
    .or(z.literal(0)),
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingData, setPendingData] = useState<VehicleFormData | null>(null)
  const isEdit = !!vehicle

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      patente: "",
      marca: "",
      modelo: "",
      anno: new Date().getFullYear(),
      kilometraje_actual: 0,
    },
  })

  useEffect(() => {
    if (vehicle) {
      reset({
        patente: vehicle.patente || "",
        marca: vehicle.marca || "",
        modelo: vehicle.modelo || "",
        anno: Number(vehicle.anno) || new Date().getFullYear(),
        kilometraje_actual: Number(vehicle.kilometraje_actual) || 0,
      })
    } else {
      reset({
        patente: "",
        marca: "",
        modelo: "",
        anno: new Date().getFullYear(),
        kilometraje_actual: 0,
      })
    }
  }, [vehicle, reset])

  const onSubmit = async (data: VehicleFormData) => {
    // Show confirmation dialog before creating/updating
    setPendingData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmedSubmit = async () => {
    if (!pendingData) return

    try {
      setLoading(true)
      setShowConfirmDialog(false)

      // Debug: Log the data being sent
      console.log("📤 Sending vehicle data:", pendingData)
      console.log("📋 Data types:", {
        patente: typeof pendingData.patente,
        marca: typeof pendingData.marca,
        modelo: typeof pendingData.modelo,
        anno: typeof pendingData.anno,
        kilometraje_actual: typeof pendingData.kilometraje_actual,
      })

      if (isEdit) {
        await api.vehicles.update(vehicle.id, pendingData)
        toast.success("Vehículo actualizado correctamente")
      } else {
        await api.vehicles.create(pendingData)
        toast.success("Vehículo creado correctamente")
      }
      onSave()
      setPendingData(null)
    } catch (error: any) {
      console.error("[v0] Error saving vehicle:", error)
      console.error("📥 Backend response:", error.response?.data)
      console.error("📥 Status code:", error.response?.status)
      toast.error(error.response?.data?.message || "Error al guardar el vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
                  placeholder="AB-CD-12 o ABCD-12"
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

              <div className="space-y-2 col-span-2">
                <Label htmlFor="anno">Año *</Label>
                <Input
                  id="anno"
                  type="number"
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  step="1"
                  {...register("anno", { valueAsNumber: true })}
                  aria-invalid={!!errors.anno}
                  disabled={loading}
                />
                {errors.anno && <p className="text-xs text-destructive">{errors.anno.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="kilometraje_actual">Kilometraje Actual</Label>
                <Input
                  id="kilometraje_actual"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  {...register("kilometraje_actual", { valueAsNumber: true })}
                  aria-invalid={!!errors.kilometraje_actual}
                  disabled={loading}
                />
                {errors.kilometraje_actual && <p className="text-xs text-destructive">{errors.kilometraje_actual.message}</p>}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {isEdit
                ? `¿Desea actualizar el vehículo con patente ${pendingData?.patente}?`
                : `¿Desea agregar el vehículo ${pendingData?.marca} ${pendingData?.modelo} con patente ${pendingData?.patente}?`}
              <br />
              Esta acción quedará registrada en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                "Confirmar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
