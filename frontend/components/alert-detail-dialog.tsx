"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Truck, Calendar, X, CheckCircle, Wrench, FileText, Eye } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/lib/auth"

interface AlertDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alertId: number | null
  onSuccess: () => void
}

interface Alert {
  id: number
  tipo_alerta: string
  mensaje: string
  fecha_generacion: string
  email_enviado: boolean
  estado: string
  razon_descarte?: string
  fecha_descarte?: string
  vehiculo?: {
    id: number
    patente: string
    marca: string
    modelo: string
    kilometraje_actual: number
    ultima_revision?: string
    plan_preventivo?: {
      id: number
      descripcion: string
      tipo_intervalo: string
      intervalo: number
      proximo_kilometraje?: number
      proxima_fecha?: string
    }
  }
  orden_trabajo?: {
    id: number
    numero_ot: string
    estado: string
    tipo: string
  }
  descartada_por?: {
    id: number
    nombre_completo: string
    email: string
  }
}

export function AlertDetailDialog({ open, onOpenChange, alertId, onSuccess }: AlertDetailDialogProps) {
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDismissForm, setShowDismissForm] = useState(false)
  const [showCreateWOForm, setShowCreateWOForm] = useState(false)
  const [dismissReason, setDismissReason] = useState("")
  const [woDescription, setWoDescription] = useState("")
  const [woPriority, setWoPriority] = useState("MEDIA")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (open && alertId) {
      loadAlertDetails()
    }
  }, [open, alertId])

  const loadAlertDetails = async () => {
    if (!alertId) return

    try {
      setLoading(true)
      const response = await api.alerts.getOne(alertId)
      setAlert(response.data)
    } catch (error: any) {
      console.error("Error loading alert details:", error)
      toast.error(error.response?.data?.message || "Error al cargar los detalles de la alerta")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async () => {
    if (!alert || !dismissReason.trim()) {
      toast.error("Por favor ingrese una razón para descartar la alerta")
      return
    }

    try {
      setProcessing(true)
      await api.alerts.descartar(alert.id, dismissReason)
      toast.success("Alerta descartada correctamente")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error dismissing alert:", error)
      toast.error(error.response?.data?.message || "Error al descartar la alerta")
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateWorkOrder = async () => {
    if (!alert || !woPriority) {
      toast.error("Por favor complete todos los campos requeridos")
      return
    }

    try {
      setProcessing(true)
      const response = await api.alerts.crearOrdenTrabajo(alert.id, {
        descripcion: woDescription || undefined,
        prioridad: woPriority,
      })
      toast.success(`Orden de trabajo ${response.data.ordenTrabajo.numero_ot} creada exitosamente`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating work order:", error)
      toast.error(error.response?.data?.message || "Error al crear la orden de trabajo")
    } finally {
      setProcessing(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      Activa: "destructive",
      EnProceso: "default",
      Atendida: "outline",
      Descartada: "secondary",
    }
    return <Badge variant={variants[estado] || "default"}>{estado}</Badge>
  }

  const getTipoAlertIcon = (tipo: string) => {
    return tipo === "Kilometraje" ? (
      <AlertTriangle className="h-5 w-5 text-destructive" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-orange-500" />
    )
  }

  const user = authService.getUser()
  const canManageAlerts = user?.rol === "Administrador" || user?.rol === "JefeMantenimiento"
  const canDismiss = canManageAlerts && alert?.estado === "Activa"
  const canCreateWO = canManageAlerts && alert?.estado === "Activa" && !alert?.orden_trabajo

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detalle de Alerta
          </DialogTitle>
          <DialogDescription>Información completa de la alerta de mantenimiento</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8">
            <LoadingSpinner message="Cargando detalles de la alerta..." />
          </div>
        ) : alert ? (
          <div className="space-y-6">
            {/* Alert Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getTipoAlertIcon(alert.tipo_alerta)}
                <div>
                  <p className="font-medium">{alert.mensaje}</p>
                  <p className="text-xs text-muted-foreground">
                    Generada el {formatDate(alert.fecha_generacion, "dd MMM yyyy HH:mm")}
                  </p>
                </div>
              </div>
              {getEstadoBadge(alert.estado)}
            </div>

            {/* Vehicle Information */}
            {alert.vehiculo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Truck className="h-4 w-4" />
                  <h3>Vehículo</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Patente</Label>
                    <p className="font-medium">{alert.vehiculo.patente}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Marca y Modelo</Label>
                    <p className="font-medium">
                      {alert.vehiculo.marca} {alert.vehiculo.modelo}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Kilometraje Actual</Label>
                    <p className="font-medium">{alert.vehiculo.kilometraje_actual.toLocaleString()} km</p>
                  </div>
                  {alert.vehiculo.ultima_revision && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Última Revisión</Label>
                      <p className="font-medium">{formatDate(alert.vehiculo.ultima_revision, "dd MMM yyyy")}</p>
                    </div>
                  )}
                </div>

                {/* Preventive Plan */}
                {alert.vehiculo.plan_preventivo && (
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm">Plan Preventivo</h4>
                    </div>
                    <p className="text-sm mb-2">{alert.vehiculo.plan_preventivo.descripcion}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Tipo: </span>
                        <span className="font-medium">{alert.vehiculo.plan_preventivo.tipo_intervalo}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Intervalo: </span>
                        <span className="font-medium">
                          {alert.vehiculo.plan_preventivo.intervalo}
                          {alert.vehiculo.plan_preventivo.tipo_intervalo === "KM" ? " km" : " días"}
                        </span>
                      </div>
                      {alert.vehiculo.plan_preventivo.proximo_kilometraje && (
                        <div>
                          <span className="text-muted-foreground">Próximo: </span>
                          <span className="font-medium">
                            {alert.vehiculo.plan_preventivo.proximo_kilometraje.toLocaleString()} km
                          </span>
                        </div>
                      )}
                      {alert.vehiculo.plan_preventivo.proxima_fecha && (
                        <div>
                          <span className="text-muted-foreground">Próxima Fecha: </span>
                          <span className="font-medium">
                            {formatDate(alert.vehiculo.plan_preventivo.proxima_fecha, "dd MMM yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Work Order (if exists) */}
            {alert.orden_trabajo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Wrench className="h-4 w-4" />
                  <h3>Orden de Trabajo Asociada</h3>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{alert.orden_trabajo.numero_ot}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {alert.orden_trabajo.tipo} • Estado: {alert.orden_trabajo.estado}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => window.open(`/work-orders`, "_blank")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver OT
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Dismissed Info */}
            {alert.estado === "Descartada" && alert.razon_descarte && (
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <X className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">Alerta Descartada</h4>
                </div>
                <p className="text-sm mb-2">{alert.razon_descarte}</p>
                {alert.descartada_por && (
                  <p className="text-xs text-muted-foreground">
                    Por: {alert.descartada_por.nombre_completo} • {formatDate(alert.fecha_descarte || "", "dd MMM yyyy HH:mm")}
                  </p>
                )}
              </div>
            )}

            {/* Action Forms */}
            {showDismissForm && canDismiss && (
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950/20 space-y-3">
                <Label>Razón para descartar la alerta</Label>
                <Textarea
                  placeholder="Ej: Falsa alarma - vehículo recién mantenido externamente"
                  value={dismissReason}
                  onChange={(e) => setDismissReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleDismiss} disabled={processing} variant="destructive" size="sm">
                    {processing ? "Descartando..." : "Confirmar Descarte"}
                  </Button>
                  <Button onClick={() => setShowDismissForm(false)} variant="outline" size="sm">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {showCreateWOForm && canCreateWO && (
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-3">
                <Label>Descripción adicional (opcional)</Label>
                <Textarea
                  placeholder="Descripción adicional para la orden de trabajo"
                  value={woDescription}
                  onChange={(e) => setWoDescription(e.target.value)}
                  rows={3}
                />
                <div>
                  <Label>Prioridad *</Label>
                  <Select value={woPriority} onValueChange={setWoPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAJA">Baja</SelectItem>
                      <SelectItem value="MEDIA">Media</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateWorkOrder} disabled={processing} size="sm">
                    {processing ? "Creando..." : "Crear Orden de Trabajo"}
                  </Button>
                  <Button onClick={() => setShowCreateWOForm(false)} variant="outline" size="sm">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No se encontró la alerta</div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {alert && (
            <>
              {canCreateWO && !showCreateWOForm && (
                <Button onClick={() => setShowCreateWOForm(true)} variant="default" className="w-full sm:w-auto">
                  <Wrench className="h-4 w-4 mr-2" />
                  Crear Orden de Trabajo
                </Button>
              )}
              {canDismiss && !showDismissForm && (
                <Button onClick={() => setShowDismissForm(true)} variant="outline" className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Descartar Alerta
                </Button>
              )}
            </>
          )}
          <Button onClick={() => onOpenChange(false)} variant="secondary" className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
