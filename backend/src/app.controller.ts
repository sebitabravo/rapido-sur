import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("System")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint for Docker/Dokploy
   * Returns 200 OK to indicate service is running
   * Does not require authentication
   */
  @ApiOperation({
    summary: "Health check endpoint",
    description:
      "Verifica que el servicio está funcionando correctamente. Usado por Docker y Dokploy para health checks.",
  })
  @ApiResponse({
    status: 200,
    description: "Servicio funcionando correctamente",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "OK" },
        timestamp: { type: "string", example: "2025-01-15T10:30:00.000Z" },
      },
    },
  })
  @Get("health")
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
    };
  }
}
