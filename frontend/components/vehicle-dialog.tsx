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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const vehicleSchema = z.object({
  patente: z
    .string()
    .min(1, "La patente es requerida")
    .regex(
      /^([A-Z]{4}\d{2}|[A-Z]{2}-[A-Z]{2}-\d{2}|[A-Z]{4}-\d{2})$/i,
      "Formato de patente chilena inválido. Use formato XXXX12, AA-BB-12 o ABCD-12"
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
    .max(9999999, "El kilometraje no puede superar 9.999.999 km")
    .optional()
    .or(z.literal(0)),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: unknown
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
    setValue,
    watch,
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
    if (open) {
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
    }
  }, [vehicle, reset, open])

  const onSubmit = async (data: VehicleFormData) => {
    // Show confirmation dialog before creating/updating
    setPendingData(data)
    setShowConfirmDialog(true)
  }

  const handleCancel = () => {
    setShowConfirmDialog(false)
    setPendingData(null)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open && !showConfirmDialog) {
      // Only close if confirmation dialog is not open
      onOpenChange(false)
      reset()
      setPendingData(null)
    }
  }

  const handleConfirmedSubmit = async () => {
    if (!pendingData) return

    try {
      setLoading(true)
      setShowConfirmDialog(false)

      if (isEdit) {
        await api.vehicles.update(vehicle.id, pendingData)
        toast.success("Vehículo actualizado correctamente")
      } else {
        await api.vehicles.create(pendingData)
        toast.success("Vehículo creado correctamente")
      }
      onSave()
      setPendingData(null)
    } catch (error: unknown) {
      console.error("Error saving vehicle:", error)

      let errorMessage = "Error al guardar el vehículo"
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === "string") {
          errorMessage = error.response.data.message
        } else if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(", ")
        } else {
          errorMessage = JSON.stringify(error.response.data.message)
        }
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  maxLength={10}
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
                  maxLength={50}
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
                  maxLength={50}
                  {...register("modelo")}
                  aria-invalid={!!errors.modelo}
                  disabled={loading}
                />
                {errors.modelo && <p className="text-xs text-destructive">{errors.modelo.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="anno">Año *</Label>
                <Select
                  value={watch("anno")?.toString() || ""}
                  onValueChange={(value) => setValue("anno", parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger id="anno" className={errors.anno ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccione el año" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {Array.from(
                      { length: new Date().getFullYear() - 1900 + 2 },
                      (_, i) => new Date().getFullYear() + 1 - i
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.anno && <p className="text-xs text-destructive">{errors.anno.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="kilometraje_actual">Kilometraje Actual</Label>
                <Input
                  id="kilometraje_actual"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  maxLength={7}
                  value={watch("kilometraje_actual")?.toString() || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 7)
                    setValue("kilometraje_actual", value ? parseInt(value) : 0)
                  }}
                  aria-invalid={!!errors.kilometraje_actual}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Máximo 9.999.999 km</p>
                {errors.kilometraje_actual && <p className="text-xs text-destructive">{errors.kilometraje_actual.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogClose(false)} 
                disabled={loading}
              >
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
            <AlertDialogCancel onClick={handleCancel} disabled={loading}>
              Cancelar
            </AlertDialogCancel>
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
