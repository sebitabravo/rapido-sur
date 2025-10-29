import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { PreventivePlansService } from "./preventive-plans.service";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for preventive plan endpoints
 * Manages preventive maintenance plans for vehicles
 */
@ApiTags("Preventive Plans")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@Controller("planes-preventivos")
@UseGuards(JwtAuthGuard)
export class PreventivePlansController {
  constructor(
    private readonly preventivePlansService: PreventivePlansService,
  ) {}

  /**
   * GET /planes-preventivos
   * List all preventive maintenance plans
   */
  @ApiOperation({
    summary: "Listar todos los planes preventivos",
    description:
      "Obtiene lista completa de planes de mantenimiento preventivo configurados en el sistema con información del vehículo asociado.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de planes preventivos",
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden ver planes",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Get()
  async findAll(): Promise<PlanPreventivo[]> {
    return this.preventivePlansService.findAll();
  }

  /**
   * GET /planes-preventivos/:id
   * Get a specific preventive plan by ID
   */
  @ApiOperation({
    summary: "Obtener plan preventivo por ID",
    description:
      "Obtiene detalles completos de un plan preventivo específico incluyendo intervalos y próximas fechas de mantenimiento.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del plan preventivo" })
  @ApiResponse({
    status: 200,
    description: "Plan preventivo encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Plan preventivo no encontrado",
  })
  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PlanPreventivo> {
    const plan = await this.preventivePlansService.findOne(id);
    if (!plan) {
      throw new NotFoundException(
        `Plan preventivo con ID ${id} no encontrado`,
      );
    }
    return plan;
  }
}
