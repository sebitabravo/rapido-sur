'use client'

/**
 * Demo Page - Sistema de Feedback Visual
 * Esta página demuestra todos los componentes de feedback visual
 * Útil para testing y como referencia para developers
 */

import { useState } from 'react'
import { useToastFeedback } from '@/hooks/use-toast-feedback'
import { LoadingButton } from '@/components/ui/loading-button'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

export default function FeedbackDemoPage() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showLoadingManual,
    dismiss,
    messages,
  } = useToastFeedback()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  // Simular operación async
  const simulateAsync = (duration = 2000): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, duration))
  }

  // Simular operación async con error
  const simulateError = (): Promise<void> => {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Simulado')), 2000))
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Sistema de Feedback Visual</h1>
        <p className="text-muted-foreground">
          Demostración completa de todos los componentes de feedback visual
        </p>
      </div>

      <div className="space-y-8">
        {/* Toast Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>
              Notificaciones no intrusivas que aparecen temporalmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() =>
                  showSuccess('Operación exitosa', {
                    description: 'El vehículo fue creado correctamente',
                  })
                }
                variant="default"
                className="w-full"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Toast de Éxito
              </Button>

              <Button
                onClick={() =>
                  showError('Error en la operación', {
                    description: 'No se pudo conectar con el servidor',
                    action: {
                      label: 'Reintentar',
                      onClick: () => showInfo('Reintentando...'),
                    },
                  })
                }
                variant="destructive"
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Toast de Error
              </Button>

              <Button
                onClick={() =>
                  showWarning('Advertencia', {
                    description: 'Esta acción no se puede deshacer',
                  })
                }
                variant="outline"
                className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Toast de Advertencia
              </Button>

              <Button
                onClick={() =>
                  showInfo('Información', {
                    description: 'El mantenimiento está programado para mañana',
                  })
                }
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Info className="mr-2 h-4 w-4" />
                Toast Informativo
              </Button>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Toast con Promise (automático)</h4>
              <Button
                onClick={async () => {
                  try {
                    await showLoading(
                      simulateAsync(3000),
                      'Guardando vehículo...',
                      'Vehículo guardado exitosamente',
                      'Error al guardar el vehículo'
                    )
                  } catch (error) {
                    // El error ya fue mostrado automáticamente
                  }
                }}
                className="w-full"
              >
                <Loader2 className="mr-2 h-4 w-4" />
                Toast con Loading Automático (3s)
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Toast con Error en Promise</h4>
              <Button
                onClick={async () => {
                  try {
                    await showLoading(
                      simulateError(),
                      'Guardando...',
                      'Guardado!',
                      'Error al guardar'
                    )
                  } catch (error) {
                    // El error ya fue mostrado automáticamente
                  }
                }}
                variant="destructive"
                className="w-full"
              >
                Simular Error en Promise (2s)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Diferentes tipos de indicadores de carga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loading Button */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                Loading Button
                <Badge variant="outline">Recomendado para formularios</Badge>
              </h4>
              <div className="flex gap-4">
                <LoadingButton
                  loading={isSubmitting}
                  onClick={() => {
                    setIsSubmitting(true)
                    setTimeout(() => setIsSubmitting(false), 3000)
                  }}
                  className="flex-1"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Vehículo'}
                </LoadingButton>

                <LoadingButton
                  loading={isSubmitting}
                  loadingText="Eliminando..."
                  onClick={() => {
                    setIsSubmitting(true)
                    setTimeout(() => setIsSubmitting(false), 3000)
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  Eliminar
                </LoadingButton>
              </div>
            </div>

            <Separator />

            {/* Loading Spinner */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                Loading Spinner
                <Badge variant="outline">Para secciones pequeñas</Badge>
              </h4>
              <Button
                onClick={() => {
                  setShowSpinner(true)
                  setTimeout(() => setShowSpinner(false), 3000)
                }}
                variant="outline"
                className="w-full"
              >
                {showSpinner ? 'Cargando...' : 'Mostrar Loading Spinner (3s)'}
              </Button>
              {showSpinner && (
                <div className="mt-4 border rounded-lg p-4">
                  <LoadingSpinner message="Cargando datos del vehículo..." />
                </div>
              )}
            </div>

            <Separator />

            {/* Loading Overlay */}
            <div className="relative">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                Loading Overlay
                <Badge variant="outline">Para bloquear secciones</Badge>
              </h4>
              <Button
                onClick={() => {
                  setShowOverlay(true)
                  setTimeout(() => setShowOverlay(false), 3000)
                }}
                variant="outline"
                className="w-full"
              >
                Mostrar Loading Overlay (3s)
              </Button>

              <div className="mt-4 border rounded-lg p-8 relative min-h-[200px]">
                {showOverlay && <LoadingOverlay message="Procesando orden de trabajo..." />}
                <h5 className="font-medium mb-2">Contenido de ejemplo</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Este contenido se bloqueará cuando el loading overlay esté activo.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ejemplo Completo CRUD */}
        <Card>
          <CardHeader>
            <CardTitle>Ejemplo Completo: Crear Vehículo</CardTitle>
            <CardDescription>
              Demostración de un flujo completo con feedback visual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimulatedVehicleForm />
          </CardContent>
        </Card>

        {/* Mensajes Predefinidos */}
        <Card>
          <CardHeader>
            <CardTitle>Mensajes Predefinidos</CardTitle>
            <CardDescription>
              Mensajes estandarizados para operaciones comunes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await showLoading(
                    simulateAsync(2000),
                    messages.create.loading,
                    messages.create.success,
                    messages.create.error
                  )
                }}
              >
                Crear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await showLoading(
                    simulateAsync(2000),
                    messages.update.loading,
                    messages.update.success,
                    messages.update.error
                  )
                }}
              >
                Actualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await showLoading(
                    simulateAsync(2000),
                    messages.delete.loading,
                    messages.delete.success,
                    messages.delete.error
                  )
                }}
              >
                Eliminar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await showLoading(
                    simulateAsync(2000),
                    messages.export.loading,
                    messages.export.success,
                    messages.export.error
                  )
                }}
              >
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de ejemplo para formulario
function SimulatedVehicleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showLoading } = useToastFeedback()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await showLoading(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        'Creando vehículo...',
        'Vehículo ABC-123 creado exitosamente',
        'Error al crear el vehículo'
      )
    } catch (error) {
      // Error ya manejado
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Patente</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="ABC-123"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Marca</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="Toyota"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <LoadingButton
        loading={isSubmitting}
        loadingText="Creando vehículo..."
        type="submit"
        className="w-full"
      >
        Crear Vehículo
      </LoadingButton>
    </form>
  )
}
