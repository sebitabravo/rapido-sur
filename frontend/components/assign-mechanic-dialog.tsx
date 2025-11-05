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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserCog } from "lucide-react"
import { toast } from "sonner"

const assignMechanicSchema = z.object({
  mecanico_id: z.number().min(1, "Debe seleccionar un mecánico"),
})

type AssignMechanicFormData = z.infer<typeof assignMechanicSchema>

interface Mechanic {
  id: number
  nombre: string
  email: string
}

interface AssignMechanicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId: number
  workOrderNumber?: string
  onAssign: () => void
}

export function AssignMechanicDialog({
  open,
  onOpenChange,
  workOrderId,
  workOrderNumber,
  onAssign,
}: AssignMechanicDialogProps) {
  const [loading, setLoading] = useState(false)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [loadingMechanics, setLoadingMechanics] = useState(false)

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AssignMechanicFormData>({
    resolver: zodResolver(assignMechanicSchema),
    defaultValues: {
      mecanico_id: 0,
    },
  })

  const mecanico_id_value = watch("mecanico_id")

  useEffect(() => {
    if (open) {
      loadMechanics()
      reset({ mecanico_id: 0 })
    }
  }, [open, reset])

  const loadMechanics = async () => {
    try {
      setLoadingMechanics(true)
      const response = await api.users.getAll({ role: "Mecanico" })
      setMechanics(response.data.items || response.data || [])
    } catch (error) {
      console.error("Error loading mechanics:", error)
      toast.error("Error al cargar la lista de mecánicos")
      setMechanics([])
    } finally {
      setLoadingMechanics(false)
    }
  }

  const onSubmit = async (data: AssignMechanicFormData) => {
    try {
      setLoading(true)
      await api.workOrders.assignMechanic(workOrderId, data.mecanico_id)
      toast.success("Mecánico asignado correctamente")
      onAssign()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error assigning mechanic:", error)
      toast.error(error.response?.data?.message || "Error al asignar el mecánico")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <DialogTitle>Asignar Mecánico</DialogTitle>
          </div>
          <DialogDescription>
            {workOrderNumber
              ? `Seleccione el mecánico para la orden ${workOrderNumber}`
              : "Seleccione el mecánico para esta orden de trabajo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mecanico_id">Mecánico *</Label>
            {loadingMechanics ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : mechanics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No hay mecánicos disponibles</p>
              </div>
            ) : (
              <>
                <Select
                  value={mecanico_id_value > 0 ? mecanico_id_value.toString() : ""}
                  onValueChange={(value) => setValue("mecanico_id", Number.parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger id="mecanico_id" className="w-full">
                    <SelectValue placeholder="Seleccione un mecánico" />
                  </SelectTrigger>
                  <SelectContent>
                    {mechanics.map((mechanic) => (
                      <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                        {mechanic.nombre} - {mechanic.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mecanico_id && <p className="text-xs text-destructive">{errors.mecanico_id.message}</p>}
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingMechanics || mechanics.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Asignando...
                </>
              ) : (
                "Asignar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
