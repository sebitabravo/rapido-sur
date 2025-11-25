import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("System")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * API Information endpoint
   * Returns comprehensive information about the API including available endpoints
   * This is a public endpoint that doesn't require authentication
   */
  @ApiOperation({
    summary: "API Information",
    description:
      "Obtiene información general de la API, incluyendo versión, endpoints disponibles y documentación.",
  })
  @ApiResponse({
    status: 200,
    description: "Información de la API retornada exitosamente",
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Rápido Sur - Sistema de Gestión de Mantenimiento",
        },
        version: { type: "string", example: "1.0.0" },
        description: {
          type: "string",
          example:
            "API REST para la gestión integral de mantenimiento de flota vehicular",
        },
        environment: { type: "string", example: "development" },
        status: { type: "string", example: "operational" },
        timestamp: { type: "string", example: "2025-01-15T10:30:00.000Z" },
      },
    },
  })
  @Get()
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  /**
   * Health check endpoint for Docker/Dokploy
   * Returns 200 OK to indicate service is running
   * Also verifies database connectivity
   * Does not require authentication
   */
  @ApiOperation({
    summary: "Health check endpoint",
    description:
      "Verifica que el servicio está funcionando correctamente. Usado por Docker y Dokploy para health checks. Incluye verificación de base de datos.",
  })
  @ApiResponse({
    status: 200,
    description: "Servicio funcionando correctamente",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "OK" },
        database: { type: "string", example: "connected" },
        timestamp: { type: "string", example: "2025-01-15T10:30:00.000Z" },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: "Servicio degradado (base de datos desconectada)",
  })
  @Get("health")
  async healthCheck(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    const dbHealthy = await this.appService.checkDatabaseHealth();

    return {
      status: dbHealthy ? "OK" : "DEGRADED",
      database: dbHealthy ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detailed system status endpoint
   * Provides comprehensive information about the system status
   * Does not require authentication
   */
  @ApiOperation({
    summary: "System status endpoint",
    description:
      "Obtiene información detallada sobre el estado del sistema, incluyendo versión, uptime, y estado de servicios.",
  })
  @ApiResponse({
    status: 200,
    description: "Estado del sistema retornado exitosamente",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "operational" },
        version: { type: "string", example: "1.0.0" },
        environment: { type: "string", example: "development" },
        uptime: { type: "number", example: 3600 },
        timestamp: { type: "string", example: "2025-01-15T10:30:00.000Z" },
      },
    },
  })
  @Get("status")
  async getStatus() {
    const dbStatus = await this.appService.getDatabaseStatus();

    return {
      status: dbStatus.connected ? "operational" : "degraded",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus.connected ? "connected" : "disconnected",
        databaseDetails: {
          type: dbStatus.type,
          host: dbStatus.host,
          database: dbStatus.database,
        },
        api: "operational",
        authentication: "active",
      },
      security: {
        cors: "enabled",
        helmet: "enabled",
        rateLimit: "enabled",
        authentication: "JWT",
      },
    };
  }
}
