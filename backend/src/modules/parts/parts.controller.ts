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
import { PartsService } from "./parts.service";
import { Repuesto } from "./entities/repuesto.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for parts endpoints
 * Manages parts inventory and catalog
 */
@ApiTags("Parts")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@Controller("repuestos")
@UseGuards(JwtAuthGuard)
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  /**
   * GET /repuestos
   * List all parts in inventory
   */
  @ApiOperation({
    summary: "Listar todos los repuestos",
    description:
      "Obtiene catálogo completo de repuestos disponibles con información de stock y precios.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de repuestos",
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden ver catálogo completo",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Get()
  async findAll(): Promise<Repuesto[]> {
    return this.partsService.findAll();
  }

  /**
   * GET /repuestos/:id
   * Get a specific part by ID
   */
  @ApiOperation({
    summary: "Obtener repuesto por ID",
    description:
      "Obtiene detalles de un repuesto específico incluyendo código, nombre, precio y stock disponible.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del repuesto" })
  @ApiResponse({
    status: 200,
    description: "Repuesto encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Repuesto no encontrado",
  })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Repuesto> {
    const part = await this.partsService.findOne(id);
    if (!part) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
    return part;
  }

  /**
   * GET /repuestos/codigo/:codigo
   * Get a specific part by code
   */
  @ApiOperation({
    summary: "Obtener repuesto por código",
    description: "Busca un repuesto específico utilizando su código único.",
  })
  @ApiParam({
    name: "codigo",
    type: String,
    description: "Código único del repuesto",
  })
  @ApiResponse({
    status: 200,
    description: "Repuesto encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Repuesto no encontrado",
  })
  @Get("codigo/:codigo")
  async findByCode(@Param("codigo") codigo: string): Promise<Repuesto> {
    const part = await this.partsService.findByCode(codigo);
    if (!part) {
      throw new NotFoundException(`Repuesto con código ${codigo} no encontrado`);
    }
    return part;
  }
}
