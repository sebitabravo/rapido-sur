import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * WebSocket Gateway for real-time notifications
 * Handles connections and broadcasts events to connected clients
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/events",
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Called when WebSocket server is initialized
   */
  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);

    // Send welcome message
    client.emit("connected", {
      message: "Connected to Rápido Sur WebSocket Server",
      clientId: client.id,
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
  }

  /**
   * Subscribe to user-specific channel
   * Allows targeting notifications to specific users
   */
  @SubscribeMessage("subscribe:user")
  handleUserSubscription(client: Socket, userId: number) {
    const room = `user:${userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: "subscribed", room };
  }

  /**
   * Subscribe to work order updates
   */
  @SubscribeMessage("subscribe:workOrders")
  handleWorkOrderSubscription(client: Socket) {
    client.join("workOrders");
    this.logger.log(`Client ${client.id} joined room: workOrders`);
    return { event: "subscribed", room: "workOrders" };
  }

  /**
   * Subscribe to alerts
   */
  @SubscribeMessage("subscribe:alerts")
  handleAlertsSubscription(client: Socket) {
    client.join("alerts");
    this.logger.log(`Client ${client.id} joined room: alerts`);
    return { event: "subscribed", room: "alerts" };
  }

  /**
   * Subscribe to inventory updates
   */
  @SubscribeMessage("subscribe:inventory")
  handleInventorySubscription(client: Socket) {
    client.join("inventory");
    this.logger.log(`Client ${client.id} joined room: inventory`);
    return { event: "subscribed", room: "inventory" };
  }

  // ==================== Event Emitters ====================

  /**
   * Emit work order created event
   */
  emitWorkOrderCreated(data: {
    id: number;
    numero_ot: string;
    tipo: string;
    vehiculo: { patente: string; marca: string; modelo: string };
    mecanico?: { id: number; nombre_completo: string };
  }) {
    this.server.to("workOrders").emit("workOrder:created", data);

    // Also notify assigned mechanic if any
    if (data.mecanico) {
      this.server
        .to(`user:${data.mecanico.id}`)
        .emit("workOrder:assigned", data);
    }

    this.logger.log(`Emitted workOrder:created event for OT: ${data.numero_ot}`);
  }

  /**
   * Emit work order status changed event
   */
  emitWorkOrderStatusChanged(data: {
    id: number;
    numero_ot: string;
    nuevo_estado: string;
    estado_anterior: string;
    vehiculo: { patente: string };
    mecanico?: { id: number };
  }) {
    this.server.to("workOrders").emit("workOrder:statusChanged", data);

    // Notify assigned mechanic
    if (data.mecanico) {
      this.server
        .to(`user:${data.mecanico.id}`)
        .emit("workOrder:statusChanged", data);
    }

    this.logger.log(
      `Emitted workOrder:statusChanged event for OT: ${data.numero_ot}`,
    );
  }

  /**
   * Emit work order completed event
   */
  emitWorkOrderCompleted(data: {
    id: number;
    numero_ot: string;
    vehiculo: { patente: string };
    mecanico: { id: number; nombre_completo: string };
  }) {
    this.server.to("workOrders").emit("workOrder:completed", data);

    this.logger.log(
      `Emitted workOrder:completed event for OT: ${data.numero_ot}`,
    );
  }

  /**
   * Emit new alert created event
   */
  emitAlertCreated(data: {
    id: number;
    tipo: string;
    mensaje: string;
    vehiculo: { patente: string; marca: string; modelo: string };
  }) {
    this.server.to("alerts").emit("alert:created", data);

    this.logger.log(`Emitted alert:created event for vehicle: ${data.vehiculo.patente}`);
  }

  /**
   * Emit low stock alert event
   */
  emitLowStockAlert(data: {
    parts: Array<{
      codigo: string;
      nombre: string;
      cantidad_stock: number;
      stock_minimo: number;
    }>;
    totalParts: number;
  }) {
    this.server.to("inventory").emit("inventory:lowStock", data);

    this.logger.log(
      `Emitted inventory:lowStock event for ${data.totalParts} parts`,
    );
  }

  /**
   * Emit task completed event
   */
  emitTaskCompleted(data: {
    id: number;
    descripcion: string;
    orden_trabajo: {
      id: number;
      numero_ot: string;
    };
    mecanico: { id: number; nombre_completo: string };
  }) {
    this.server.to("workOrders").emit("task:completed", data);

    this.logger.log(
      `Emitted task:completed event for task ${data.id} in OT: ${data.orden_trabajo.numero_ot}`,
    );
  }

  /**
   * Emit generic notification to specific user
   */
  emitUserNotification(
    userId: number,
    notification: {
      type: "info" | "success" | "warning" | "error";
      title: string;
      message: string;
      data?: any;
    },
  ) {
    this.server.to(`user:${userId}`).emit("notification", notification);

    this.logger.log(`Emitted notification to user ${userId}: ${notification.title}`);
  }

  /**
   * Emit broadcast notification to all connected clients
   */
  emitBroadcastNotification(notification: {
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    data?: any;
  }) {
    this.server.emit("notification", notification);

    this.logger.log(`Emitted broadcast notification: ${notification.title}`);
  }
}
