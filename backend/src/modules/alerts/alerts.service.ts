import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { Alerta } from "./entities/alerta.entity";
import { PlanPreventivo } from "../preventive-plans/entities/plan-preventivo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { MailService } from "../mail/mail.service";
import { EstadoVehiculo, TipoAlerta, TipoIntervalo } from "../../common/enums";

/**
 * Service for managing preventive maintenance alerts
 * Runs daily cron job to check vehicles needing maintenance
 */
@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alerta)
    private readonly alertaRepo: Repository<Alerta>,
    @InjectRepository(PlanPreventivo)
    private readonly planRepo: Repository<PlanPreventivo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    private readonly mailService: MailService,
  ) {}

  /**
   * CRON JOB - Run daily at 6:00 AM
   * Checks all active vehicles for preventive maintenance needs
   */
  @Cron("0 6 * * *")
  async verificarAlertasPreventivas(): Promise<number> {
    this.logger.log("[CRON] Verificando alertas preventivas...");

    // Get all active vehicles with their preventive plans
    const vehiculos = await this.vehiculoRepo.find({
      where: { estado: EstadoVehiculo.Activo },
      relations: ["plan_preventivo"],
    });

    // OPTIMIZATION: Fetch all existing unsent alerts in a single query
    const vehiculoIds = vehiculos.map(v => v.id);
    const alertasExistentes = await this.alertaRepo
      .createQueryBuilder("alerta")
      .leftJoinAndSelect("alerta.vehiculo", "vehiculo")
      .where("vehiculo.id IN (:...ids)", { ids: vehiculoIds })
      .andWhere("alerta.email_enviado = :enviado", { enviado: false })
      .getMany();

    // Create a map for O(1) lookup
    const alertasMap = new Map(
      alertasExistentes.map(a => [a.vehiculo.id, true])
    );

    const alertasGeneradas: Alerta[] = [];

    // Check each vehicle
    for (const vehiculo of vehiculos) {
      if (!vehiculo.plan_preventivo || !vehiculo.plan_preventivo.activo) {
        continue;
      }

      // Check if alert already exists (in-memory check, no DB query)
      if (alertasMap.has(vehiculo.id)) {
        continue; // Alert already exists
      }

      const plan = vehiculo.plan_preventivo;
      const alerta = await this.verificarVehiculoSinQuery(vehiculo, plan);

      if (alerta) {
        alertasGeneradas.push(alerta);
      }
    }

    // Send email if there are alerts
    if (alertasGeneradas.length > 0) {
      await this.enviarEmailAlertas(alertasGeneradas);
    }

    this.logger.log(`[CRON] ${alertasGeneradas.length} alertas generadas`);
    return alertasGeneradas.length;
  }

  /**
   * Check a specific vehicle for maintenance needs (without DB query)
   * Note: Caller must check for existing alerts before calling this method
   */
  private async verificarVehiculoSinQuery(
    vehiculo: Vehiculo,
    plan: PlanPreventivo,
  ): Promise<Alerta | null> {

    let debeAlertar = false;
    let razon = "";

    // CASE 1: MILEAGE alerts
    if (plan.tipo_intervalo === TipoIntervalo.KM) {
      const kmRestantes =
        plan.proximo_kilometraje - vehiculo.kilometraje_actual;
      const UMBRAL_KM = 1000; // Alert 1000 km before (as specified in CLAUDE.md)

      if (kmRestantes <= UMBRAL_KM && kmRestantes >= 0) {
        debeAlertar = true;
        razon = `Mantenimiento en ${kmRestantes} km (próximo: ${plan.proximo_kilometraje} km)`;
      } else if (kmRestantes < 0) {
        debeAlertar = true;
        razon = `ATRASADO ${Math.abs(kmRestantes)} km (debió ser en ${plan.proximo_kilometraje} km)`;
      }
    }

    // CASE 2: TIME alerts
    if (plan.tipo_intervalo === TipoIntervalo.Tiempo) {
      if (!plan.proxima_fecha) {
        return null;
      }

      const hoy = new Date();
      const diasRestantes = Math.ceil(
        (plan.proxima_fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );
      const UMBRAL_DIAS = 7; // Alert 7 days before

      if (diasRestantes <= UMBRAL_DIAS && diasRestantes >= 0) {
        debeAlertar = true;
        razon = `Mantenimiento en ${diasRestantes} días (fecha: ${plan.proxima_fecha.toLocaleDateString()})`;
      } else if (diasRestantes < 0) {
        debeAlertar = true;
        razon = `ATRASADO ${Math.abs(diasRestantes)} días (debió ser el ${plan.proxima_fecha.toLocaleDateString()})`;
      }
    }

    // Create alert if needed
    if (debeAlertar) {
      const alerta = this.alertaRepo.create({
        vehiculo,
        tipo_alerta:
          plan.tipo_intervalo === TipoIntervalo.KM
            ? TipoAlerta.Kilometraje
            : TipoAlerta.Fecha,
        mensaje: `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}: ${razon}`,
        fecha_generacion: new Date(),
        email_enviado: false,
      });

      return this.alertaRepo.save(alerta);
    }

    return null;
  }

  /**
   * Send email with alerts
   */
  private async enviarEmailAlertas(alertas: Alerta[]): Promise<void> {
    try {
      await this.mailService.enviarAlertasPreventivas(alertas);

      // Mark alerts as sent
      for (const alerta of alertas) {
        alerta.email_enviado = true;
        await this.alertaRepo.save(alerta);
      }
    } catch (error) {
      this.logger.error("[ALERTS] Error enviando emails:", error);
    }
  }

  /**
   * Mark alert as attended (when work order is created)
   */
  async marcarAtendida(vehiculoId: number): Promise<void> {
    // Delete alerts for this vehicle since they've been attended
    await this.alertaRepo.delete({
      vehiculo: { id: vehiculoId },
    });
  }

  /**
   * Get pending alerts
   */
  async getAlertasPendientes(): Promise<Alerta[]> {
    return this.alertaRepo.find({
      where: { email_enviado: false },
      relations: ["vehiculo"],
      order: { fecha_generacion: "DESC" },
    });
  }

  /**
   * Find all alerts
   */
  async findAll(): Promise<Alerta[]> {
    return this.alertaRepo.find({
      relations: ["vehiculo"],
      order: { fecha_generacion: "DESC" },
    });
  }

  /**
   * Find alert by ID
   */
  async findOne(id: number): Promise<Alerta | null> {
    return this.alertaRepo.findOne({
      where: { id },
      relations: ["vehiculo"],
    });
  }

  /**
   * Find pending alerts (not yet acknowledged, email sent but no WO created)
   */
  async findPendientes(): Promise<Alerta[]> {
    return this.alertaRepo.find({
      where: { email_enviado: true },
      relations: ["vehiculo"],
      order: { fecha_generacion: "DESC" },
    });
  }

  /**
   * Find alerts by vehicle ID
   */
  async findByVehiculo(vehiculoId: number): Promise<Alerta[]> {
    return this.alertaRepo.find({
      where: { vehiculo: { id: vehiculoId } },
      relations: ["vehiculo"],
      order: { fecha_generacion: "DESC" },
    });
  }

  /**
   * Create test alerts for MVP demonstration
   * @param patente - Optional vehicle license plate. If not provided, creates for all active vehicles
   */
  async crearAlertasPrueba(patente?: string): Promise<Alerta[]> {
    this.logger.log(`[TEST] Creando alertas de prueba${patente ? ` para ${patente}` : ""}...`);

    let vehiculos: Vehiculo[];

    if (patente) {
      // Create alert for specific vehicle
      const vehiculo = await this.vehiculoRepo.findOne({
        where: { patente },
        relations: ["plan_preventivo"],
      });

      if (!vehiculo) {
        throw new Error(`Vehículo con patente ${patente} no encontrado`);
      }

      vehiculos = [vehiculo];
    } else {
      // Create alerts for all active vehicles
      vehiculos = await this.vehiculoRepo.find({
        where: { estado: EstadoVehiculo.Activo },
        relations: ["plan_preventivo"],
      });
    }

    const alertasCreadas: Alerta[] = [];

    for (const vehiculo of vehiculos) {
      // Create test alert with generic message
      const mensaje = vehiculo.plan_preventivo
        ? vehiculo.plan_preventivo.tipo_intervalo === TipoIntervalo.KM
          ? `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}: Mantenimiento en 500 km (PRUEBA)`
          : `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}: Mantenimiento en 3 días (PRUEBA)`
        : `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}: Alerta de prueba - Sin plan preventivo`;

      const tipoAlerta = vehiculo.plan_preventivo?.tipo_intervalo === TipoIntervalo.Tiempo
        ? TipoAlerta.Fecha
        : TipoAlerta.Kilometraje;

      const alerta = this.alertaRepo.create({
        vehiculo,
        tipo_alerta: tipoAlerta,
        mensaje,
        fecha_generacion: new Date(),
        email_enviado: false, // Test alerts don't send emails by default
      });

      const alertaGuardada = await this.alertaRepo.save(alerta);
      alertasCreadas.push(alertaGuardada);
    }

    this.logger.log(`[TEST] ${alertasCreadas.length} alertas de prueba creadas`);
    return alertasCreadas;
  }
}
