import {
  Controller,
  Get,
  Post,
  Patch,
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
import { WorkOrdersService } from "./work-orders.service";
import { OrdenTrabajo } from "./entities/orden-trabajo.entity";
import { CreateOrdenTrabajoDto } from "./dto/create-orden-trabajo.dto";
import { AsignarMecanicoDto } from "./dto/asignar-mecanico.dto";
import { RegistrarTrabajoDto } from "./dto/registrar-trabajo.dto";
import { FilterOrdenTrabajoDto } from "./dto/filter-orden-trabajo.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RolUsuario } from "../../common/enums";
import { Usuario } from "../users/entities/usuario.entity";

/**
 * Controller for work order endpoints
 * Core of the system - manages complete work order lifecycle
 */
@ApiTags("Work Orders")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@Controller("ordenes-trabajo")
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  /**
   * POST /ordenes-trabajo
   * Create new work order (Admin and Maintenance Manager only)
   */
  @ApiOperation({
    summary: "Crear nueva orden de trabajo",
    description:
      "Crea una orden de trabajo con número auto-generado (OT-YYYY-NNNNN). Solo Administrador y Jefe de Mantenimiento pueden crear órdenes.",
  })
  @ApiBody({
    type: CreateOrdenTrabajoDto,
    examples: {
      preventivo: {
        summary: "Orden de Trabajo Preventiva",
        value: {
          vehiculo_id: 1,
          tipo: "Preventivo",
          descripcion: "Mantenimiento preventivo 10.000 km",
        },
      },
      correctivo: {
        summary: "Orden de Trabajo Correctiva",
        value: {
          vehiculo_id: 2,
          tipo: "Correctivo",
          descripcion: "Reparación de frenos traseros",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Orden de trabajo creada exitosamente",
    schema: {
      example: {
        id: 1,
        numero_ot: "OT-2025-00001",
        vehiculo_id: 1,
        tipo: "Preventivo",
        estado: "Pendiente",
        descripcion: "Mantenimiento preventivo 10.000 km",
        fecha_creacion: "2025-01-15T10:00:00.000Z",
        created_at: "2025-01-15T10:00:00.000Z",
        updated_at: "2025-01-15T10:00:00.000Z",
      },
    },
  })
  @ApiForbiddenResponse({
    description: "No tienes permisos. Solo Administrador y Jefe pueden crear OT.",
  })
  @ApiBadRequestResponse({
    description: "Datos inválidos (vehículo no existe, tipo inválido, etc.)",
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async create(
    @Body() createDto: CreateOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    return this.workOrdersService.create(createDto);
  }

  /**
   * GET /ordenes-trabajo
   * List all work orders with filters
   */
  @ApiOperation({
    summary: "Listar órdenes de trabajo",
    description:
      "Obtiene todas las órdenes de trabajo con filtros opcionales (vehículo, estado, tipo, fechas, mecánico).",
  })
  @ApiQuery({ name: "vehiculo_id", required: false, type: Number })
  @ApiQuery({ name: "estado", required: false, enum: ["Pendiente", "Asignada", "EnProgreso", "Finalizada"] })
  @ApiQuery({ name: "tipo", required: false, enum: ["Preventivo", "Correctivo"] })
  @ApiQuery({ name: "fecha_inicio", required: false, type: String })
  @ApiQuery({ name: "fecha_fin", required: false, type: String })
  @ApiQuery({ name: "mecanico_id", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Lista de órdenes de trabajo",
    isArray: true,
  })
  @Get()
  async findAll(
    @Query() filters: FilterOrdenTrabajoDto,
  ): Promise<OrdenTrabajo[]> {
    return this.workOrdersService.findAll(filters);
  }

  /**
   * GET /ordenes-trabajo/:id
   * Get single work order with full details
   */
  @ApiOperation({
    summary: "Obtener orden de trabajo por ID",
    description: "Obtiene una orden de trabajo específica con todos sus detalles, tareas y repuestos.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la orden de trabajo" })
  @ApiResponse({
    status: 200,
    description: "Orden de trabajo encontrada",
  })
  @ApiNotFoundResponse({ description: "Orden de trabajo no encontrada" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<OrdenTrabajo> {
    return this.workOrdersService.findOne(id);
  }

  /**
   * PATCH /ordenes-trabajo/:id/estado
   * Update work order status (Admin and Maintenance Manager only)
   */
  @ApiOperation({
    summary: "Actualizar estado de orden de trabajo",
    description:
      "Actualiza el estado de una orden de trabajo. Solo Admin y Jefe de Mantenimiento.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID de la orden de trabajo",
  })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({
    status: 200,
    description: "Estado actualizado exitosamente",
  })
  @ApiForbiddenResponse({
    description: "No tienes permisos para actualizar estados",
  })
  @ApiNotFoundResponse({ description: "Orden de trabajo no encontrada" })
  @Patch(":id/estado")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ): Promise<OrdenTrabajo> {
    return this.workOrdersService.updateStatus(id, dto.estado);
  }

  /**
   * PATCH /ordenes-trabajo/:id/asignar
   * Assign mechanic to work order (Admin and Maintenance Manager only)
   */
  @ApiOperation({
    summary: "Asignar mecánico a orden de trabajo",
    description: "Asigna un mecánico a la orden y cambia el estado a 'Asignada'. Solo Jefe y Admin.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la orden de trabajo" })
  @ApiBody({ type: AsignarMecanicoDto })
  @ApiResponse({
    status: 200,
    description: "Mecánico asignado exitosamente",
  })
  @ApiForbiddenResponse({ description: "No tienes permisos para asignar mecánicos" })
  @ApiNotFoundResponse({ description: "Orden de trabajo o mecánico no encontrado" })
  @Patch(":id/asignar")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async asignarMecanico(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AsignarMecanicoDto,
  ): Promise<OrdenTrabajo> {
    return this.workOrdersService.asignarMecanico(id, dto);
  }

  /**
   * PATCH /ordenes-trabajo/:id/registrar-trabajo
   * Register work on work order (Mechanic and Maintenance Manager)
   */
  @ApiOperation({
    summary: "Registrar trabajo realizado",
    description:
      "Registra repuestos usados, kilometraje actualizado y observaciones. Descuenta stock de repuestos. Solo mecánico asignado o Jefe.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la orden de trabajo" })
  @ApiBody({
    type: RegistrarTrabajoDto,
    examples: {
      ejemplo1: {
        summary: "Registrar trabajo completo",
        value: {
          repuestos: [
            { repuesto_id: 1, cantidad: 2, tarea_id: 1 },
            { repuesto_id: 3, cantidad: 4, tarea_id: 1 },
          ],
          kilometraje_actual: 15500,
          observaciones: "Trabajo completado sin inconvenientes",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Trabajo registrado exitosamente",
  })
  @ApiForbiddenResponse({ description: "No tienes permisos para registrar trabajo en esta OT" })
  @ApiBadRequestResponse({ description: "Stock insuficiente o datos inválidos" })
  @Patch(":id/registrar-trabajo")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Mecanico, RolUsuario.JefeMantenimiento)
  async registrarTrabajo(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: RegistrarTrabajoDto,
    @CurrentUser() user: Usuario,
  ): Promise<OrdenTrabajo> {
    return this.workOrdersService.registrarTrabajo(id, dto, user);
  }

  /**
   * PATCH /ordenes-trabajo/:id/cerrar
   * Close work order (Admin and Maintenance Manager only)
   */
  @ApiOperation({
    summary: "Cerrar orden de trabajo",
    description:
      "Cierra la orden, valida que todas las tareas estén completadas, calcula costo total, actualiza fecha de última revisión del vehículo y recalcula próximo mantenimiento preventivo.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la orden de trabajo" })
  @ApiResponse({
    status: 200,
    description: "Orden de trabajo cerrada exitosamente",
    schema: {
      example: {
        id: 1,
        numero_ot: "OT-2025-00001",
        estado: "Finalizada",
        fecha_cierre: "2025-01-20T10:00:00.000Z",
        costo_total: 125000,
      },
    },
  })
  @ApiForbiddenResponse({ description: "No tienes permisos para cerrar OT" })
  @ApiBadRequestResponse({ description: "No se puede cerrar: hay tareas incompletas" })
  @ApiNotFoundResponse({ description: "Orden de trabajo no encontrada" })
  @Patch(":id/cerrar")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async cerrar(@Param("id", ParseIntPipe) id: number): Promise<OrdenTrabajo> {
    return this.workOrdersService.cerrar(id);
  }
}
