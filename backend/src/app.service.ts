import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /**
   * Returns API information and available endpoints
   * This is a professional welcome endpoint that provides useful information
   */
  getApiInfo() {
    const nodeEnv = this.configService.get<string>("NODE_ENV", "development");
    const port = this.configService.get<number>("PORT", 3000);
    const baseUrl =
      nodeEnv === "production"
        ? this.configService.get<string>(
            "API_URL",
            `http://localhost:${port}`,
          )
        : `http://localhost:${port}`;

    return {
      name: "Rápido Sur - Sistema de Gestión de Mantenimiento",
      version: "1.0.0",
      description:
        "API REST para la gestión integral de mantenimiento de flota vehicular",
      environment: nodeEnv,
      status: "operational",
      timestamp: new Date().toISOString(),
      endpoints: {
        api: `${baseUrl}/api`,
        documentation: `${baseUrl}/api/docs`,
        status: `${baseUrl}/api/status`,
        health: `${baseUrl}/health`,
      },
      resources: [
        {
          name: "Autenticación",
          endpoints: [
            "POST /api/auth/login",
            "POST /api/auth/register",
            "GET /api/auth/profile",
          ],
        },
        {
          name: "Usuarios",
          endpoints: [
            "GET /api/usuarios",
            "GET /api/usuarios/:id",
            "POST /api/usuarios",
            "PATCH /api/usuarios/:id",
            "DELETE /api/usuarios/:id",
          ],
        },
        {
          name: "Vehículos",
          endpoints: [
            "GET /api/vehiculos",
            "GET /api/vehiculos/:id",
            "POST /api/vehiculos",
            "PATCH /api/vehiculos/:id",
            "DELETE /api/vehiculos/:id",
          ],
        },
        {
          name: "Órdenes de Trabajo",
          endpoints: [
            "GET /api/ordenes-trabajo",
            "GET /api/ordenes-trabajo/:id",
            "POST /api/ordenes-trabajo",
            "PATCH /api/ordenes-trabajo/:id",
            "DELETE /api/ordenes-trabajo/:id",
          ],
        },
        {
          name: "Tareas",
          endpoints: [
            "GET /api/tareas",
            "GET /api/tareas/:id",
          ],
        },
        {
          name: "Repuestos",
          endpoints: [
            "GET /api/repuestos",
            "GET /api/repuestos/:id",
            "POST /api/repuestos",
            "PATCH /api/repuestos/:id",
            "DELETE /api/repuestos/:id",
          ],
        },
        {
          name: "Planes Preventivos",
          endpoints: [
            "GET /api/planes-preventivos",
            "GET /api/planes-preventivos/:id",
            "POST /api/planes-preventivos",
            "PATCH /api/planes-preventivos/:id",
            "DELETE /api/planes-preventivos/:id",
          ],
        },
        {
          name: "Alertas",
          endpoints: [
            "GET /api/alertas",
            "GET /api/alertas/pendientes",
            "GET /api/alertas/vehiculo/:vehiculoId",
          ],
        },
        {
          name: "Reportes",
          endpoints: [
            "GET /api/reportes/indisponibilidad",
            "GET /api/reportes/costos",
            "GET /api/reportes/mantenimientos",
            "GET /api/reportes/export/csv",
          ],
        },
      ],
      team: {
        institution: "Instituto Profesional INACAP",
        campus: "Temuco",
        program: "Ingeniería en Informática",
        developers: ["Rubilar", "Bravo", "Loyola", "Aguayo"],
      },
      support: {
        documentation: `${baseUrl}/api/docs`,
        healthCheck: `${baseUrl}/health`,
      },
      security: {
        authentication: "JWT (JSON Web Tokens)",
        authorizationHeader: "Authorization: Bearer {token}",
        tokenExpiration: "24 hours",
        https: nodeEnv === "production" ? "enabled" : "disabled (development)",
        cors: "enabled",
        helmet: "enabled",
        rateLimit: "enabled",
      },
      technicalDetails: {
        framework: "NestJS 10",
        runtime: "Node.js 20 LTS",
        database: "PostgreSQL 15",
        orm: "TypeORM 0.3",
        deployment: "Docker + Dokploy",
      },
    };
  }

  /**
   * Checks if the database connection is healthy
   * Returns true if connected, false otherwise
   */
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Execute a simple query to verify connection
      await this.dataSource.query("SELECT 1");
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets detailed database status information
   * Used for comprehensive health checks
   */
  async getDatabaseStatus(): Promise<{
    connected: boolean;
    type: string;
    database: string;
    host: string;
  }> {
    const isConnected = await this.checkDatabaseHealth();

    return {
      connected: isConnected,
      type: this.dataSource.options.type,
      database: (this.dataSource.options as any).database || "unknown",
      host: (this.dataSource.options as any).host || "unknown",
    };
  }
}
