import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { OrdenTrabajo } from "./entities/orden-trabajo.entity";
import {
  PaginatedResult,
  createPaginatedResponse,
} from "../../common/dto/pagination.dto";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { PlanPreventivo } from "../preventive-plans/entities/plan-preventivo.entity";
import { DetalleRepuesto } from "../part-details/entities/detalle-repuesto.entity";
import { Repuesto } from "../parts/entities/repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { CreateOrdenTrabajoDto } from "./dto/create-orden-trabajo.dto";
import { UpdateOrdenTrabajoDto } from "./dto/update-orden-trabajo.dto";
import { AsignarMecanicoDto } from "./dto/asignar-mecanico.dto";
import {
  RegistrarTrabajoDto,
  RepuestoUsadoDto,
} from "./dto/registrar-trabajo.dto";
import { FilterOrdenTrabajoDto } from "./dto/filter-orden-trabajo.dto";
import {
  EstadoOrdenTrabajo,
  TipoOrdenTrabajo,
  RolUsuario,
  EstadoVehiculo,
  TipoIntervalo,
} from "../../common/enums";

/**
 * Service for managing work orders
 * Core business logic for vehicle maintenance management
 */
@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly otRepo: Repository<OrdenTrabajo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(PlanPreventivo)
    private readonly planRepo: Repository<PlanPreventivo>,
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepo: Repository<DetalleRepuesto>,
    @InjectRepository(Repuesto)
    private readonly repuestoRepo: Repository<Repuesto>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create new work order with auto-generated number
   */
  async create(createDto: CreateOrdenTrabajoDto): Promise<OrdenTrabajo> {
    // Validate vehicle exists
    const vehiculo = await this.vehiculoRepo.findOne({
      where: { id: createDto.vehiculo_id },
    });
    if (!vehiculo) {
      throw new NotFoundException("Vehículo no encontrado");
    }

    // Generate automatic work order number: OT-2025-00001
    const numeroOt = await this.generarNumeroOT();

    // Create work order
    const orden = this.otRepo.create({
      numero_ot: numeroOt,
      tipo: createDto.tipo,
      prioridad: createDto.prioridad,
      descripcion: createDto.descripcion,
      costo_estimado: createDto.costo_estimado,
      vehiculo,
      estado: EstadoOrdenTrabajo.Pendiente,
    });

    return this.otRepo.save(orden);
  }

  /**
   * Update work order
   * Only allows updating orders in Pendiente state
   */
  async update(
    id: number,
    updateDto: UpdateOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    const orden = await this.findOne(id);

    // Validate state - only Pendiente orders can be updated
    if (orden.estado !== EstadoOrdenTrabajo.Pendiente) {
      throw new BadRequestException(
        `No se puede modificar una orden en estado ${orden.estado}. Solo se pueden modificar órdenes en estado Pendiente.`,
      );
    }

    // If vehicle is being changed, validate it exists
    if (updateDto.vehiculo_id && updateDto.vehiculo_id !== orden.vehiculo.id) {
      const vehiculo = await this.vehiculoRepo.findOne({
        where: { id: updateDto.vehiculo_id },
      });
      if (!vehiculo) {
        throw new NotFoundException("Vehículo no encontrado");
      }
      orden.vehiculo = vehiculo;
    }

    // Update fields if provided
    if (updateDto.tipo !== undefined) {
      orden.tipo = updateDto.tipo;
    }
    if (updateDto.prioridad !== undefined) {
      orden.prioridad = updateDto.prioridad;
    }
    if (updateDto.descripcion !== undefined) {
      orden.descripcion = updateDto.descripcion;
    }
    if (updateDto.costo_estimado !== undefined) {
      orden.costo_estimado = updateDto.costo_estimado;
    }

    const updated = await this.otRepo.save(orden);
    this.logger.log(
      `Work order updated: ${updated.numero_ot} - Changes applied`,
    );

    return updated;
  }

  /**
   * Assign mechanic to work order
   * Changes state to ASIGNADA automatically
   */
  async asignarMecanico(
    id: number,
    dto: AsignarMecanicoDto,
  ): Promise<OrdenTrabajo> {
    const orden = await this.findOne(id);

    // Validate user exists and is mechanic
    const mecanico = await this.usuarioRepo.findOne({
      where: { id: dto.mecanico_id },
    });
    if (!mecanico) {
      throw new NotFoundException("Mecánico no encontrado");
    }
    if (
      ![RolUsuario.Mecanico, RolUsuario.JefeMantenimiento].includes(
        mecanico.rol,
      )
    ) {
      throw new BadRequestException(
        "El usuario debe ser mecánico o supervisor",
      );
    }

    // Validate state transition
    if (orden.estado !== EstadoOrdenTrabajo.Pendiente) {
      throw new BadRequestException(
        `No se puede asignar una OT en estado ${orden.estado}`,
      );
    }

    // Assign and change state
    orden.mecanico = mecanico;
    orden.estado = EstadoOrdenTrabajo.Asignada;

    return this.otRepo.save(orden);
  }

  /**
   * Register work - add parts and update vehicle mileage
   */
  async registrarTrabajo(
    id: number,
    dto: RegistrarTrabajoDto,
    user: Usuario,
  ): Promise<OrdenTrabajo> {
    const orden = await this.otRepo.findOne({
      where: { id },
      relations: ["mecanico", "vehiculo", "tareas", "tareas.detalles_repuestos"],
    });

    if (!orden) {
      throw new NotFoundException("Orden de trabajo no encontrada");
    }

    // Validate mechanic is assigned
    if (user.rol === RolUsuario.Mecanico && orden.mecanico?.id !== user.id) {
      throw new ForbiddenException("No tienes permiso para modificar esta OT");
    }

    // Change to EN_PROGRESO if in ASIGNADA
    if (orden.estado === EstadoOrdenTrabajo.Asignada) {
      orden.estado = EstadoOrdenTrabajo.EnProgreso;
    }

    // Add used parts
    if (dto.repuestos && dto.repuestos.length > 0) {
      for (const repuestoDto of dto.repuestos) {
        await this.agregarRepuesto(orden, repuestoDto);
      }
    }

    // Update vehicle mileage if provided
    if (dto.kilometraje_actual) {
      if (dto.kilometraje_actual < orden.vehiculo.kilometraje_actual) {
        throw new BadRequestException(
          "El kilometraje no puede ser menor al actual",
        );
      }
      orden.vehiculo.kilometraje_actual = dto.kilometraje_actual;
      await this.vehiculoRepo.save(orden.vehiculo);
    }

    // Add observations
    if (dto.observaciones) {
      orden.observaciones = orden.observaciones
        ? `${orden.observaciones}\n${dto.observaciones}`
        : dto.observaciones;
    }

    return this.otRepo.save(orden);
  }

  /**
   * Close work order
   * Calculates costs and recalculates preventive plan
   */
  async cerrar(id: number): Promise<OrdenTrabajo> {
    const orden = await this.otRepo.findOne({
      where: { id },
      relations: [
        "vehiculo",
        "vehiculo.plan_preventivo",
        "tareas",
        "tareas.detalles_repuestos",
      ],
    });

    if (!orden) {
      throw new NotFoundException("Orden de trabajo no encontrada");
    }

    // Validate state is EN_PROGRESO
    if (orden.estado !== EstadoOrdenTrabajo.EnProgreso) {
      throw new BadRequestException(
        "Solo se pueden cerrar órdenes en progreso",
      );
    }

    // Validate all tasks are completed
    const tareasIncompletas = orden.tareas.filter((t) => !t.completada);
    if (tareasIncompletas.length > 0) {
      throw new BadRequestException(
        "No se puede cerrar la OT con tareas incompletas",
      );
    }

    // Calculate total cost (parts + labor)
    // 1. Parts cost
    const todosLosDetalles = orden.tareas.flatMap((t) => t.detalles_repuestos || []);
    const costoRepuestos = todosLosDetalles.reduce(
      (sum, detalle) =>
        sum + detalle.cantidad_usada * detalle.precio_unitario_momento,
      0,
    );

    // 2. Labor cost (hours worked * hourly rate)
    const laborCostPerHour = this.configService.get<number>("LABOR_COST_PER_HOUR", 15000);
    const totalHorasTrabajadas = orden.tareas.reduce(
      (sum, tarea) => sum + (tarea.horas_trabajadas || 0),
      0,
    );
    const costoManoObra = totalHorasTrabajadas * laborCostPerHour;

    this.logger.log(
      `Costo calculado para OT ${orden.numero_ot}: Repuestos=${costoRepuestos} CLP, Mano de obra=${costoManoObra} CLP (${totalHorasTrabajadas}h * ${laborCostPerHour} CLP/h)`
    );

    orden.costo_total = costoRepuestos + costoManoObra;

    // Set close date
    orden.fecha_cierre = new Date();

    // If PREVENTIVO, recalculate next maintenance
    if (
      orden.tipo === TipoOrdenTrabajo.Preventivo &&
      orden.vehiculo.plan_preventivo
    ) {
      await this.recalcularPlanPreventivo(orden.vehiculo);
    }

    // Mark vehicle as available
    orden.vehiculo.estado = EstadoVehiculo.Activo;
    orden.vehiculo.ultima_revision = new Date();
    await this.vehiculoRepo.save(orden.vehiculo);

    // Change state to FINALIZADA
    orden.estado = EstadoOrdenTrabajo.Finalizada;

    const saved = await this.otRepo.save(orden);
    this.logger.log(
      `Work order closed: ${saved.numero_ot} for vehicle ${saved.vehiculo.patente} - Type: ${saved.tipo}, Cost: $${saved.costo_total}`,
    );

    return saved;
  }

  /**
   * Find all work orders with filters and pagination
   */
  async findAll(
    filters: FilterOrdenTrabajoDto,
  ): Promise<PaginatedResult<OrdenTrabajo>> {
    const qb = this.otRepo
      .createQueryBuilder("ot")
      .leftJoinAndSelect("ot.vehiculo", "v")
      .leftJoinAndSelect("ot.mecanico", "m")
      .leftJoinAndSelect("ot.tareas", "t");

    if (filters.vehiculo_id) {
      qb.andWhere("ot.vehiculo_id = :vehiculoId", {
        vehiculoId: filters.vehiculo_id,
      });
    }
    if (filters.estado) {
      qb.andWhere("ot.estado = :estado", { estado: filters.estado });
    }
    if (filters.tipo) {
      qb.andWhere("ot.tipo = :tipo", { tipo: filters.tipo });
    }
    if (filters.fecha_inicio) {
      qb.andWhere("ot.fecha_creacion >= :fechaInicio", {
        fechaInicio: filters.fecha_inicio,
      });
    }
    if (filters.fecha_fin) {
      qb.andWhere("ot.fecha_creacion <= :fechaFin", {
        fechaFin: filters.fecha_fin,
      });
    }
    if (filters.mecanico_id) {
      qb.andWhere("ot.mecanico_id = :mecanicoId", {
        mecanicoId: filters.mecanico_id,
      });
    }

    qb.orderBy("ot.fecha_creacion", "DESC");

    // Apply pagination
    qb.skip(filters.skip).take(filters.limit);

    // Get items and total count
    const [items, total] = await qb.getManyAndCount();

    return createPaginatedResponse(
      items,
      total,
      filters.page ?? 1,
      filters.limit ?? 10,
    );
  }

  /**
   * Find work order by ID
   */
  async findOne(id: number): Promise<OrdenTrabajo> {
    const orden = await this.otRepo.findOne({
      where: { id },
      relations: [
        "vehiculo",
        "mecanico",
        "tareas",
        "tareas.detalles_repuestos",
        "tareas.detalles_repuestos.repuesto",
      ],
    });

    if (!orden) {
      throw new NotFoundException("Orden de trabajo no encontrada");
    }

    return orden;
  }

  /**
   * Generate automatic work order number: OT-2025-00001
   */
  private async generarNumeroOT(): Promise<string> {
    const year = new Date().getFullYear();

    // Find last work order of the year
    const ultimaOt = await this.otRepo
      .createQueryBuilder("ot")
      .where("ot.numero_ot LIKE :pattern", { pattern: `OT-${year}-%` })
      .orderBy("ot.numero_ot", "DESC")
      .getOne();

    let numero = 1;
    if (ultimaOt) {
      // Extract number from OT-2025-00123 → 123
      const matches = ultimaOt.numero_ot.match(/OT-\d{4}-(\d+)/);
      if (matches) {
        numero = parseInt(matches[1], 10) + 1;
      }
    }

    // Format: OT-2025-00001
    return `OT-${year}-${numero.toString().padStart(5, "0")}`;
  }

  /**
   * Add part to work order and deduct stock
   */
  private async agregarRepuesto(
    orden: OrdenTrabajo,
    repuestoDto: RepuestoUsadoDto,
  ): Promise<void> {
    // Find part
    const repuesto = await this.repuestoRepo.findOne({
      where: { id: repuestoDto.repuesto_id },
    });
    if (!repuesto) {
      throw new NotFoundException(
        `Repuesto ${repuestoDto.repuesto_id} no encontrado`,
      );
    }

    // Validate available stock
    if (repuesto.cantidad_stock < repuestoDto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.cantidad_stock}`,
      );
    }

    // Find tarea
    const tarea = await this.tareaRepo.findOne({
      where: { id: repuestoDto.tarea_id },
    });
    if (!tarea) {
      throw new NotFoundException("Tarea no encontrada");
    }

    // Create detail with current price
    const detalle = this.detalleRepo.create({
      tarea,
      repuesto,
      cantidad_usada: repuestoDto.cantidad,
      precio_unitario_momento: repuesto.precio_unitario,
    });
    await this.detalleRepo.save(detalle);

    // Deduct stock
    repuesto.cantidad_stock -= repuestoDto.cantidad;
    await this.repuestoRepo.save(repuesto);
  }

  /**
   * Recalculate preventive plan
   */
  private async recalcularPlanPreventivo(vehiculo: Vehiculo): Promise<void> {
    const plan = vehiculo.plan_preventivo;
    if (!plan) return;

    if (plan.tipo_intervalo === TipoIntervalo.KM) {
      // Calculate next km: current + interval
      plan.proximo_kilometraje = vehiculo.kilometraje_actual + plan.intervalo;
    } else if (plan.tipo_intervalo === TipoIntervalo.Tiempo) {
      // Calculate next date: today + interval (days)
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + plan.intervalo);
      plan.proxima_fecha = proximaFecha;
    }

    await this.planRepo.save(plan);
  }

  /**
   * Update work order status
   * Allows manual status changes when needed
   */
  async updateStatus(
    id: number,
    nuevoEstado: EstadoOrdenTrabajo,
  ): Promise<OrdenTrabajo> {
    const orden = await this.findOne(id);

    this.logger.log(
      `Updating work order ${id} status from ${orden.estado} to ${nuevoEstado}`,
    );

    // Update estado
    orden.estado = nuevoEstado;
    await this.otRepo.save(orden);

    // Return updated order with relations
    return this.findOne(id);
  }
}
