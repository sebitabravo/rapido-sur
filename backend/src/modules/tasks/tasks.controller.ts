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
import { TasksService } from "./tasks.service";
import { Tarea } from "./entities/tarea.entity";
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
}
