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
  ClassSerializerInterceptor,
  UseInterceptors,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { Usuario } from "./entities/usuario.entity";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for user endpoints
 * Uses ClassSerializerInterceptor to exclude password_hash from responses
 */
@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@Controller("usuarios")
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /usuarios
   * Create new user (Admin only)
   */
  @ApiOperation({
    summary: "Crear nuevo usuario (Solo Administrador)",
    description:
      "Crea un nuevo usuario en el sistema con contraseña encriptada (bcrypt cost 12). Solo Administrador puede crear usuarios.",
  })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({
    status: 201,
    description: "Usuario creado exitosamente",
  })
  @ApiForbiddenResponse({ description: "Solo Administradores pueden crear usuarios" })
  @ApiBadRequestResponse({ description: "Email ya registrado o datos inválidos" })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador)
  async create(@Body() createDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usersService.create(createDto);
  }

  /**
   * GET /usuarios
   * List all users (Admin and Maintenance Manager)
   */
  @ApiOperation({
    summary: "Listar todos los usuarios",
    description: "Obtiene lista completa de usuarios del sistema. Admin y Jefe de Mantenimiento pueden ver.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios (sin password_hash)",
    isArray: true,
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
  async findAll(): Promise<Usuario[]> {
    return this.usersService.findAll();
  }

  /**
   * GET /usuarios/mecanicos
   * List only mechanics (for assigning to work orders)
   */
  @ApiOperation({
    summary: "Listar mecánicos activos",
    description: "Obtiene lista de mecánicos activos para asignar a órdenes de trabajo.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de mecánicos activos",
    isArray: true,
  })
  @Get("mecanicos")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.JefeMantenimiento, RolUsuario.Administrador)
  async getMecanicos(): Promise<Usuario[]> {
    return this.usersService.findByRole(RolUsuario.Mecanico);
  }

  /**
   * GET /usuarios/:id
   * Get single user
   */
  @ApiOperation({
    summary: "Obtener usuario por ID",
    description: "Obtiene información de un usuario específico (sin password_hash).",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Usuario encontrado",
  })
  @ApiNotFoundResponse({ description: "Usuario no encontrado" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Usuario> {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /usuarios/:id
   * Update user (Admin only)
   */
  @ApiOperation({
    summary: "Actualizar usuario (Solo Administrador)",
    description: "Actualiza información del usuario (nombre, email, rol, estado). Solo Admin.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del usuario" })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiResponse({
    status: 200,
    description: "Usuario actualizado exitosamente",
  })
  @ApiForbiddenResponse({ description: "Solo Administradores pueden actualizar usuarios" })
  @ApiNotFoundResponse({ description: "Usuario no encontrado" })
  @ApiBadRequestResponse({ description: "Email ya en uso o datos inválidos" })
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usersService.update(id, updateDto);
  }

  /**
   * PATCH /usuarios/:id/cambiar-password
   * Change user password (Admin or same user)
   */
  @ApiOperation({
    summary: "Cambiar contraseña de usuario",
    description:
      "Cambia la contraseña del usuario. Solo el propio usuario o un Administrador pueden cambiarla.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del usuario" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: "Contraseña actualizada correctamente",
    schema: {
      example: {
        message: "Contraseña actualizada correctamente",
      },
    },
  })
  @ApiForbiddenResponse({ description: "No tienes permiso para cambiar esta contraseña" })
  @ApiNotFoundResponse({ description: "Usuario no encontrado" })
  @Patch(":id/cambiar-password")
  async changePassword(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() currentUser: Usuario,
  ): Promise<{ message: string }> {
    // Only ADMIN or the same user can change password
    if (currentUser.rol !== RolUsuario.Administrador && currentUser.id !== id) {
      throw new ForbiddenException(
        "No tienes permiso para cambiar esta contraseña",
      );
    }

    await this.usersService.changePassword(id, dto.nueva_password);
    return { message: "Contraseña actualizada correctamente" };
  }

  /**
   * DELETE /usuarios/:id
   * Soft delete user (Admin only)
   */
  @ApiOperation({
    summary: "Desactivar usuario (Solo Administrador)",
    description:
      "Marca el usuario como inactivo sin eliminarlo de la base de datos. No permite desactivar al único Admin.",
  })
  @ApiParam({ name: "id", type: Number, description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Usuario desactivado correctamente",
    schema: {
      example: {
        message: "Usuario desactivado correctamente",
      },
    },
  })
  @ApiForbiddenResponse({ description: "Solo Administradores pueden desactivar usuarios" })
  @ApiNotFoundResponse({ description: "Usuario no encontrado" })
  @ApiBadRequestResponse({ description: "No se puede desactivar al único administrador" })
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.Administrador)
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: "Usuario desactivado correctamente" };
  }
}
