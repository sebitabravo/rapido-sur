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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "default-secret",
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
