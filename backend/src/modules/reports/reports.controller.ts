import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import type { Response } from "express";
import { ReportsService } from "./reports.service";
import { FilterReportDto } from "./dto/filter-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolUsuario } from "../../common/enums";

/**
 * Controller for report endpoints
 * Provides downtime, cost, and maintenance reports
 */
@ApiTags("Reports")
@ApiBearerAuth("JWT-auth")
@ApiUnauthorizedResponse({ description: "Token inválido o expirado" })
@ApiForbiddenResponse({ description: "Solo Admin y Jefe pueden ver reportes" })
@SkipThrottle() // Reports can make multiple requests, skip rate limiting
@Controller("reportes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /reportes/indisponibilidad
   * Vehicle downtime report
   */
  @ApiOperation({
    summary: "Reporte de indisponibilidad de vehículos",
    description: "Obtiene reporte de días de inactividad por vehículo con cálculos de costos de tiempo parado.",
  })
  @ApiQuery({ name: "vehiculo_id", required: false, type: Number })
  @ApiQuery({ name: "fecha_inicio", required: false, type: String, format: "date" })
  @ApiQuery({ name: "fecha_fin", required: false, type: String, format: "date" })
  @ApiResponse({
    status: 200,
    description: "Reporte de indisponibilidad generado",
    isArray: true,
  })
  @Get("indisponibilidad")
  async getIndisponibilidad(@Query() filters: FilterReportDto): Promise<any[]> {
    return this.reportsService.getReporteIndisponibilidad(filters);
  }

  /**
   * GET /reportes/costos
   * Cost report by vehicle
   */
  @ApiOperation({
    summary: "Reporte de costos de mantenimiento",
    description: "Obtiene reporte de costos totales por vehículo incluyendo repuestos y mano de obra.",
  })
  @ApiQuery({ name: "vehiculo_id", required: false, type: Number })
  @ApiQuery({ name: "fecha_inicio", required: false, type: String, format: "date" })
  @ApiQuery({ name: "fecha_fin", required: false, type: String, format: "date" })
  @ApiResponse({
    status: 200,
    description: "Reporte de costos generado",
  })
  @Get("costos")
  async getCostos(@Query() filters: FilterReportDto): Promise<any> {
    return this.reportsService.getReporteCostos(filters);
  }

  /**
   * GET /reportes/mantenimientos
   * Maintenance report (preventive vs corrective)
   */
  @ApiOperation({
    summary: "Reporte de mantenimientos (preventivo vs correctivo)",
    description: "Obtiene estadísticas de mantenimientos preventivos y correctivos con tendencias.",
  })
  @ApiQuery({ name: "vehiculo_id", required: false, type: Number })
  @ApiQuery({ name: "fecha_inicio", required: false, type: String, format: "date" })
  @ApiQuery({ name: "fecha_fin", required: false, type: String, format: "date" })
  @ApiResponse({
    status: 200,
    description: "Reporte de mantenimientos generado",
  })
  @Get("mantenimientos")
  async getMantenimientos(@Query() filters: FilterReportDto): Promise<any> {
    return this.reportsService.getReporteMantenimientos(filters);
  }

  /**
   * GET /reportes/export/csv?tipo=indisponibilidad
   * Export report to CSV
   */
  @ApiOperation({
    summary: "Exportar reporte a CSV",
    description: "Exporta cualquier reporte a formato CSV para análisis en Excel.",
  })
  @ApiQuery({ name: "tipo", required: true, enum: ["indisponibilidad", "costos", "mantenimientos"] })
  @ApiQuery({ name: "vehiculo_id", required: false, type: Number })
  @ApiQuery({ name: "fecha_inicio", required: false, type: String })
  @ApiQuery({ name: "fecha_fin", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Archivo CSV generado",
    headers: {
      "Content-Type": { description: "text/csv" },
      "Content-Disposition": { description: "attachment; filename=reporte-*.csv" },
    },
  })
  @Get("export/csv")
  async exportCSV(
    @Query("tipo") tipo: string,
    @Query() filters: FilterReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const csv = await this.reportsService.exportToCSV(tipo, filters);
    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      `attachment; filename=reporte-${tipo}-${Date.now()}.csv`,
    );
    res.send(csv);
  }
}
