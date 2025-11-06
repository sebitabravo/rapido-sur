import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { OrdenTrabajo } from "../work-orders/entities/orden-trabajo.entity";
import { DetalleRepuesto } from "../part-details/entities/detalle-repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { FilterReportDto } from "./dto/filter-report.dto";
import { EstadoOrdenTrabajo, TipoOrdenTrabajo } from "../../common/enums";

/**
 * Service for generating reports
 * Provides downtime and cost analysis
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly otRepo: Repository<OrdenTrabajo>,
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepo: Repository<DetalleRepuesto>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * REPORT: Vehicle downtime
   */
  async getReporteIndisponibilidad(filters: FilterReportDto): Promise<any[]> {
    const { fecha_inicio, fecha_fin, vehiculo_id } = filters;

    const qb = this.otRepo
      .createQueryBuilder("ot")
      .leftJoin("ot.vehiculo", "v")
      .select([
        "v.id AS vehiculo_id",
        "v.patente AS patente",
        "v.marca AS marca",
        "v.modelo AS modelo",
        "COUNT(ot.id) AS total_ordenes",
        "SUM(EXTRACT(DAY FROM (ot.fecha_cierre - ot.fecha_creacion))) AS dias_inactividad",
        "AVG(EXTRACT(DAY FROM (ot.fecha_cierre - ot.fecha_creacion))) AS promedio_dias",
      ])
      .where("ot.estado = :estado", { estado: EstadoOrdenTrabajo.Finalizada })
      .andWhere("ot.fecha_cierre IS NOT NULL")
      .groupBy("v.id, v.patente, v.marca, v.modelo")
      .orderBy("dias_inactividad", "DESC");

    // Optional filters
    if (fecha_inicio) {
      qb.andWhere("ot.fecha_creacion >= :fecha_inicio", { fecha_inicio });
    }
    if (fecha_fin) {
      qb.andWhere("ot.fecha_creacion <= :fecha_fin", { fecha_fin });
    }
    if (vehiculo_id) {
      qb.andWhere("v.id = :vehiculo_id", { vehiculo_id });
    }

    return qb.getRawMany();
  }

  /**
   * REPORT: Costs
   */
  async getReporteCostos(filters: FilterReportDto): Promise<any> {
    const { fecha_inicio, fecha_fin, vehiculo_id } = filters;

    // Query for costs by vehicle
    const qbVehiculos = this.otRepo
      .createQueryBuilder("ot")
      .leftJoin("ot.vehiculo", "v")
      .select([
        "v.id AS vehiculo_id",
        "v.patente AS patente",
        "COUNT(ot.id) AS total_ordenes",
        "SUM(ot.costo_total) AS costo_total",
      ])
      .where("ot.estado = :estado", { estado: EstadoOrdenTrabajo.Finalizada })
      .groupBy("v.id, v.patente")
      .orderBy("costo_total", "DESC");

    if (fecha_inicio) {
      qbVehiculos.andWhere("ot.fecha_creacion >= :fecha_inicio", {
        fecha_inicio,
      });
    }
    if (fecha_fin) {
      qbVehiculos.andWhere("ot.fecha_creacion <= :fecha_fin", { fecha_fin });
    }
    if (vehiculo_id) {
      qbVehiculos.andWhere("v.id = :vehiculo_id", { vehiculo_id });
    }

    const costosPorVehiculo = await qbVehiculos.getRawMany();

    // Query for parts vs labor breakdown
    const qbDesglose = this.detalleRepo
      .createQueryBuilder("dr")
      .leftJoin("dr.tarea", "t")
      .leftJoin("t.orden_trabajo", "ot")
      .select([
        "SUM(dr.cantidad_usada * dr.precio_unitario_momento) AS costo_repuestos",
      ])
      .where("ot.estado = :estado", { estado: EstadoOrdenTrabajo.Finalizada });

    if (fecha_inicio) {
      qbDesglose.andWhere("ot.fecha_creacion >= :fecha_inicio", {
        fecha_inicio,
      });
    }
    if (fecha_fin) {
      qbDesglose.andWhere("ot.fecha_creacion <= :fecha_fin", { fecha_fin });
    }

    const desglose = await qbDesglose.getRawOne();

    // Query for labor cost (hours worked * hourly rate)
    const qbManoObra = this.tareaRepo
      .createQueryBuilder("t")
      .leftJoin("t.orden_trabajo", "ot")
      .select([
        "SUM(t.horas_trabajadas) AS total_horas",
      ])
      .where("ot.estado = :estado", { estado: EstadoOrdenTrabajo.Finalizada });

    if (fecha_inicio) {
      qbManoObra.andWhere("ot.fecha_creacion >= :fecha_inicio", {
        fecha_inicio,
      });
    }
    if (fecha_fin) {
      qbManoObra.andWhere("ot.fecha_creacion <= :fecha_fin", { fecha_fin });
    }

    const manoObra = await qbManoObra.getRawOne();
    const laborCostPerHour = this.configService.get<number>("LABOR_COST_PER_HOUR", 15000);
    const totalHoras = parseFloat(manoObra.total_horas || 0);
    const costoManoObra = totalHoras * laborCostPerHour;

    // Calculate totals
    const costoTotalGeneral = costosPorVehiculo.reduce(
      (sum, item) => sum + parseFloat(item.costo_total || 0),
      0,
    );

    return {
      costo_total: costoTotalGeneral,
      costo_repuestos: parseFloat(desglose.costo_repuestos || 0),
      costo_mano_obra: costoManoObra,
      total_horas_trabajadas: totalHoras,
      tarifa_por_hora: laborCostPerHour,
      costos_por_vehiculo: costosPorVehiculo,
      periodo: {
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null,
      },
    };
  }

  /**
   * REPORT: Maintenance (preventive vs corrective)
   */
  async getReporteMantenimientos(filters: FilterReportDto): Promise<any> {
    const { fecha_inicio, fecha_fin } = filters;

    const qb = this.otRepo
      .createQueryBuilder("ot")
      .select([
        "ot.tipo AS tipo",
        "COUNT(ot.id) AS cantidad",
        "AVG(ot.costo_total) AS costo_promedio",
        "AVG(EXTRACT(DAY FROM (ot.fecha_cierre - ot.fecha_creacion))) AS dias_promedio",
      ])
      .where("ot.estado = :estado", { estado: EstadoOrdenTrabajo.Finalizada })
      .groupBy("ot.tipo");

    if (fecha_inicio) {
      qb.andWhere("ot.fecha_creacion >= :fecha_inicio", { fecha_inicio });
    }
    if (fecha_fin) {
      qb.andWhere("ot.fecha_creacion <= :fecha_fin", { fecha_fin });
    }

    const datos = await qb.getRawMany();

    return {
      preventivos:
        datos.find((d) => d.tipo === TipoOrdenTrabajo.Preventivo) || {},
      correctivos:
        datos.find((d) => d.tipo === TipoOrdenTrabajo.Correctivo) || {},
      total: datos.reduce((sum, d) => sum + parseInt(d.cantidad), 0),
    };
  }

  /**
   * EXPORT to CSV
   */
  async exportToCSV(tipo: string, filters: FilterReportDto): Promise<string> {
    let data: any[];

    switch (tipo) {
      case "indisponibilidad":
        data = await this.getReporteIndisponibilidad(filters);
        return this.convertToCSV(data, [
          "patente",
          "marca",
          "modelo",
          "total_ordenes",
          "dias_inactividad",
          "promedio_dias",
        ]);

      case "costos":
        const reporteCostos = await this.getReporteCostos(filters);
        return this.convertToCSV(reporteCostos.costos_por_vehiculo, [
          "patente",
          "total_ordenes",
          "costo_total",
        ]);

      default:
        throw new BadRequestException("Tipo de reporte no válido");
    }
  }

  /**
   * HELPER: Convert to CSV
   */
  private convertToCSV(data: any[], headers: string[]): string {
    const headerRow = headers.join(",");
    const rows = data.map((item) =>
      headers.map((header) => item[header] || "").join(","),
    );
    return [headerRow, ...rows].join("\n");
  }
}
