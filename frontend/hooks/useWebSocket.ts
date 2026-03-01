import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketHookOptions {
  url?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface WebSocketHook {
  socket: Socket | null;
  connected: boolean;
  subscribe: (event: string, callback: (data: unknown) => void) => void;
  unsubscribe: (event: string) => void;
  emit: (event: string, data?: unknown) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

const debugLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

/**
 * Custom hook for WebSocket connections using Socket.IO
 * Manages connection lifecycle and event subscriptions
 */
export function useWebSocket(options: WebSocketHookOptions = {}): WebSocketHook {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const configuredSocketUrl = configuredApiUrl?.replace(/\/api$/, '');
  const sameOriginUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const {
    url = configuredSocketUrl || sameOriginUrl,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    // Create Socket.IO connection to /events namespace.
    // If url is empty, use relative namespace to avoid localhost hardcoding.
    const socketNamespace = url ? `${url.replace(/\/+$/, '')}/events` : '/events';
    const socket = io(socketNamespace, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      debugLog('[WebSocket] Connected:', socket.id);
      setConnected(true);
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      debugLog('[WebSocket] Disconnected:', reason);
      setConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      onError?.(error as Error);
    });

    socket.on('connected', (data) => {
      debugLog('[WebSocket] Server welcome:', data);
    });

    // Cleanup on unmount
    return () => {
      debugLog('[WebSocket] Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect, onConnect, onDisconnect, onError]);

  /**
   * Subscribe to a WebSocket event
   */
  const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
    if (!socketRef.current) {
      if (isDev) {
        console.warn(`[WebSocket] Cannot subscribe to "${event}" - socket not connected`);
      }
      return;
    }

    debugLog(`[WebSocket] Subscribing to event: ${event}`);
    socketRef.current.on(event, callback);
  }, []);

  /**
   * Unsubscribe from a WebSocket event
   */
  const unsubscribe = useCallback((event: string) => {
    if (!socketRef.current) return;

    debugLog(`[WebSocket] Unsubscribing from event: ${event}`);
    socketRef.current.off(event);
  }, []);

  /**
   * Emit an event to the server
   */
  const emit = useCallback((event: string, data?: unknown) => {
    if (!socketRef.current || !connected) {
      if (isDev) {
        console.warn(`[WebSocket] Cannot emit "${event}" - socket not connected`);
      }
      return;
    }

    debugLog(`[WebSocket] Emitting event: ${event}`, data);
    socketRef.current.emit(event, data);
  }, [connected]);

  return {
    socket: socketRef.current,
    connected,
    subscribe,
    unsubscribe,
    emit,
  };
}

/**
 * Hook to subscribe to specific WebSocket channels
 */
export function useWebSocketSubscriptions(userId?: number) {
  const { socket, connected, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    if (!socket || !connected) return;

    // Subscribe to user-specific notifications
    if (userId) {
      socket.emit('subscribe:user', userId);
    }

    // Subscribe to work orders updates
    socket.emit('subscribe:workOrders');

    // Subscribe to alerts
    socket.emit('subscribe:alerts');

    // Subscribe to inventory updates
    socket.emit('subscribe:inventory');

    return () => {
      // Cleanup subscriptions on unmount
      debugLog('[WebSocket] Cleaning up subscriptions');
    };
  }, [socket, connected, userId]);

  return {
    socket,
    connected,
    subscribe,
    unsubscribe,
  };
}
