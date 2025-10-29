import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard for local authentication (email/password)
 * Used on login endpoint
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {}
