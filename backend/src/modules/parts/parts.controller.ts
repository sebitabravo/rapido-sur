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
  HttpCode,
  HttpStatus,
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
import { PartsService } from "./parts.service";
import { Repuesto } from "./entities/repuesto.entity";
import { CreateRepuestoDto } from "./dto/create-repuesto.dto";
import { UpdateRepuestoDto } from "./dto/update-repuesto.dto";
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

  /**
   * POST /repuestos
   * Create a new part in inventory
   */
  @ApiOperation({
    summary: "Crear nuevo repuesto",
    description:
      "Agrega un nuevo repuesto al catálogo de inventario con código único, precio y stock inicial.",
  })
  @ApiBody({ type: CreateRepuestoDto })
  @ApiResponse({
    status: 201,
    description: "Repuesto creado exitosamente",
    type: Repuesto,
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o código duplicado",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden crear repuestos",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Post()
  async create(@Body() createDto: CreateRepuestoDto): Promise<Repuesto> {
    return this.partsService.create(createDto);
  }

  /**
   * PATCH /repuestos/:id
   * Update an existing part
   */
  @ApiOperation({
    summary: "Actualizar repuesto",
    description:
      "Actualiza información de un repuesto existente como precio, stock o descripción.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del repuesto" })
  @ApiBody({ type: UpdateRepuestoDto })
  @ApiResponse({
    status: 200,
    description: "Repuesto actualizado exitosamente",
    type: Repuesto,
  })
  @ApiResponse({
    status: 404,
    description: "Repuesto no encontrado",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden actualizar repuestos",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateRepuestoDto,
  ): Promise<Repuesto> {
    return this.partsService.update(id, updateDto);
  }

  /**
   * DELETE /repuestos/:id
   * Remove a part from inventory (soft delete by setting stock to 0)
   */
  @ApiOperation({
    summary: "Eliminar repuesto",
    description:
      "Desactiva un repuesto del catálogo estableciendo su stock en 0. Solo se permite si no está siendo utilizado en tareas.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del repuesto" })
  @ApiResponse({
    status: 200,
    description: "Repuesto desactivado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Repuesto no encontrado",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin puede eliminar repuestos",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador)
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number): Promise<Repuesto> {
    // Soft delete by setting stock to 0
    return this.partsService.update(id, { cantidad_stock: 0 });
  }
}
