import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Body } from "@nestjs/common";
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
}
