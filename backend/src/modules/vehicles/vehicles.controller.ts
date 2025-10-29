import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { VehiclesService } from "./vehicles.service";
import { Vehiculo } from "./entities/vehiculo.entity";
import { CreateVehiculoDto } from "./dto/create-vehiculo.dto";
import { UpdateVehiculoDto } from "./dto/update-vehiculo.dto";
import { FilterVehiculoDto } from "./dto/filter-vehiculo.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for vehicle endpoints
 */
@ApiTags("Vehicles")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@Controller("vehiculos")
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * POST /vehiculos
   * Create new vehicle (Admin and Maintenance Manager only)
   */
  @ApiOperation({
    summary: "Crear nuevo vehículo",
    description:
      "Registra un nuevo vehículo en la flota con validación de patente chilena. Solo Administrador y Jefe de Mantenimiento.",
  })
  @ApiBody({
    type: CreateVehiculoDto,
    examples: {
      bus: {
        summary: "Registrar Bus",
        value: {
          patente: "ABCD12",
          marca: "Mercedes-Benz",
          modelo: "Citaro",
          anno: 2023,
          kilometraje_actual: 5000,
        },
      },
      van: {
        summary: "Registrar Van",
        value: {
          patente: "XY1234",
          marca: "Volkswagen",
          modelo: "Crafter",
          anno: 2022,
          kilometraje_actual: 12000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Vehículo creado exitosamente",
    schema: {
      example: {
        id: 1,
        patente: "ABCD12",
        marca: "Mercedes-Benz",
        modelo: "Citaro",
        anno: 2023,
        kilometraje_actual: 5000,
        estado: "Activo",
        created_at: "2025-01-15T10:00:00.000Z",
        updated_at: "2025-01-15T10:00:00.000Z",
      },
    },
  })
  @ApiForbiddenResponse({ description: "No tienes permisos para crear vehículos" })
  @ApiBadRequestResponse({ description: "Datos inválidos (patente duplicada, formato incorrecto)" })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async create(@Body() createDto: CreateVehiculoDto): Promise<Vehiculo> {
    return this.vehiclesService.create(createDto);
  }

  /**
   * GET /vehiculos
   * List all vehicles with pagination and filters
   */
  @ApiOperation({
    summary: "Listar vehículos",
    description: "Obtiene lista paginada de vehículos con filtros opcionales (estado, marca, patente).",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "estado", required: false, enum: ["Activo", "EnMantenimiento", "Inactivo"] })
  @ApiQuery({ name: "marca", required: false, type: String })
  @ApiQuery({ name: "patente", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Lista de vehículos con paginación",
    schema: {
      example: {
        items: [
          {
            id: 1,
            patente: "ABCD12",
            marca: "Mercedes-Benz",
            modelo: "Citaro",
            anno: 2023,
            kilometraje_actual: 5000,
            estado: "Activo",
          },
        ],
        total: 45,
        page: 1,
        lastPage: 5,
      },
    },
  })
  @Get()
  async findAll(@Query() filters: FilterVehiculoDto): Promise<{
    items: Vehiculo[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    return this.vehiclesService.findAll(filters);
  }

  /**
   * GET /vehiculos/:id
   * Get single vehicle with relations
   */
  @ApiOperation({
    summary: "Obtener vehículo por ID",
    description: "Obtiene un vehículo específico con sus relaciones (plan preventivo, órdenes de trabajo).",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del vehículo" })
  @ApiResponse({
    status: 200,
    description: "Vehículo encontrado",
  })
  @ApiNotFoundResponse({ description: "Vehículo no encontrado" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Vehiculo> {
    return this.vehiclesService.findOne(id);
  }

  /**
   * GET /vehiculos/:id/historial
   * Get complete vehicle history with cost and downtime calculations
   */
  @ApiOperation({
    summary: "Obtener historial del vehículo",
    description:
      "Obtiene el historial completo de mantenimiento del vehículo con cálculos de costos totales y tiempos de inactividad.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del vehículo" })
  @ApiResponse({
    status: 200,
    description: "Historial del vehículo",
    schema: {
      example: {
        vehiculo: {
          id: 1,
          patente: "ABCD12",
          marca: "Mercedes-Benz",
          modelo: "Citaro",
        },
        estadisticas: {
          total_ordenes: 15,
          costo_total: 2500000,
          dias_inactividad: 25,
          ultima_revision: "2025-01-10T00:00:00.000Z",
        },
        ordenes: [],
      },
    },
  })
  @ApiNotFoundResponse({ description: "Vehículo no encontrado" })
  @Get(":id/historial")
  async getHistorial(@Param("id", ParseIntPipe) id: number) {
    return this.vehiclesService.getHistorial(id);
  }

  /**
   * PATCH /vehiculos/:id
   * Update vehicle (Admin and Maintenance Manager only)
   */
  @ApiOperation({
    summary: "Actualizar vehículo",
    description: "Actualiza datos del vehículo (marca, modelo, kilometraje, estado). Solo Admin y Jefe.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del vehículo" })
  @ApiBody({ type: UpdateVehiculoDto })
  @ApiResponse({
    status: 200,
    description: "Vehículo actualizado exitosamente",
  })
  @ApiForbiddenResponse({ description: "No tienes permisos para actualizar vehículos" })
  @ApiNotFoundResponse({ description: "Vehículo no encontrado" })
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateVehiculoDto,
  ): Promise<Vehiculo> {
    return this.vehiclesService.update(id, updateDto);
  }

  /**
   * DELETE /vehiculos/:id
   * Soft delete vehicle (Admin only)
   */
  @ApiOperation({
    summary: "Desactivar vehículo (soft delete)",
    description:
      "Marca el vehículo como inactivo sin eliminarlo de la base de datos. Solo Administrador.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del vehículo" })
  @ApiResponse({
    status: 200,
    description: "Vehículo desactivado correctamente",
    schema: {
      example: {
        message: "Vehículo desactivado correctamente",
      },
    },
  })
  @ApiForbiddenResponse({ description: "Solo Administradores pueden desactivar vehículos" })
  @ApiNotFoundResponse({ description: "Vehículo no encontrado" })
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador)
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.vehiclesService.remove(id);
    return { message: "Vehículo desactivado correctamente" };
  }
}
