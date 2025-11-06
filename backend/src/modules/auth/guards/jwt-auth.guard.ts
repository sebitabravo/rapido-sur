import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard for JWT authentication
 * Used on protected endpoints to verify valid JWT token
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
