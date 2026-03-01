"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const registerWorkSchema = z.object({
  repuestos: z.array(
    z.object({
      repuesto_id: z.number().min(1, "Debe seleccionar un repuesto"),
      cantidad: z.number().min(1, "La cantidad debe ser al menos 1"),
      tarea_id: z.number().min(1, "Debe seleccionar una tarea"),
    })
  ).optional(),
  kilometraje_actual: z.number().min(0, "El kilometraje no puede ser negativo").optional(),
  observaciones: z.string().optional(),
})

type RegisterWorkFormData = z.infer<typeof registerWorkSchema>

interface RegisterWorkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId: number
  tasks: Array<{ id: number; descripcion: string }>
  onSuccess: () => void
}

export function RegisterWorkDialog({
  open,
  onOpenChange,
  workOrderId,
  tasks,
  onSuccess,
}: RegisterWorkDialogProps) {
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<RegisterWorkFormData>({
    resolver: zodResolver(registerWorkSchema),
    defaultValues: {
      repuestos: [],
      kilometraje_actual: undefined,
      observaciones: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "repuestos",
  })

  useEffect(() => {
    if (open) {
      loadParts()
      reset()
    }
  }, [open, reset])

  const loadParts = async () => {
    try {
      const response = await api.parts.getAll({ page: 1, limit: 1000 })
      const partsData = Array.isArray(response.data) ? response.data : (response.data?.items || [])
      setParts(partsData)
    } catch (error) {
      console.error("Error loading parts:", error)
      toast.error("Error al cargar los repuestos")
    }
  }

  const onSubmit = async (data: RegisterWorkFormData) => {
    try {
      setLoading(true)

      await api.workOrders.registerWork(workOrderId, {
        repuestos: data.repuestos || [],
        kilometraje_actual: data.kilometraje_actual,
        observaciones: data.observaciones,
      })

      toast.success("Trabajo registrado exitosamente")
      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error("Error registering work:", error)
      toast.error(error.response?.data?.message || "Error al registrar el trabajo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Trabajo Realizado</DialogTitle>
          <DialogDescription>
            Registre los repuestos utilizados, kilometraje actualizado y observaciones del trabajo
            realizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Parts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Repuestos Utilizados</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ repuesto_id: 0, cantidad: 1, tarea_id: tasks[0]?.id || 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Repuesto
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No se han agregado repuestos. Haga clic en "Agregar Repuesto" para comenzar.
              </p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                <div className="col-span-5">
                  <Label htmlFor={`repuestos.${index}.repuesto_id`}>Repuesto</Label>
                  <Select
                    value={watch(`repuestos.${index}.repuesto_id`)?.toString() || ""}
                    onValueChange={(value) =>
                      setValue(`repuestos.${index}.repuesto_id`, parseInt(value), {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar repuesto" />
                    </SelectTrigger>
                    <SelectContent>
                      {parts.map((part) => (
                        <SelectItem key={part.id} value={part.id.toString()}>
                          {part.nombre} - Stock: {part.cantidad_stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.repuestos?.[index]?.repuesto_id && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.repuestos[index]?.repuesto_id?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor={`repuestos.${index}.cantidad`}>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`repuestos.${index}.cantidad`, { valueAsNumber: true })}
                  />
                  {errors.repuestos?.[index]?.cantidad && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.repuestos[index]?.cantidad?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-4">
                  <Label htmlFor={`repuestos.${index}.tarea_id`}>Tarea</Label>
                  <Select
                    value={watch(`repuestos.${index}.tarea_id`)?.toString() || ""}
                    onValueChange={(value) =>
                      setValue(`repuestos.${index}.tarea_id`, parseInt(value), { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tarea" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.repuestos?.[index]?.tarea_id && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.repuestos[index]?.tarea_id?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <Label htmlFor="kilometraje_actual">Kilometraje Actualizado (opcional)</Label>
            <Input
              id="kilometraje_actual"
              type="number"
              min="0"
              placeholder="Ej: 15500"
              {...register("kilometraje_actual", { valueAsNumber: true })}
            />
            {errors.kilometraje_actual && (
              <p className="text-sm text-destructive">{errors.kilometraje_actual.message}</p>
            )}
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Describa el trabajo realizado, problemas encontrados, etc."
              rows={4}
              {...register("observaciones")}
            />
            {errors.observaciones && (
              <p className="text-sm text-destructive">{errors.observaciones.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Trabajo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
