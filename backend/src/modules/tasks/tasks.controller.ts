import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  Request,
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
import { TasksService } from "./tasks.service";
import { Tarea } from "./entities/tarea.entity";
import { CreateTareaDto } from "./dto/create-tarea.dto";
import { UpdateTareaDto } from "./dto/update-tarea.dto";
import { MarkCompletedDto } from "./dto/mark-completed.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for task endpoints
 * Manages tasks within work orders
 */
@ApiTags("Tasks")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@Controller("tareas")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /tareas
   * List all tasks across all work orders
   */
  @ApiOperation({
    summary: "Listar todas las tareas",
    description:
      "Obtiene lista completa de tareas registradas en el sistema con información de OT y mecánico asignado.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de tareas",
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden ver todas las tareas",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Get()
  async findAll(): Promise<Tarea[]> {
    return this.tasksService.findAll();
  }

  /**
   * POST /tareas
   * Create a new task
   */
  @ApiOperation({
    summary: "Crear nueva tarea",
    description: "Crea una nueva tarea dentro de una orden de trabajo",
  })
  @ApiBody({ type: CreateTareaDto })
  @ApiResponse({ status: 201, description: "Tarea creada exitosamente" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 404, description: "Orden de trabajo no encontrada" })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Post()
  async create(@Body() createDto: CreateTareaDto): Promise<Tarea> {
    return this.tasksService.create(createDto);
  }

  /**
   * GET /tareas/orden-trabajo/:ordenTrabajoId
   * Get all tasks for a specific work order
   */
  @ApiOperation({
    summary: "Obtener tareas de una orden de trabajo",
    description:
      "Obtiene todas las tareas asociadas a una orden de trabajo específica.",
  })
  @ApiParam({
    name: "ordenTrabajoId",
    type: Number,
    description: "ID de la orden de trabajo",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de tareas de la orden de trabajo",
    isArray: true,
  })
  @Get("orden-trabajo/:ordenTrabajoId")
  async findByWorkOrder(
    @Param("ordenTrabajoId", ParseIntPipe) ordenTrabajoId: number,
  ): Promise<Tarea[]> {
    return this.tasksService.findByWorkOrder(ordenTrabajoId);
  }

  /**
   * GET /tareas/:id
   * Get a specific task by ID
   */
  @ApiOperation({
    summary: "Obtener tarea por ID",
    description:
      "Obtiene detalles completos de una tarea específica incluyendo repuestos utilizados y tiempo invertido.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la tarea" })
  @ApiResponse({
    status: 200,
    description: "Tarea encontrada",
  })
  @ApiResponse({
    status: 404,
    description: "Tarea no encontrada",
  })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Tarea> {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    return task;
  }

  /**
   * PATCH /tareas/:id
   * Update an existing task
   */
  @ApiOperation({
    summary: "Actualizar tarea",
    description: "Actualiza información de una tarea",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la tarea" })
  @ApiBody({ type: UpdateTareaDto })
  @ApiResponse({ status: 200, description: "Tarea actualizada" })
  @ApiResponse({ status: 404, description: "Tarea no encontrada" })
  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateTareaDto,
    @Request() req: any,
  ): Promise<Tarea> {
    return this.tasksService.update(id, updateDto, req.user);
  }

  /**
   * PATCH /tareas/:id/completar
   * Mark a task as completed
   */
  @ApiOperation({
    summary: "Marcar tarea como completada",
    description: "Marca una tarea como completada",
  })
  @ApiParam({ name: "id", type: Number, description: "ID de la tarea" })
  @ApiBody({ type: MarkCompletedDto })
  @ApiResponse({ status: 200, description: "Tarea completada" })
  @ApiResponse({ status: 404, description: "Tarea no encontrada" })
  @Patch(":id/completar")
  async markAsCompleted(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: MarkCompletedDto,
    @Request() req: any,
  ): Promise<Tarea> {
    return this.tasksService.markAsCompleted(id, dto, req.user);
  }
}
