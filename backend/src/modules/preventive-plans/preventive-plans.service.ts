import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { CreatePlanPreventivoDto } from "./dto/create-plan-preventivo.dto";
import { UpdatePlanPreventivoDto } from "./dto/update-plan-preventivo.dto";
import { TipoIntervalo } from "../../common/enums";

/**
 * Service for managing preventive maintenance plans
 */
@Injectable()
export class PreventivePlansService {
  private readonly logger = new Logger(PreventivePlansService.name);

  constructor(
    @InjectRepository(PlanPreventivo)
    private readonly planPreventivoRepository: Repository<PlanPreventivo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepository: Repository<Vehiculo>,
  ) {}

  /**
   * Find all preventive plans
   */
  async findAll(): Promise<PlanPreventivo[]> {
    return this.planPreventivoRepository.find({
      relations: ["vehiculo"],
    });
  }

  /**
   * Find preventive plan by ID
   */
  async findOne(id: number): Promise<PlanPreventivo | null> {
    return this.planPreventivoRepository.findOne({
      where: { id },
      relations: ["vehiculo"],
    });
  }

  /**
   * Create a new preventive maintenance plan
   */
  async create(
    createDto: CreatePlanPreventivoDto,
  ): Promise<PlanPreventivo> {
    // Validate vehicle exists
    const vehiculo = await this.vehiculosRepository.findOne({
      where: { id: createDto.vehiculo_id },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${createDto.vehiculo_id} no encontrado`,
      );
    }

    // Check if vehicle already has a preventive plan
    const existingPlan = await this.planPreventivoRepository.findOne({
      where: { vehiculo: { id: createDto.vehiculo_id } },
    });

    if (existingPlan) {
      throw new BadRequestException(
        `El vehículo ${vehiculo.patente} ya tiene un plan preventivo asociado`,
      );
    }

    // Validate that proximo_kilometraje or proxima_fecha is set based on tipo_intervalo
    if (createDto.tipo_intervalo === TipoIntervalo.KM) {
      if (!createDto.proximo_kilometraje) {
        // Auto-calculate based on current mileage
        createDto.proximo_kilometraje =
          vehiculo.kilometraje_actual + createDto.intervalo;
      }
    } else if (createDto.tipo_intervalo === TipoIntervalo.Tiempo) {
      if (!createDto.proxima_fecha) {
        // Auto-calculate based on current date
        const fechaProxima = new Date();
        fechaProxima.setDate(fechaProxima.getDate() + createDto.intervalo);
        createDto.proxima_fecha = fechaProxima;
      }
    }

    const plan = this.planPreventivoRepository.create({
      ...createDto,
      vehiculo,
      activo: createDto.activo ?? true,
    });

    await this.planPreventivoRepository.save(plan);

    this.logger.log(
      `Plan preventivo creado para vehículo ${vehiculo.patente}: cada ${createDto.intervalo} ${createDto.tipo_intervalo}`,
    );

    return plan;
  }

  /**
   * Update an existing preventive plan
   */
  async update(
    id: number,
    updateDto: UpdatePlanPreventivoDto,
  ): Promise<PlanPreventivo> {
    const plan = await this.findOne(id);

    if (!plan) {
      throw new NotFoundException(
        `Plan preventivo con ID ${id} no encontrado`,
      );
    }

    // If vehiculo_id is being changed, validate new vehicle exists
    if (updateDto.vehiculo_id && updateDto.vehiculo_id !== plan.vehiculo.id) {
      const vehiculo = await this.vehiculosRepository.findOne({
        where: { id: updateDto.vehiculo_id },
      });

      if (!vehiculo) {
        throw new NotFoundException(
          `Vehículo con ID ${updateDto.vehiculo_id} no encontrado`,
        );
      }

      // Check if new vehicle already has a plan
      const existingPlan = await this.planPreventivoRepository.findOne({
        where: { vehiculo: { id: updateDto.vehiculo_id } },
      });

      if (existingPlan && existingPlan.id !== id) {
        throw new BadRequestException(
          `El vehículo ${vehiculo.patente} ya tiene un plan preventivo asociado`,
        );
      }

      plan.vehiculo = vehiculo;
    }

    // Update fields
    if (updateDto.tipo_mantenimiento !== undefined) {
      plan.tipo_mantenimiento = updateDto.tipo_mantenimiento;
    }
    if (updateDto.tipo_intervalo !== undefined) {
      plan.tipo_intervalo = updateDto.tipo_intervalo;
    }
    if (updateDto.intervalo !== undefined) {
      plan.intervalo = updateDto.intervalo;
    }
    if (updateDto.descripcion !== undefined) {
      plan.descripcion = updateDto.descripcion;
    }
    if (updateDto.proximo_kilometraje !== undefined) {
      plan.proximo_kilometraje = updateDto.proximo_kilometraje;
    }
    if (updateDto.proxima_fecha !== undefined) {
      plan.proxima_fecha = updateDto.proxima_fecha;
    }
    if (updateDto.activo !== undefined) {
      plan.activo = updateDto.activo;
    }

    const savedPlan = await this.planPreventivoRepository.save(plan);

    this.logger.log(`Plan preventivo ${id} actualizado`);

    // Return the saved plan with relations
    return this.planPreventivoRepository.findOne({
      where: { id },
      relations: ["vehiculo"],
    }) as Promise<PlanPreventivo>;
  }

  /**
   * Deactivate a preventive plan (soft delete)
   */
  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);

    if (!plan) {
      throw new NotFoundException(
        `Plan preventivo con ID ${id} no encontrado`,
      );
    }

    // Deactivate instead of hard delete
    plan.activo = false;
    await this.planPreventivoRepository.save(plan);

    this.logger.log(
      `Plan preventivo ${id} desactivado para vehículo ${plan.vehiculo.patente}`,
    );
  }

  /**
   * Get preventive plan by vehicle ID
   */
  async findByVehiculo(vehiculoId: number): Promise<PlanPreventivo | null> {
    return this.planPreventivoRepository.findOne({
      where: { vehiculo: { id: vehiculoId }, activo: true },
      relations: ["vehiculo"],
    });
  }

  /**
   * Fix preventive plans with null proximo_kilometraje or proxima_fecha
   * This is an admin utility to repair data inconsistencies
   */
  async fixNullNextMaintenanceValues(): Promise<{ fixed: number; errors: string[] }> {
    this.logger.log('[FIX] Starting repair of preventive plans with null values...');

    const planes = await this.planPreventivoRepository.find({
      relations: ['vehiculo'],
    });

    let fixed = 0;
    const errors: string[] = [];

    for (const plan of planes) {
      let needsUpdate = false;

      try {
        // Fix KM plans with null proximo_kilometraje
        if (plan.tipo_intervalo === TipoIntervalo.KM && !plan.proximo_kilometraje) {
          plan.proximo_kilometraje = plan.vehiculo.kilometraje_actual + plan.intervalo;
          needsUpdate = true;
          this.logger.log(
            `[FIX] Plan ${plan.id} (${plan.vehiculo.patente}): Setting proximo_kilometraje to ${plan.proximo_kilometraje} km`
          );
        }

        // Fix Time plans with null proxima_fecha
        if (plan.tipo_intervalo === TipoIntervalo.Tiempo && !plan.proxima_fecha) {
          const proximaFecha = new Date(plan.vehiculo.ultima_revision);
          proximaFecha.setDate(proximaFecha.getDate() + plan.intervalo);
          plan.proxima_fecha = proximaFecha;
          needsUpdate = true;
          this.logger.log(
            `[FIX] Plan ${plan.id} (${plan.vehiculo.patente}): Setting proxima_fecha to ${plan.proxima_fecha.toISOString()}`
          );
        }

        if (needsUpdate) {
          await this.planPreventivoRepository.save(plan);
          fixed++;
        }
      } catch (error) {
        const errorMsg = `Error fixing plan ${plan.id} for vehicle ${plan.vehiculo.patente}: ${error.message}`;
        this.logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    this.logger.log(`[FIX] Completed: ${fixed} plans fixed, ${errors.length} errors`);

    return { fixed, errors };
  }
}
