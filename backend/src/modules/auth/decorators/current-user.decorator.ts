import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Usuario } from "../../users/entities/usuario.entity";

/**
 * Interface for authenticated request
 */
interface RequestWithUser {
  user: Usuario;
}

/**
 * Decorator to extract current authenticated user from request
 * Usage: @CurrentUser() user: Usuario
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Usuario => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
