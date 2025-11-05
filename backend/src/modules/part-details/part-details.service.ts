import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DetalleRepuesto } from "./entities/detalle-repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { Repuesto } from "../parts/entities/repuesto.entity";
import { RegisterUsageDto } from "./dto/register-usage.dto";

/**
 * Service for managing part usage details
 */
@Injectable()
export class PartDetailsService {
  private readonly logger = new Logger(PartDetailsService.name);

  constructor(
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepuestoRepository: Repository<DetalleRepuesto>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Repuesto)
    private readonly repuestoRepository: Repository<Repuesto>,
  ) {}

  /**
   * Register part usage in a task
   * CRITICAL LOGIC:
   * 1. Validates task exists
   * 2. Validates part exists and has sufficient stock
   * 3. Stores historical price (precio_unitario_momento)
   * 4. Deducts stock
   * 5. Creates detail record
   */
  async registerUsage(dto: RegisterUsageDto): Promise<DetalleRepuesto> {
    // Validate task exists
    const tarea = await this.tareaRepository.findOne({
      where: { id: dto.tarea_id },
      relations: ["orden_trabajo"],
    });
    if (!tarea) {
      throw new NotFoundException("Tarea no encontrada");
    }

    // Validate task is not completed
    if (tarea.completada) {
      throw new BadRequestException(
        "No se pueden agregar repuestos a una tarea completada",
      );
    }

    // Validate part exists
    const repuesto = await this.repuestoRepository.findOne({
      where: { id: dto.repuesto_id },
    });
    if (!repuesto) {
      throw new NotFoundException("Repuesto no encontrado");
    }

    // Validate sufficient stock
    if (repuesto.cantidad_stock < dto.cantidad_usada) {
      throw new BadRequestException(
        `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.cantidad_stock}, Solicitado: ${dto.cantidad_usada}`,
      );
    }

    // CRITICAL: Store current price for historical accuracy
    const precio_unitario_momento = repuesto.precio_unitario;

    // Create detail record
    const detalle = this.detalleRepuestoRepository.create({
      tarea,
      repuesto,
      cantidad_usada: dto.cantidad_usada,
      precio_unitario_momento,
    });

    // Save detail first (to ensure transaction integrity)
    const savedDetalle = await this.detalleRepuestoRepository.save(detalle);

    // Deduct stock
    repuesto.cantidad_stock -= dto.cantidad_usada;
    await this.repuestoRepository.save(repuesto);

    this.logger.log(
      `Part usage registered: ${repuesto.codigo} x ${dto.cantidad_usada} for task ${tarea.id}. Price: $${precio_unitario_momento}`,
    );

    return savedDetalle;
  }

  /**
   * Find all part details
   */
  async findAll(): Promise<DetalleRepuesto[]> {
    return this.detalleRepuestoRepository.find({
      relations: ["tarea", "repuesto"],
    });
  }

  /**
   * Find part detail by ID
   */
  async findOne(id: number): Promise<DetalleRepuesto | null> {
    return this.detalleRepuestoRepository.findOne({
      where: { id },
      relations: ["tarea", "repuesto"],
    });
  }

  /**
   * Find all part usage for a specific task
   */
  async findByTask(tareaId: number): Promise<DetalleRepuesto[]> {
    return this.detalleRepuestoRepository.find({
      where: { tarea: { id: tareaId } },
      relations: ["repuesto"],
    });
  }

  /**
   * Calculate total cost of parts for a task
   */
  async calculateTaskPartsCost(tareaId: number): Promise<number> {
    const detalles = await this.findByTask(tareaId);
    return detalles.reduce(
      (sum, detalle) =>
        sum + detalle.cantidad_usada * detalle.precio_unitario_momento,
      0,
    );
  }
}
