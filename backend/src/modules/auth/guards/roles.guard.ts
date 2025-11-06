import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolUsuario } from "../../../common/enums";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Usuario } from "../../users/entities/usuario.entity";

/**
 * Interface for authenticated request
 */
interface RequestWithUser {
  user: Usuario;
}

/**
 * Guard for role-based access control (RBAC)
 * Checks if user has required role to access endpoint
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user) {
      return false; // No user in request
    }

    return requiredRoles.some((role) => user.rol === role);
  }
}
