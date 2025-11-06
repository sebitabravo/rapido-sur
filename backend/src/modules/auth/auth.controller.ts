import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RolUsuario } from "../../common/enums";
import { Usuario } from "../users/entities/usuario.entity";

/**
 * Interface for authenticated request
 */
interface RequestWithUser {
  user: Usuario;
}

/**
 * Authentication controller
 * Handles login, registration, and profile endpoints
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /auth/login
   * Authenticate user with email and password
   * Returns JWT token
   * Rate limit: 5 attempts per minute to prevent brute force
   */
  @ApiOperation({
    summary: "Login de usuario",
    description:
      "Autentica un usuario con email y contraseña. Retorna un token JWT válido por 24 horas. Rate limit: 5 intentos por minuto para prevenir ataques de fuerza bruta.",
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: {
        summary: "Login Administrador",
        value: {
          email: "admin@rapidosur.cl",
          password: "Admin123!",
        },
      },
      jefe: {
        summary: "Login Jefe de Mantenimiento",
        value: {
          email: "jefe@rapidosur.cl",
          password: "Jefe123!",
        },
      },
      mecanico: {
        summary: "Login Mecánico",
        value: {
          email: "mecanico@rapidosur.cl",
          password: "Meca123!",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Login exitoso. Retorna token JWT y datos del usuario.",
    schema: {
      example: {
        access_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AcmFwaWRvc3VyLmNsIiwicm9sIjoiQWRtaW5pc3RyYWRvciIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQxMDgxNjAwfQ.example",
        user: {
          id: 1,
          email: "admin@rapidosur.cl",
          nombre_completo: "Admin Rápido Sur",
          rol: "Administrador",
          activo: true,
          created_at: "2025-01-15T10:00:00.000Z",
          updated_at: "2025-01-15T10:00:00.000Z",
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Credenciales inválidas o usuario inactivo",
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  /**
   * GET /auth/profile
   * Get current authenticated user profile
   * Requires valid JWT token
   */
  @ApiOperation({
    summary: "Obtener perfil del usuario autenticado",
    description:
      "Retorna la información del usuario actualmente autenticado basándose en el JWT token provisto.",
  })
  @ApiBearerAuth("JWT-auth")
  @ApiResponse({
    status: 200,
    description: "Perfil del usuario",
    schema: {
      example: {
        id: 1,
        email: "admin@rapidosur.cl",
        nombre_completo: "Admin Rápido Sur",
        rol: "Administrador",
        activo: true,
        created_at: "2025-01-15T10:00:00.000Z",
        updated_at: "2025-01-15T10:00:00.000Z",
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Token inválido o expirado",
  })
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@CurrentUser() user: Usuario) {
    return user;
  }

  /**
   * POST /auth/register
   * Register new user (Admin only)
   * Hashes password with bcrypt cost 12
   */
  @ApiOperation({
    summary: "Registrar nuevo usuario (Solo Administrador)",
    description:
      "Crea un nuevo usuario en el sistema. La contraseña se encripta con bcrypt (cost factor 12). Solo usuarios con rol Administrador pueden crear nuevos usuarios.",
  })
  @ApiBearerAuth("JWT-auth")
  @ApiBody({
    type: RegisterDto,
    examples: {
      mecanico: {
        summary: "Crear Mecánico",
        value: {
          email: "nuevo.mecanico@rapidosur.cl",
          password: "SecurePass123!",
          nombre_completo: "Juan Pérez Mecánico",
          rol: "Mecanico",
        },
      },
      jefe: {
        summary: "Crear Jefe de Mantenimiento",
        value: {
          email: "nuevo.jefe@rapidosur.cl",
          password: "SecurePass123!",
          nombre_completo: "María González Supervisora",
          rol: "JefeMantenimiento",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Usuario creado exitosamente",
    schema: {
      example: {
        id: 5,
        email: "nuevo.mecanico@rapidosur.cl",
        nombre_completo: "Juan Pérez Mecánico",
        rol: "Mecanico",
        activo: true,
        created_at: "2025-01-15T14:30:00.000Z",
        updated_at: "2025-01-15T14:30:00.000Z",
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Token inválido o expirado",
  })
  @ApiForbiddenResponse({
    description: "No tienes permisos. Solo Administradores pueden crear usuarios.",
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.Administrador)
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }
}
