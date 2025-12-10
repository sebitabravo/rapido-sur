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
import { InventoryAlertsService } from "./inventory-alerts.service";
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
  constructor(
    private readonly partsService: PartsService,
    private readonly inventoryAlertsService: InventoryAlertsService,
  ) { }

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
    description: "Solo usuarios autenticados pueden ver el catálogo",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento, RolUsuario.Mecanico)
  @Get()
  async findAll(): Promise<Repuesto[]> {
    return this.partsService.findAll();
  }

  /**
   * GET /repuestos/stock-bajo
   * Get parts with stock below minimum level
   */
  @ApiOperation({
    summary: "Listar repuestos con stock bajo",
    description:
      "Obtiene lista de repuestos cuyo stock actual está por debajo del stock mínimo configurado. Útil para gestión de inventario.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de repuestos con stock bajo",
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden consultar stock bajo",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Get("stock-bajo")
  async getLowStock(): Promise<Repuesto[]> {
    return this.partsService.findBelowMinimumStock();
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
   * PATCH /repuestos/:id/toggle-activo
   * Toggle active status of a part (for double-safety delete flow)
   */
  @ApiOperation({
    summary: "Activar/Desactivar repuesto",
    description:
      "Cambia el estado activo de un repuesto. Un repuesto debe ser desactivado antes de poder eliminarlo.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del repuesto" })
  @ApiResponse({
    status: 200,
    description: "Estado de repuesto cambiado",
    type: Repuesto,
  })
  @ApiResponse({
    status: 404,
    description: "Repuesto no encontrado",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden cambiar estado de repuestos",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @Patch(":id/toggle-activo")
  async toggleActive(@Param("id", ParseIntPipe) id: number): Promise<Repuesto> {
    return this.partsService.toggleActive(id);
  }

  /**
   * DELETE /repuestos/:id
   * Remove a part from inventory (soft delete)
   * SECURITY: Part must be deactivated first
   */
  @ApiOperation({
    summary: "Eliminar repuesto",
    description:
      "Elimina un repuesto del catálogo. El repuesto debe estar DESACTIVADO antes de poder eliminarlo (doble factor de seguridad).",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del repuesto" })
  @ApiResponse({
    status: 200,
    description: "Repuesto eliminado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "El repuesto debe ser desactivado antes de eliminarlo",
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
  async remove(@Param("id", ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.partsService.softDelete(id);
    return { message: "Repuesto eliminado exitosamente" };
  }

  /**
   * POST /repuestos/verificar-stock-ahora
   * Manually trigger low stock check and send alert email
   */
  @ApiOperation({
    summary: "Verificar stock bajo ahora",
    description:
      "Ejecuta manualmente la verificación de stock bajo y envía alerta por email si hay repuestos que requieren reabastecimiento.",
  })
  @ApiResponse({
    status: 200,
    description: "Verificación completada",
  })
  @ApiForbiddenResponse({
    description: "Solo Admin y Jefe pueden verificar stock",
  })
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  @HttpCode(HttpStatus.OK)
  @Post("verificar-stock-ahora")
  async checkLowStockNow(): Promise<{
    partsFound: number;
    alertSent: boolean;
    emailsSent: number;
    parts: Array<{
      codigo: string;
      nombre: string;
      cantidad_stock: number;
      stock_minimo: number;
    }>;
  }> {
    return this.inventoryAlertsService.checkNow();
  }
}

