"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface Task {
  id: number
  descripcion: string
  fecha_vencimiento?: string
  completada: boolean
  mecanico_asignado?: {
    id: number
    nombre: string
  }
  orden_trabajo_id: number
}

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  workOrderId: number
  onSave: () => void
}

interface PartUsage {
  repuesto_id: number
  cantidad_usada: number
  nombre?: string
  precio_unitario?: number
}

export function TaskDialog({ open, onOpenChange, task, workOrderId, onSave }: TaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [parts, setParts] = useState<any[]>([])
  const [partUsages, setPartUsages] = useState<PartUsage[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: "",
    fecha_vencimiento: "",
    mecanico_asignado_id: "",
    completada: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const isEdit = !!task

  useEffect(() => {
    if (open) {
      loadUsers()
      loadParts()
    }
  }, [open])

  useEffect(() => {
    if (task) {
      setFormData({
        descripcion: task.descripcion || "",
        fecha_vencimiento: task.fecha_vencimiento ? task.fecha_vencimiento.split("T")[0] : "",
        mecanico_asignado_id: task.mecanico_asignado?.id?.toString() || "",
        completada: task.completada || false
      })
      loadPartDetails()
    } else {
      setFormData({
        descripcion: "",
        fecha_vencimiento: "",
        mecanico_asignado_id: "",
        completada: false
      })
      setPartUsages([])
    }
    setErrors({})
  }, [task, open])

  const loadUsers = async () => {
    try {
      const response = await api.users.getMechanics()
      setUsers(response.data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadParts = async () => {
    try {
      const response = await api.parts.getAll()
      setParts(response.data || [])
    } catch (error) {
      console.error("Error loading parts:", error)
    }
  }

  const loadPartDetails = async () => {
    if (!task) return
    
    try {
      const response = await api.partDetails.getByTask(task.id)
      const details = response.data || []
      setPartUsages(details.map((d: any) => ({
        repuesto_id: d.repuesto.id,
        cantidad_usada: d.cantidad_usada,
        nombre: d.repuesto.nombre,
        precio_unitario: d.precio_unitario_momento
      })))
    } catch (error) {
      console.error("Error loading part details:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddPart = () => {
    setPartUsages([...partUsages, { repuesto_id: 0, cantidad_usada: 1 }])
  }

  const handleRemovePart = (index: number) => {
    setPartUsages(partUsages.filter((_, i) => i !== index))
  }

  const handlePartChange = (index: number, field: keyof PartUsage, value: any) => {
    const updated = [...partUsages]
    
    // Convert to number if it's repuesto_id or cantidad_usada
    const convertedValue = (field === "repuesto_id" || field === "cantidad_usada") 
      ? parseInt(value) || 0 
      : value
    
    updated[index] = { ...updated[index], [field]: convertedValue }
    
    if (field === "repuesto_id") {
      const part = parts.find(p => p.id === convertedValue)
      if (part) {
        updated[index].nombre = part.nombre
        updated[index].precio_unitario = part.precio_unitario
      }
    }
    
    setPartUsages(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario")
      return
    }

    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setConfirmOpen(false)

    try {
      const data = {
        descripcion: formData.descripcion.trim(),
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        mecanico_asignado_id: formData.mecanico_asignado_id ? parseInt(formData.mecanico_asignado_id) : undefined,
        orden_trabajo_id: workOrderId
      }

      let taskId: number
      let taskCreated = false

      if (task) {
        await api.tasks.update(task.id, data)
        taskId = task.id
        taskCreated = true
        toast.success("Tarea actualizada exitosamente")
      } else {
        const response = await api.tasks.create(data)
        taskId = response.data.id
        taskCreated = true
        toast.success("Tarea creada exitosamente")
      }

      // Save part usages
      for (const usage of partUsages) {
        if (usage.repuesto_id > 0 && usage.cantidad_usada > 0) {
          try {
            const payload = {
              tarea_id: Number(taskId),
              repuesto_id: Number(usage.repuesto_id),
              cantidad_usada: Number(usage.cantidad_usada)
            }
            console.log('📤 Sending part detail:', payload)
            await api.partDetails.create(payload)
          } catch (error: any) {
            console.error("Error saving part detail:", error)
            const message = error.response?.data?.message || `Error al guardar repuesto`
            toast.error(message)
          }
        }
      }

      if (taskCreated) {
        onSave()
      }
    } catch (error: any) {
      console.error("Error saving task:", error)
      const message = error.response?.data?.message || "Error al guardar la tarea"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
          <DialogDescription>
            {task ? "Modifique los datos de la tarea" : "Complete el formulario para agregar una nueva tarea"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Cambio de aceite y filtro"
                rows={3}
                className={errors.descripcion ? "border-destructive" : ""}
              />
              {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mecanico">Mecánico Asignado</Label>
                <Select 
                  value={formData.mecanico_asignado_id} 
                  onValueChange={(value) => setFormData({ ...formData, mecanico_asignado_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un mecánico" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha Vencimiento</Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Repuestos Utilizados</CardTitle>
                    <CardDescription className="text-sm">Agregue los repuestos usados en esta tarea</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPart}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {partUsages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No se han agregado repuestos
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Repuesto</TableHead>
                        <TableHead className="w-32">Cantidad</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partUsages.map((usage, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={usage.repuesto_id.toString()}
                              onValueChange={(value) => handlePartChange(index, "repuesto_id", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un repuesto" />
                              </SelectTrigger>
                              <SelectContent>
                                {parts.map((part) => (
                                  <SelectItem key={part.id} value={part.id.toString()}>
                                    {part.codigo} - {part.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={usage.cantidad_usada}
                              onChange={(e) => handlePartChange(index, "cantidad_usada", parseInt(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemovePart(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        title={isEdit ? "Confirmar Actualización de Tarea" : "Confirmar Creación de Tarea"}
        description={
          isEdit
            ? "¿Está seguro que desea actualizar esta tarea? Los cambios se guardarán inmediatamente."
            : `¿Está seguro que desea crear esta tarea${partUsages.length > 0 ? ` con ${partUsages.length} repuesto(s)` : ""}? Se agregará a la orden de trabajo.`
        }
        confirmText={isEdit ? "Sí, Actualizar" : "Sí, Crear"}
        cancelText="Cancelar"
      />
    </Dialog>
  )
}
