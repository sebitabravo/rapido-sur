'use client'

/**
 * Página de Testing - Alertas, Notificaciones y Correos
 * Prueba las funcionalidades principales del sistema
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

  // ==================== CORREOS ====================
  
  const handleSendTestEmail = async () => {
    setLoadingState('sendEmail', true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Email de prueba enviado', {
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
        <h1 className="text-3xl font-bold mb-2">🧪 Testing del Sistema</h1>
        <p className="text-muted-foreground">
          Prueba alertas, notificaciones y correos electrónicos
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{user?.rol}</Badge>
          <Badge variant="secondary">{user?.email}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        
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
                  No hay alertas activas. Usa "Crear Alertas de Prueba" para generar algunas.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeAlerts.slice(0, 10).map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.tipo_alerta === 'Kilometraje' ? 'text-red-500' : 'text-orange-500'
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

        {/* CORREOS ELECTRÓNICOS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Correos Electrónicos
            </CardTitle>
            <CardDescription>
              Prueba el envío de correos electrónicos via Resend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin ? (
              <>
                <Button 
                  onClick={handleSendTestEmail}
                  disabled={loading.sendEmail}
                  className="w-full"
                >
                  {loading.sendEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Enviar Email de Prueba
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  El email se enviará a la dirección configurada en el sistema
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Solo los administradores pueden enviar emails de prueba
              </p>
            )}
            
            <Separator />
            
            <div className="text-sm space-y-2">
              <h4 className="font-medium">Correos que envía el sistema:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Alertas Preventivas:</strong> Se envían a todos los Jefes de Mantenimiento y Admins</li>
                <li><strong>Asignación de OT:</strong> Se envía al mecánico asignado (siempre)</li>
                <li><strong>Cambio de estado OT:</strong> Se envía al mecánico y jefe</li>
                <li><strong>Stock bajo:</strong> Se envía a Jefes y Admins con notif. habilitadas</li>
              </ul>
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
                  Cómo probar el flujo completo
                </p>
                <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  <li>Crea alertas de prueba con el botón "Crear Alertas de Prueba"</li>
                  <li>Observa cómo aparecen las notificaciones toast</li>
                  <li>Crea una OT desde una alerta → El mecánico recibirá un email</li>
                  <li>O descarta la alerta si es una falsa alarma</li>
                  <li>Prueba el envío de email directo con "Enviar Email de Prueba"</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
