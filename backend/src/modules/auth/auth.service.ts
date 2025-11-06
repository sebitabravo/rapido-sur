import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { Usuario } from "../users/entities/usuario.entity";
import * as bcrypt from "bcrypt";

/**
 * JWT payload interface
 */
interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
}

/**
 * Service handling authentication logic
 * Manages JWT token generation and password validation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials
   * Used by LocalStrategy during login
   */
  async validateUser(email: string, password: string): Promise<Usuario | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.activo) {
      this.logger.warn(
        `Failed login attempt for email: ${email} - User not found or inactive`,
      );
      return null;
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      this.logger.warn(
        `Failed login attempt for email: ${email} - Invalid password`,
      );
      return null;
    }

    this.logger.log(`Successful login for user: ${email} (Role: ${user.rol})`);

    // Return user without password_hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result as Usuario;
  }

  /**
   * Generate JWT token for authenticated user
   * Token expires in 24 hours (from .env JWT_EXPIRATION)
   */
  login(user: Usuario): { access_token: string; user: Usuario } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  /**
   * Hash password with bcrypt cost factor 12
   * As specified in CLAUDE.md security requirements
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Validate JWT token and return user
   * Used by JwtStrategy
   */
  async validateToken(payload: JwtPayload): Promise<Usuario> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user || !user.activo) {
      throw new UnauthorizedException("Usuario no válido o inactivo");
    }

    return user;
  }
}
