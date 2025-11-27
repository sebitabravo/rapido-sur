import { Controller, Get, Post, Delete, Patch, Param, ParseIntPipe, UseGuards, Body, Request, NotFoundException } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { AlertsService } from "./alerts.service";
import { Alerta } from "./entities/alerta.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Usuario } from "../users/entities/usuario.entity";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for alert endpoints
 * System automatically generates preventive maintenance alerts
 */
@ApiTags("Alerts")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@SkipThrottle() // Dashboard loads alerts frequently, skip rate limiting
@Controller("alertas")
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * GET /alertas
   * List all preventive alerts (Admin and Jefe only)
   */
  @ApiOperation({
    summary: "Listar todas las alertas preventivas",
    description:
      "Obtiene lista de alertas generadas automáticamente por el sistema (alertas de mantenimiento preventivo por kilometraje o tiempo).",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de alertas preventivas",
    isArray: true,
  })
  @ApiForbiddenResponse({ description: "Solo Admin y Jefe pueden ver alertas" })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Get()
  async findAll(): Promise<Alerta[]> {
    return this.alertsService.findAll();
  }

  /**
   * GET /alertas/pendientes
   * Get pending alerts (not acknowledged)
   */
  @ApiOperation({
    summary: "Obtener alertas pendientes",
    description: "Obtiene solo las alertas que aún no han sido atendidas (email_enviado = true pero sin OT creada).",
  })
  @ApiResponse({
    status: 200,
    description: "Alertas pendientes de atención",
    isArray: true,
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Get("pendientes")
  async getPendientes(): Promise<Alerta[]> {
    return this.alertsService.findPendientes();
  }

  /**
   * GET /alertas/vehiculo/:vehiculoId
   * Get alerts by vehicle
   */
  @ApiOperation({
    summary: "Obtener alertas de un vehículo específico",
    description: "Obtiene historial de alertas preventivas de un vehículo.",
  })
  @ApiParam({ name: "vehiculoId", type: Number, description: "ID del vehículo" })
  @ApiResponse({
    status: 200,
    description: "Alertas del vehículo",
    isArray: true,
  })
  @Get("vehiculo/:vehiculoId")
  async getByVehiculo(
    @Param("vehiculoId", ParseIntPipe) vehiculoId: number,
  ): Promise<Alerta[]> {
    return this.alertsService.findByVehiculo(vehiculoId);
  }

  /**
   * POST /alertas/verificar-ahora
   * Manually trigger alert verification (for MVP testing)
   */
  @ApiOperation({
    summary: "Verificar alertas manualmente",
    description: 
      "Ejecuta la verificación de alertas preventivas de forma manual. " +
      "Útil para MVP, testing y demos. Normalmente se ejecuta automáticamente a las 6 AM.",
  })
  @ApiResponse({
    status: 200,
    description: "Verificación ejecutada correctamente",
    schema: {
      example: {
        message: "Verificación de alertas ejecutada",
        alertasGeneradas: 3,
      },
    },
  })
  @ApiForbiddenResponse({ description: "Solo Admin y Jefe pueden verificar alertas" })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Post("verificar-ahora")
  async verificarAhora() {
    const count = await this.alertsService.verificarAlertasPreventivas();
    return {
      message: "Verificación de alertas ejecutada correctamente",
      alertasGeneradas: count,
    };
  }

  /**
   * POST /alertas/crear-prueba
   * Create test alerts for MVP demonstration
   */
  @ApiOperation({
    summary: "Crear alertas de prueba",
    description:
      "Crea alertas de prueba para demostración del MVP. " +
      "Permite especificar patente del vehículo o crear alertas para todos los vehículos activos.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        patente: {
          type: "string",
          description: "Patente del vehículo (opcional). Si no se proporciona, crea alertas para todos.",
          example: "ABC123",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Alertas de prueba creadas",
    schema: {
      example: {
        message: "Alertas de prueba creadas",
        alertas: [
          {
            id: 1,
            tipo_alerta: "Kilometraje",
            mensaje: "ABC123 - Toyota Corolla: Mantenimiento en 500 km",
          },
        ],
      },
    },
  })
  @ApiForbiddenResponse({ description: "Solo Admin puede crear alertas de prueba" })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador)
  @Post("crear-prueba")
  async crearAlertasPrueba(@Body() body: { patente?: string }) {
    const alertas = await this.alertsService.crearAlertasPrueba(body.patente);
    return {
      message: "Alertas de prueba creadas correctamente",
      alertas,
    };
  }

  /**
   * PATCH /alertas/:id/descartar
   * Dismiss an alert (mark as false alarm)
   */
  @ApiOperation({
    summary: "Descartar una alerta",
    description:
      "Marca una alerta como descartada (falsa alarma). " +
      "La alerta cambia al estado 'Descartada' y se registra quién la descartó y la razón.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la alerta" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        razon: {
          type: "string",
          description: "Razón por la cual se descarta la alerta",
          example: "Falsa alarma - vehículo recién mantenido",
        },
      },
      required: ["razon"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Alerta descartada correctamente",
    schema: {
      example: {
        message: "Alerta descartada correctamente",
        alerta: {
          id: 1,
          estado: "Descartada",
          razon_descarte: "Falsa alarma - vehículo recién mantenido",
          fecha_descarte: "2025-01-05T10:30:00Z",
        },
      },
    },
  })
  @ApiForbiddenResponse({ description: "Solo Admin y Jefe pueden descartar alertas" })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Patch(":id/descartar")
  async descartarAlerta(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { razon: string },
    @CurrentUser() usuario: Usuario,
  ) {
    const alerta = await this.alertsService.descartarAlerta(id, body.razon, usuario);
    return {
      message: "Alerta descartada correctamente",
      alerta,
    };
  }

  /**
   * POST /alertas/:id/crear-orden-trabajo
   * Create a work order directly from an alert
   */
  @ApiOperation({
    summary: "Crear orden de trabajo desde alerta",
    description:
      "Crea una orden de trabajo de tipo Preventivo directamente desde una alerta. " +
      "La alerta se vincula automáticamente a la OT y cambia al estado 'EnProceso'.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la alerta" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        descripcion: {
          type: "string",
          description: "Descripción adicional para la orden de trabajo",
          example: "Mantenimiento preventivo según plan",
        },
        prioridad: {
          type: "string",
          enum: ["ALTA", "MEDIA", "BAJA"],
          description: "Prioridad de la orden",
          example: "MEDIA",
        },
      },
      required: ["prioridad"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Orden de trabajo creada correctamente",
    schema: {
      example: {
        message: "Orden de trabajo creada desde alerta",
        ordenTrabajo: {
          id: 42,
          numero_ot: "OT-2025-00042",
          tipo: "Preventivo",
          estado: "Pendiente",
        },
      },
    },
  })
  @ApiForbiddenResponse({ description: "Solo Admin y Jefe pueden crear órdenes de trabajo" })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Post(":id/crear-orden-trabajo")
  async crearOrdenTrabajoDesdeAlerta(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { descripcion?: string; prioridad: string },
  ) {
    const ordenTrabajo = await this.alertsService.crearOrdenTrabajoDesdeAlerta(
      id,
      body.descripcion,
      body.prioridad,
    );
    return {
      message: "Orden de trabajo creada desde alerta",
      ordenTrabajo,
    };
  }

  /**
   * GET /alertas/:id
   * Get a single alert with full details
   */
  @ApiOperation({
    summary: "Obtener detalle de una alerta",
    description: "Obtiene información completa de una alerta específica incluyendo vehículo, plan preventivo y orden de trabajo asociada.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la alerta" })
  @ApiResponse({
    status: 200,
    description: "Detalle de la alerta",
  })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Alerta> {
    const alerta = await this.alertsService.findOne(id);
    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return alerta;
  }
}
