'use client'

/**
 * Página de Demo/Feedback - Para Exposición
 * Botones de demostración para mostrar funcionalidades en vivo
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  PlayCircle,
  Bell,
  Mail,
  Zap,
  Loader2,
  Info,
  RefreshCw,
  Gauge,
  Wrench,
  BarChart3,
  Send,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'

export default function DemoFeedbackPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [alerts, setAlerts] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => {
    const currentUser = authService.getUser()
    setUser(currentUser)

    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Solo administradores pueden acceder a esta página
    if (currentUser?.rol !== 'Administrador') {
      toast.error('Acceso denegado', {
        description: 'Solo los administradores pueden acceder a esta página'
      })
      router.push('/dashboard')
      return
    }

    loadAlerts()
    loadVehicles()
  }, [router])

  const setLoadingState = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }

  const loadAlerts = async () => {
    try {
      const response = await api.alerts.getAll()
      setAlerts(response.data || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const loadVehicles = async () => {
    try {
      const response = await api.vehicles.getAll({ limit: 100 })
      setVehicles(response.data.items || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
    }
  }

  // ==================== DEMO EXPOSICIÓN ====================

  // 🚨 Simular Desgaste - Aumenta km de un vehículo para disparar alertas
  const handleSimulateWear = async () => {
    setLoadingState('simulateWear', true)
    try {
      // Obtener vehículos activos
      const vehiclesRes = await api.vehicles.getAll({ estado: 'Activo', limit: 10 })
      const activeVehicles = vehiclesRes.data.items || []

      if (activeVehicles.length === 0) {
        toast.warning('No hay vehículos activos', {
          description: 'Crea un vehículo primero para simular desgaste'
        })
        return
      }

      // Seleccionar un vehículo aleatorio
      const randomVehicle = activeVehicles[Math.floor(Math.random() * activeVehicles.length)]
      const newKm = (randomVehicle.kilometraje_actual || 0) + 5000 // Agregar 5000 km

      // Actualizar el kilometraje
      await api.vehicles.update(randomVehicle.id, {
        kilometraje_actual: newKm
      })

      toast.success('🚨 Desgaste simulado', {
        description: `${randomVehicle.patente}: +5,000 km (${newKm.toLocaleString()} km total)`
      })

      // Verificar alertas después del desgaste
      setTimeout(async () => {
        try {
          await api.alerts.verificarAhora()
          toast.info('Verificando alertas...', {
            description: 'Revisa la sección de alertas para ver si se generaron nuevas'
          })
          await loadAlerts()
        } catch (e) {
          console.error('Error verificando alertas:', e)
        }
      }, 1000)

    } catch (error: any) {
      toast.error('Error al simular desgaste', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState('simulateWear', false)
    }
  }

  // 🛠️ Crear OT Automática
  const handleAutoCreateWO = async () => {
    setLoadingState('autoCreateWO', true)
    try {
      // Obtener vehículos activos
      const vehiclesRes = await api.vehicles.getAll({ estado: 'Activo', limit: 10 })
      const activeVehicles = vehiclesRes.data.items || []

      if (activeVehicles.length === 0) {
        toast.warning('No hay vehículos activos', {
          description: 'Crea un vehículo primero'
        })
        return
      }

      // Seleccionar un vehículo aleatorio
      const randomVehicle = activeVehicles[Math.floor(Math.random() * activeVehicles.length)]

      // Tipos de mantenimiento para demo
      const tiposDemo = [
        { tipo: 'Preventivo', descripcion: 'Mantención preventiva programada - Cambio de aceite y filtros' },
        { tipo: 'Correctivo', descripcion: 'Reparación de frenos - Ruido anormal detectado' },
        { tipo: 'Preventivo', descripcion: 'Revisión de suspensión y amortiguadores' },
        { tipo: 'Correctivo', descripcion: 'Cambio de neumáticos por desgaste' },
      ]
      const randomTipo = tiposDemo[Math.floor(Math.random() * tiposDemo.length)]

      // Crear la orden de trabajo
      const response = await api.workOrders.create({
        vehiculo_id: randomVehicle.id,
        tipo: randomTipo.tipo,
        descripcion: randomTipo.descripcion,
        prioridad: 'MEDIA'
      })

      toast.success('🛠️ Orden de Trabajo creada', {
        description: `${response.data.numero_ot} - ${randomVehicle.patente}`
      })

      // Mostrar link para ver la OT
      setTimeout(() => {
        toast.info('Ver orden de trabajo', {
          description: 'Ve a Órdenes de Trabajo para ver la nueva OT',
          action: {
            label: 'Ir',
            onClick: () => router.push('/work-orders')
          }
        })
      }, 1500)

    } catch (error: any) {
      toast.error('Error al crear OT', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState('autoCreateWO', false)
    }
  }

  // 📊 Llenar Gráficos - Obtiene y muestra datos de reportes
  const handleFillCharts = async () => {
    setLoadingState('fillCharts', true)
    try {
      // Obtener fechas para el último mes
      const today = new Date()
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const params = {
        fecha_inicio: lastMonth.toISOString().split('T')[0],
        fecha_fin: today.toISOString().split('T')[0]
      }

      // Obtener datos de reportes
      const [costos, mantenimientos] = await Promise.all([
        api.reports.costs(params),
        api.reports.maintenance(params)
      ])

      const costosData = costos.data
      const mantData = mantenimientos.data

      toast.success('📊 Datos de reportes obtenidos', {
        description: `Costos: $${(costosData.total_costos || 0).toLocaleString()} | OTs: ${mantData.total || 0}`
      })

      // Mostrar detalles
      setTimeout(() => {
        toast.info('Resumen de mantenimientos', {
          description: `Preventivos: ${mantData.preventivos || 0} | Correctivos: ${mantData.correctivos || 0}`,
          action: {
            label: 'Ver Reportes',
            onClick: () => router.push('/reports')
          }
        })
      }, 1500)

    } catch (error: any) {
      toast.error('Error al obtener datos', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState('fillCharts', false)
    }
  }

  // 📧 Test Email
  const handleSendTestEmail = async () => {
    setLoadingState('sendEmail', true)
    try {
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '')
      const response = await fetch(`${apiBaseUrl}/mail/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success) {
        toast.success('📧 Email de prueba enviado', {
          description: data.message
        })
      } else {
        toast.error('Error al enviar email', {
          description: data.error || data.message
        })
      }
    } catch (error: any) {
      toast.error('Error al enviar email', {
        description: error.message
      })
    } finally {
      setLoadingState('sendEmail', false)
    }
  }

  // ==================== ALERTAS ====================

  const handleVerifyAlerts = async () => {
    setLoadingState('verifyAlerts', true)
    try {
      const response = await api.alerts.verificarAhora()
      toast.success(`Verificación completada`, {
        description: `${response.data.alertasGeneradas} alertas generadas`
      })
      await loadAlerts()
    } catch (error: any) {
      toast.error('Error al verificar alertas', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState('verifyAlerts', false)
    }
  }

  const handleCreateTestAlerts = async () => {
    setLoadingState('createTestAlerts', true)
    try {
      const response = await api.alerts.crearPrueba()
      toast.success(`Alertas de prueba creadas`, {
        description: `${response.data.alertas.length} alertas creadas`
      })
      await loadAlerts()
    } catch (error: any) {
      toast.error('Error al crear alertas', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState('createTestAlerts', false)
    }
  }

  const handleDismissAlert = async (alertId: number) => {
    setLoadingState(`dismiss-${alertId}`, true)
    try {
      await api.alerts.descartar(alertId, 'Descartada desde página de testing')
      toast.success('Alerta descartada')
      await loadAlerts()
    } catch (error: any) {
      toast.error('Error al descartar', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState(`dismiss-${alertId}`, false)
    }
  }

  const handleCreateWOFromAlert = async (alertId: number) => {
    setLoadingState(`createWO-${alertId}`, true)
    try {
      const response = await api.alerts.crearOrdenTrabajo(alertId, { prioridad: 'MEDIA' })
      toast.success(`Orden de trabajo creada`, {
        description: `${response.data.ordenTrabajo.numero_ot}`
      })
      await loadAlerts()
    } catch (error: any) {
      toast.error('Error al crear OT', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setLoadingState(`createWO-${alertId}`, false)
    }
  }

  // ==================== NOTIFICACIONES TOAST ====================

  const showAllToasts = () => {
    toast('Notificación genérica', {
      description: 'Este es un mensaje normal del sistema'
    })

    setTimeout(() => {
      toast.success('Operación exitosa', {
        description: 'La orden de trabajo fue creada correctamente'
      })
    }, 500)

    setTimeout(() => {
      toast.info('Información', {
        description: 'El mantenimiento está programado para mañana'
      })
    }, 1000)

    setTimeout(() => {
      toast.warning('Advertencia', {
        description: 'El vehículo requiere mantención en 500 km'
      })
    }, 1500)

    setTimeout(() => {
      toast.error('Error', {
        description: 'No se pudo conectar con el servidor'
      })
    }, 2000)
  }

  const activeAlerts = alerts.filter(a => a.estado === 'Activa')
  const isAdmin = user?.rol === 'Administrador'
  const canManage = isAdmin || user?.rol === 'JefeMantenimiento'

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">🎯 Panel de Demo</h1>
        <p className="text-muted-foreground">
          Página de demostración para la exposición del sistema
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{user?.rol}</Badge>
          <Badge variant="secondary">{user?.email}</Badge>
        </div>
      </div>

      <div className="space-y-6">

        {/* ========== SECCIÓN DEMO EXPOSICIÓN ========== */}
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-primary" />
              🎪 Demo para Exposición
            </CardTitle>
            <CardDescription className="text-base">
              Botones de demostración en vivo. Cada uno ejecuta una acción real en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 🚨 Simular Desgaste */}
              <Button
                onClick={handleSimulateWear}
                disabled={loading.simulateWear}
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading.simulateWear ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Gauge className="h-8 w-8" />
                )}
                <span className="text-lg font-bold">🚨 Simular Desgaste</span>
                <span className="text-xs opacity-80 font-normal">
                  Aumenta km de un vehículo → Dispara alertas
                </span>
              </Button>

              {/* 🛠️ Crear OT Auto */}
              <Button
                onClick={handleAutoCreateWO}
                disabled={loading.autoCreateWO}
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading.autoCreateWO ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Wrench className="h-8 w-8" />
                )}
                <span className="text-lg font-bold">🛠️ Crear OT Auto</span>
                <span className="text-xs opacity-80 font-normal">
                  Crea orden de trabajo automáticamente
                </span>
              </Button>

              {/* 📊 Llenar Gráficos */}
              <Button
                onClick={handleFillCharts}
                disabled={loading.fillCharts}
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading.fillCharts ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <BarChart3 className="h-8 w-8" />
                )}
                <span className="text-lg font-bold">📊 Llenar Gráficos</span>
                <span className="text-xs opacity-80 font-normal">
                  Muestra datos de costos y mantenimientos
                </span>
              </Button>

              {/* 📧 Test Email */}
              <Button
                onClick={handleSendTestEmail}
                disabled={loading.sendEmail}
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading.sendEmail ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Send className="h-8 w-8" />
                )}
                <span className="text-lg font-bold">📧 Test Email</span>
                <span className="text-xs opacity-80 font-normal">
                  Envía correo de prueba al admin
                </span>
              </Button>

            </div>

            <Separator className="my-6" />

            {/* Indicador de estado */}
            <div className="text-center text-sm text-muted-foreground">
              <p>💡 <strong>Tip:</strong> Usa estos botones durante la presentación para mostrar el sistema funcionando en tiempo real</p>
            </div>
          </CardContent>
        </Card>

        {/* ALERTAS PREVENTIVAS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Alertas Preventivas
            </CardTitle>
            <CardDescription>
              Genera y gestiona alertas de mantenimiento preventivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={loadAlerts}
                variant="outline"
                disabled={loading.loadAlerts}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading.loadAlerts ? 'animate-spin' : ''}`} />
                Recargar Alertas
              </Button>

              {canManage && (
                <Button
                  onClick={handleVerifyAlerts}
                  disabled={loading.verifyAlerts}
                >
                  {loading.verifyAlerts ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  Ejecutar Verificación (CRON)
                </Button>
              )}

              {isAdmin && (
                <Button
                  onClick={handleCreateTestAlerts}
                  disabled={loading.createTestAlerts}
                  variant="secondary"
                >
                  {loading.createTestAlerts ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Crear Alertas de Prueba
                </Button>
              )}
            </div>

            <Separator />

            {/* Lista de alertas activas */}
            <div>
              <h4 className="font-medium mb-2">
                Alertas Activas ({activeAlerts.length})
              </h4>

              {activeAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                  No hay alertas activas. Usa "Simular Desgaste" o "Crear Alertas de Prueba" para generar algunas.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeAlerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${alert.tipo_alerta === 'Kilometraje' ? 'text-red-500' : 'text-orange-500'
                          }`} />
                        <div>
                          <p className="text-sm font-medium">{alert.vehiculo?.patente}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.tipo_alerta} - {alert.mensaje?.substring(0, 50)}...
                          </p>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleCreateWOFromAlert(alert.id)}
                            disabled={loading[`createWO-${alert.id}`]}
                          >
                            {loading[`createWO-${alert.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Crear OT'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDismissAlert(alert.id)}
                            disabled={loading[`dismiss-${alert.id}`]}
                          >
                            {loading[`dismiss-${alert.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Descartar'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICACIONES TOAST */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Notificaciones Toast
            </CardTitle>
            <CardDescription>
              Prueba los diferentes tipos de notificaciones que aparecen en pantalla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={showAllToasts} className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Mostrar Todos los Tipos de Notificación
            </Button>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="default"
                onClick={() => toast.success('Éxito', { description: 'Operación completada correctamente' })}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Éxito
              </Button>

              <Button
                variant="destructive"
                onClick={() => toast.error('Error', { description: 'Algo salió mal' })}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Error
              </Button>

              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => toast.warning('Advertencia', { description: 'Ten cuidado con esta acción' })}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Warning
              </Button>

              <Button
                variant="outline"
                onClick={() => toast.info('Información', { description: 'Dato importante para ti' })}
              >
                <Info className="mr-2 h-4 w-4" />
                Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* INFO */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Flujo sugerido para la exposición
                </p>
                <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  <li><strong>Simular Desgaste</strong> → Muestra cómo el sistema detecta cuando un vehículo necesita mantención</li>
                  <li><strong>Ver Alertas</strong> → Las alertas aparecen automáticamente en la sección de arriba</li>
                  <li><strong>Crear OT Auto</strong> → Demuestra la creación rápida de órdenes de trabajo</li>
                  <li><strong>Llenar Gráficos</strong> → Muestra el valor de los datos acumulados en reportes</li>
                  <li><strong>Test Email</strong> → Prueba que el sistema puede comunicarse externamente</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
