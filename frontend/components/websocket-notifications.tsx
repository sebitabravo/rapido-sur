"use client";

import { useEffect, useState } from 'react';
import { useWebSocketSubscriptions } from '@/hooks/useWebSocket';
import { toast } from 'sonner';

/**
 * Component that listens to WebSocket events and shows toast notifications
 * Should be mounted once in the app layout
 * Automatically gets userId from localStorage
 */
export function WebSocketNotifications() {
  const [userId, setUserId] = useState<number | undefined>();

  // Get user ID from localStorage
  useEffect(() => {
    try {
      const authStr = localStorage.getItem('auth');
      if (authStr) {
        const auth = JSON.parse(authStr);
        if (auth?.user?.id) {
          setUserId(auth.user.id);
        }
      }
    } catch (error) {
      console.error('[WebSocket] Error getting user ID:', error);
    }
  }, []);

  const { subscribe, unsubscribe, connected } = useWebSocketSubscriptions(userId);

  useEffect(() => {
    if (!connected) return;

    // Work Order Events
    const handleWorkOrderCreated = (data: any) => {
      toast.success('Nueva Orden de Trabajo', {
        description: `OT ${data.numero_ot} creada para ${data.vehiculo.patente}`,
      });
    };

    const handleWorkOrderStatusChanged = (data: any) => {
      toast.info('Estado de OT Actualizado', {
        description: `OT ${data.numero_ot}: ${data.estado_anterior} → ${data.nuevo_estado}`,
      });
    };

    const handleWorkOrderCompleted = (data: any) => {
      toast.success('Orden de Trabajo Finalizada', {
        description: `OT ${data.numero_ot} completada por ${data.mecanico.nombre_completo}`,
      });
    };

    // Alert Events
    const handleAlertCreated = (data: any) => {
      toast.warning('Nueva Alerta Preventiva', {
        description: `${data.vehiculo.patente}: ${data.mensaje}`,
        duration: 5000,
      });
    };

    // Inventory Events
    const handleLowStock = (data: any) => {
      toast.warning('Alerta de Stock Bajo', {
        description: `${data.totalParts} repuesto(s) necesitan reabastecimiento`,
        duration: 5000,
      });
    };

    // Task Events
    const handleTaskCompleted = (data: any) => {
      toast.success('Tarea Completada', {
        description: `Tarea en OT ${data.orden_trabajo.numero_ot} completada`,
      });
    };

    // Generic Notifications
    const handleNotification = (notification: any) => {
      const toastFunction = {
        info: toast.info,
        success: toast.success,
        warning: toast.warning,
        error: toast.error,
      }[notification.type] || toast;

      toastFunction(notification.title, {
        description: notification.message,
      });
    };

    // Subscribe to events
    subscribe('workOrder:created', handleWorkOrderCreated);
    subscribe('workOrder:statusChanged', handleWorkOrderStatusChanged);
    subscribe('workOrder:completed', handleWorkOrderCompleted);
    subscribe('alert:created', handleAlertCreated);
    subscribe('inventory:lowStock', handleLowStock);
    subscribe('task:completed', handleTaskCompleted);
    subscribe('notification', handleNotification);

    // Cleanup subscriptions
    return () => {
      unsubscribe('workOrder:created');
      unsubscribe('workOrder:statusChanged');
      unsubscribe('workOrder:completed');
      unsubscribe('alert:created');
      unsubscribe('inventory:lowStock');
      unsubscribe('task:completed');
      unsubscribe('notification');
    };
  }, [connected, subscribe, unsubscribe]);

  // Show connection status
  useEffect(() => {
    if (connected) {
      console.log('[WebSocket] Real-time notifications active');
    }
  }, [connected]);

  return null; // This component doesn't render anything
}
