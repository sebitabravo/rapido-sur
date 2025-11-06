import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
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
}
