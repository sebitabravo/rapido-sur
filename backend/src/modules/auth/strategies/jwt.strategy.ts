import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Usuario } from "../../users/entities/usuario.entity";

/**
 * JWT payload interface
 */
interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
}

/**
 * JWT authentication strategy
 * Validates JWT tokens in protected routes
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");

    if (!jwtSecret) {
      throw new Error("JWT_SECRET must be defined in environment variables");
    }

    if (jwtSecret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<Usuario> {
    const user = await this.authService.validateToken(payload);

    if (!user) {
      throw new UnauthorizedException("Token inválido");
    }

    return user;
  }
}
