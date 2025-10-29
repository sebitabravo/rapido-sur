import { SetMetadata } from "@nestjs/common";
import { RolUsuario } from "../../../common/enums";

/**
 * Decorator to define required roles for an endpoint
 * Usage: @Roles(RolUsuario.Admin, RolUsuario.JefeMantenimiento)
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
