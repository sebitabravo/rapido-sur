"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { authService } from "@/lib/auth"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Truck, User, DollarSign, Clock, Plus, CheckCircle2, Circle, Package, Wrench } from "lucide-react"
import { TaskDialog } from "@/components/task-dialog"
import { RegisterWorkDialog } from "@/components/register-work-dialog"
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
  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [registerWorkDialogOpen, setRegisterWorkDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [mechanics, setMechanics] = useState<any[]>([])
  const [selectedMechanic, setSelectedMechanic] = useState<string>("")
  const [assigningMechanic, setAssigningMechanic] = useState(false)
  const [tasksLoaded, setTasksLoaded] = useState(false)
  const [mechanicsLoaded, setMechanicsLoaded] = useState(false)

  // Check if current user can edit this work order
  const canEdit = () => {
    if (!workOrder) return false
    
    const currentUser = authService.getUser()
    if (!currentUser) return false

    // Admin and JefeMantenimiento can always edit
    if (currentUser.rol === 'Administrador' || currentUser.rol === 'JefeMantenimiento') {
      return true
    }

    // Mecanico can only edit if NOT finalized
    if (currentUser.rol === 'Mecanico') {
      return workOrder.estado !== 'Finalizada'
    }

    return false
  }

  useEffect(() => {
    if (open && workOrder) {
      // Only load if not already loaded or if workOrder changed
      if (!tasksLoaded || workOrder.id !== tasks[0]?.orden_trabajo_id) {
        loadTasks()
      }
      if (!mechanicsLoaded) {
        loadMechanics()
      }
      setNewStatus(workOrder.estado || "")
      setSelectedMechanic(workOrder.mecanico?.id?.toString() || "")
    } else {
      // Reset when dialog closes
      setTasksLoaded(false)
    }
  }, [open, workOrder?.id])

  const loadTasks = async () => {
    if (!workOrder || loadingTasks) return

    try {
      setLoadingTasks(true)
      const response = await api.tasks.getByWorkOrder(workOrder.id)
      setTasks(response.data || [])
      setTasksLoaded(true)
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast.error("Error al cargar las tareas")
    } finally {
      setLoadingTasks(false)
    }
  }

  const loadMechanics = async () => {
    if (mechanicsLoaded) return
    
    // Only load mechanics if user can assign them (Admin or JefeMantenimiento)
    const currentUser = authService.getUser()
    if (!currentUser || currentUser.rol === 'Mecanico') {
      setMechanicsLoaded(true) // Mark as loaded to prevent retries
      return
    }
    
    try {
      const response = await api.users.getMechanics()
      setMechanics(response.data || [])
      setMechanicsLoaded(true)
    } catch (error) {
      console.error("Error loading mechanics:", error)
      setMechanicsLoaded(true) // Mark as loaded even on error to prevent infinite retries
    }
  }

  if (!workOrder) return null

  const handleStatusUpdate = async () => {
    if (!newStatus) return

    try {
      setUpdating(true)
      await api.workOrders.updateStatus(workOrder.id, newStatus)
      
      // If finalizing, reload tasks to show auto-completed ones
      if (newStatus === 'Finalizada') {
        await loadTasks()
        toast.success("Estado actualizado y tareas completadas automáticamente")
      } else {
        toast.success("Estado actualizado correctamente")
      }
      
      onUpdate()
      // Don't close dialog immediately if finalized, let user see completed tasks
      if (newStatus !== 'Finalizada') {
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setUpdating(false)
    }
  }

  const handleAssignMechanic = async () => {
    if (!selectedMechanic) return

    try {
      setAssigningMechanic(true)
      await api.workOrders.assignMechanic(workOrder.id, Number.parseInt(selectedMechanic))
      toast.success("Mecánico asignado correctamente")
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("Error assigning mechanic:", error)
      toast.error("Error al asignar mecánico")
    } finally {
      setAssigningMechanic(false)
    }
  }

  const handleAddTask = () => {
    setSelectedTask(null)
    setTaskDialogOpen(true)
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setTaskDialogOpen(true)
  }

  const handleTaskSaved = async () => {
    await loadTasks()
    setTaskDialogOpen(false)
  }

  const handleCompleteTask = async (taskId: number) => {
    try {
      await api.tasks.complete(taskId)
      toast.success("Tarea completada")
      await loadTasks()
    } catch (error) {
      console.error("Error completing task:", error)
      toast.error("Error al completar la tarea")
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

  const completedTasks = tasks.filter(t => t.completada).length
  const totalTasks = tasks.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Orden de Trabajo #{workOrder.id}</DialogTitle>
          <DialogDescription>Detalles completos de la orden de trabajo</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="tasks">
              Tareas {totalTasks > 0 && `(${completedTasks}/${totalTasks})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
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
          {workOrder.mecanico ? (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Mecánico Asignado</p>
                <p className="font-medium">{workOrder.mecanico.nombre}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="mechanic">Asignar Mecánico</Label>
              <div className="flex items-center gap-2">
                <Select value={selectedMechanic} onValueChange={setSelectedMechanic} disabled={assigningMechanic}>
                  <SelectTrigger id="mechanic" className="flex-1">
                    <SelectValue placeholder="Seleccione un mecánico" />
                  </SelectTrigger>
                  <SelectContent>
                    {mechanics.map((mechanic) => (
                      <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                        {mechanic.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignMechanic} disabled={!selectedMechanic || assigningMechanic}>
                  {assigningMechanic ? "Asignando..." : "Asignar"}
                </Button>
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

          {/* Update Status - Only if user can edit */}
          {canEdit() ? (
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
          ) : (
            <div className="bg-muted/50 border border-muted rounded-lg p-3 text-sm text-muted-foreground">
              ℹ️ Esta orden de trabajo está finalizada. No se puede cambiar el estado.
            </div>
          )}
        </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            {!canEdit() && workOrder.estado === 'Finalizada' && (
              <div className="bg-muted/50 border border-muted rounded-lg p-3 text-sm text-muted-foreground">
                ℹ️ Esta orden de trabajo está finalizada. Solo administradores y jefes de mantenimiento pueden editarla.
              </div>
            )}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tareas de Mantenimiento</CardTitle>
                    <CardDescription>
                      {totalTasks === 0
                        ? "No hay tareas registradas"
                        : `${completedTasks} de ${totalTasks} tareas completadas`}
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddTask} size="sm" disabled={!canEdit()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTasks ? (
                  <p className="text-sm text-muted-foreground">Cargando tareas...</p>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No hay tareas registradas</p>
                    {canEdit() && (
                      <Button onClick={handleAddTask} variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Tarea
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => !task.completada && canEdit() && handleCompleteTask(task.id)}
                            disabled={task.completada || !canEdit()}
                            className="flex-shrink-0"
                          >
                            {task.completada ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className={`h-5 w-5 ${canEdit() ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/50'}`} />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${task.completada ? "line-through text-muted-foreground" : ""}`}>
                              {task.descripcion}
                            </p>
                            {task.mecanico_asignado && (
                              <p className="text-xs text-muted-foreground">
                                Asignado a: {task.mecanico_asignado.nombre}
                              </p>
                            )}
                            {task.fecha_vencimiento && (
                              <p className="text-xs text-muted-foreground">
                                Vencimiento: {formatDate(task.fecha_vencimiento)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                          Ver Detalles
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {/* Register Work Button - Only for assigned mechanic or managers */}
          {(() => {
            const user = authService.getUser()
            const isMechanic = user?.rol === "Mecanico"
            const isManager = user?.rol === "JefeMantenimiento" || user?.rol === "Administrador"
            const isAssignedMechanic = workOrder?.mecanico?.id === user?.id
            const canRegisterWork = (isMechanic && isAssignedMechanic) || isManager
            const isInProgress = workOrder?.estado === "EnProgreso" || workOrder?.estado === "Asignada"

            return canRegisterWork && isInProgress && (
              <Button onClick={() => setRegisterWorkDialogOpen(true)} className="mr-auto">
                <Wrench className="h-4 w-4 mr-2" />
                Registrar Trabajo
              </Button>
            )
          })()}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
        workOrderId={workOrder?.id}
        onSave={handleTaskSaved}
      />

      <RegisterWorkDialog
        open={registerWorkDialogOpen}
        onOpenChange={setRegisterWorkDialogOpen}
        workOrderId={workOrder?.id}
        tasks={tasks}
        onSuccess={() => {
          loadTasks()
          onUpdate()
        }}
      />
    </Dialog>
  )
}
