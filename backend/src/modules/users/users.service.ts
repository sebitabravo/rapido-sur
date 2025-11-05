import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "./entities/usuario.entity";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { RolUsuario } from "../../common/enums";
import * as bcrypt from "bcrypt";

/**
 * Service for managing users
 * Handles CRUD operations with bcrypt password hashing
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  /**
   * Create new user with hashed password
   * Password is hashed with bcrypt cost 12 as per CLAUDE.md
   */
  async create(createDto: CreateUsuarioDto): Promise<Usuario> {
    // Validate unique email
    const existente = await this.usuarioRepo.findOne({
      where: { email: createDto.email },
    });
    if (existente) {
      throw new ConflictException("El email ya está registrado");
    }

    // Hash password with bcrypt cost 12
    const password_hash = await bcrypt.hash(createDto.password, 12);

    // Create user
    const usuario = this.usuarioRepo.create({
      nombre_completo: createDto.nombre_completo,
      email: createDto.email,
      password_hash,
      rol: createDto.rol,
      activo: true,
    });

    // Save and return (password_hash excluded by @Exclude() decorator)
    const saved = await this.usuarioRepo.save(usuario);
    this.logger.log(
      `User created: ${saved.email} with role ${saved.rol} (ID: ${saved.id})`,
    );
    return saved;
  }

  /**
   * Find all users
   * password_hash excluded by @Exclude() decorator in entity
   */
  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find({
      order: { created_at: "DESC" },
    });
  }

  /**
   * Find users by role
   * Useful for assigning mechanics to work orders
   * password_hash excluded by @Exclude() decorator in entity
   */
  async findByRole(rol: RolUsuario): Promise<Usuario[]> {
    return this.usuarioRepo.find({
      where: { rol, activo: true },
      order: { nombre_completo: "ASC" },
    });
  }

  /**
   * Find one user by ID
   * password_hash excluded by @Exclude() decorator in entity
   */
  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  /**
   * Find user by email (used by auth service)
   * IMPORTANT: Returns user WITH password_hash for authentication
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email },
    });
  }

  /**
   * Update user
   */
  async update(id: number, updateDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // Validate unique email if changing
    if (updateDto.email && updateDto.email !== usuario.email) {
      const existente = await this.usuarioRepo.findOne({
        where: { email: updateDto.email },
      });
      if (existente) {
        throw new ConflictException("El email ya está en uso");
      }
    }

    // Prevent password update through this endpoint
    if ("password" in updateDto) {
      throw new BadRequestException(
        "Use el endpoint /cambiar-password para actualizar la contraseña",
      );
    }

    Object.assign(usuario, updateDto);
    return this.usuarioRepo.save(usuario);
  }

  /**
   * Change user password
   * Hashes new password with bcrypt cost 12
   */
  async changePassword(id: number, newPassword: string): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // Hash new password with bcrypt cost 12
    usuario.password_hash = await bcrypt.hash(newPassword, 12);
    await this.usuarioRepo.save(usuario);
    this.logger.log(`Password changed for user: ${usuario.email} (ID: ${id})`);
  }

  /**
   * Soft delete user (set activo = false and deleted_at timestamp)
   * Uses TypeORM soft delete which sets deleted_at timestamp
   * Also marks user as inactive for additional safety
   */
  async remove(id: number): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // Prevent deactivating the only admin
    if (usuario.rol === RolUsuario.Administrador) {
      const adminCount = await this.usuarioRepo.count({
        where: { rol: RolUsuario.Administrador, activo: true },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          "No se puede desactivar al único administrador del sistema",
        );
      }
    }

    // Mark as inactive AND soft delete (sets deleted_at)
    usuario.activo = false;
    await this.usuarioRepo.save(usuario);

    // Perform TypeORM soft delete (sets deleted_at timestamp)
    await this.usuarioRepo.softRemove(usuario);

    this.logger.warn(
      `User soft deleted: ${usuario.email} (ID: ${id}) - Role: ${usuario.rol}`,
    );
  }

  /**
   * Validate user credentials (used by auth)
   */
  async validateUser(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.findByEmail(email);

    if (!usuario || !usuario.activo) {
      return null;
    }

    // Compare password with bcrypt
    const isValid = await bcrypt.compare(password, usuario.password_hash);

    if (!isValid) {
      return null;
    }

    // Return user (password_hash excluded by @Exclude() decorator)
    return usuario;
  }
}
