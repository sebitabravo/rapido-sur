/**
 * Custom hook for standardized toast notifications
 * Provides consistent feedback messages across the application
 *
 * @example
 * const { showSuccess, showError, showLoading } = useToastFeedback()
 *
 * // Show success message
 * showSuccess('Vehículo creado exitosamente')
 *
 * // Show error with custom action
 * showError('Error al crear vehículo', {
 *   action: { label: 'Reintentar', onClick: () => retry() }
 * })
 *
 * // Show loading with promise
 * await showLoading(
 *   apiCall(),
 *   'Guardando...',
 *   'Guardado exitosamente',
 *   'Error al guardar'
 * )
 */

import { toast } from 'sonner'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastOptions {
  duration?: number
  action?: ToastAction
  description?: string
}

export function useToastFeedback() {
  /**
   * Show success toast
   */
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    })
  }

  /**
   * Show error toast
   */
  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 5000,
      description: options?.description,
      action: options?.action,
    })
  }

  /**
   * Show warning toast
   */
  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    })
  }

  /**
   * Show info toast
   */
  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    })
  }

  /**
   * Show loading toast with promise
   * Automatically shows success/error based on promise result
   */
  const showLoading = async <T,>(
    promise: Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage?: string
  ): Promise<T> => {
    return toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage || 'Ocurrió un error inesperado',
    })
  }

  /**
   * Show loading toast and return dismiss function
   */
  const showLoadingManual = (message: string) => {
    return toast.loading(message)
  }

  /**
   * Dismiss a specific toast
   */
  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    toast.dismiss()
  }

  // Predefined messages for common operations
  const messages = {
    create: {
      loading: 'Creando...',
      success: 'Creado exitosamente',
      error: 'Error al crear',
    },
    update: {
      loading: 'Actualizando...',
      success: 'Actualizado exitosamente',
      error: 'Error al actualizar',
    },
    delete: {
      loading: 'Eliminando...',
      success: 'Eliminado exitosamente',
      error: 'Error al eliminar',
    },
    save: {
      loading: 'Guardando...',
      success: 'Guardado exitosamente',
      error: 'Error al guardar',
    },
    load: {
      loading: 'Cargando...',
      success: 'Cargado exitosamente',
      error: 'Error al cargar',
    },
    upload: {
      loading: 'Subiendo archivo...',
      success: 'Archivo subido exitosamente',
      error: 'Error al subir archivo',
    },
    download: {
      loading: 'Descargando...',
      success: 'Descarga completada',
      error: 'Error al descargar',
    },
    export: {
      loading: 'Exportando...',
      success: 'Exportado exitosamente',
      error: 'Error al exportar',
    },
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showLoadingManual,
    dismiss,
    dismissAll,
    messages,
  }
}
