import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
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
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { PreventivePlansService } from "./preventive-plans.service";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";
import { CreatePlanPreventivoDto } from "./dto/create-plan-preventivo.dto";
import { UpdatePlanPreventivoDto } from "./dto/update-plan-preventivo.dto";
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

  /**
   * POST /planes-preventivos
   * Create new preventive plan
   */
  @ApiOperation({
    summary: "Crear nuevo plan preventivo",
    description:
      "Crea un plan de mantenimiento preventivo para un vehículo. Solo un plan activo por vehículo.",
  })
  @ApiBody({
    type: CreatePlanPreventivoDto,
    examples: {
      porKilometraje: {
        summary: "Plan por Kilometraje",
        value: {
          vehiculo_id: 1,
          tipo_mantenimiento: "Mantenimiento general",
          tipo_intervalo: "KM",
          intervalo: 10000,
          descripcion:
            "Cambio de aceite, filtros, revisión de frenos cada 10,000 km",
          proximo_kilometraje: 25000,
          activo: true,
        },
      },
      porTiempo: {
        summary: "Plan por Tiempo",
        value: {
          vehiculo_id: 2,
          tipo_mantenimiento: "Revisión técnica",
          tipo_intervalo: "Tiempo",
          intervalo: 180,
          descripcion: "Revisión técnica obligatoria cada 6 meses",
          proxima_fecha: "2025-06-01",
          activo: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Plan preventivo creado exitosamente",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden crear planes",
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async create(
    @Body() createDto: CreatePlanPreventivoDto,
  ): Promise<PlanPreventivo> {
    return this.preventivePlansService.create(createDto);
  }

  /**
   * PATCH /planes-preventivos/:id
   * Update existing preventive plan
   */
  @ApiOperation({
    summary: "Actualizar plan preventivo",
    description: "Actualiza un plan de mantenimiento preventivo existente.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID del plan preventivo",
  })
  @ApiBody({ type: UpdatePlanPreventivoDto })
  @ApiResponse({
    status: 200,
    description: "Plan preventivo actualizado exitosamente",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden actualizar planes",
  })
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdatePlanPreventivoDto,
  ): Promise<PlanPreventivo> {
    return this.preventivePlansService.update(id, updateDto);
  }

  /**
   * DELETE /planes-preventivos/:id
   * Deactivate preventive plan
   */
  @ApiOperation({
    summary: "Desactivar plan preventivo",
    description: "Desactiva un plan de mantenimiento preventivo (soft delete).",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID del plan preventivo",
  })
  @ApiResponse({
    status: 200,
    description: "Plan preventivo desactivado exitosamente",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden desactivar planes",
  })
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.preventivePlansService.remove(id);
  }

  /**
   * GET /planes-preventivos/vehiculo/:vehiculoId
   * Get preventive plan by vehicle
   */
  @ApiOperation({
    summary: "Obtener plan preventivo por vehículo",
    description: "Obtiene el plan de mantenimiento de un vehículo específico.",
  })
  @ApiParam({
    name: "vehiculoId",
    type: Number,
    description: "ID del vehículo",
  })
  @ApiResponse({
    status: 200,
    description: "Plan preventivo encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Plan no encontrado",
  })
  @Get("vehiculo/:vehiculoId")
  async findByVehiculo(
    @Param("vehiculoId", ParseIntPipe) vehiculoId: number,
  ): Promise<PlanPreventivo> {
    const plan =
      await this.preventivePlansService.findByVehiculo(vehiculoId);
    if (!plan) {
      throw new NotFoundException(
        `No se encontró plan preventivo para el vehículo con ID ${vehiculoId}`,
      );
    }
    return plan;
  }
}
