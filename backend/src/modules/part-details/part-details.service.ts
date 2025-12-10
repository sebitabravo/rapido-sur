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
import { InventoryAlertsService } from "../parts/inventory-alerts.service";

// Type for part info used in low stock alerts
interface PartStockInfo {
  id: number;
  codigo: string;
  nombre: string;
  cantidad_stock: number;
  stock_minimo: number;
}

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
    private readonly inventoryAlertsService: InventoryAlertsService,
  ) { }

  /**
   * Register part usage in a task
   * CRITICAL LOGIC:
   * 1. Validates task exists
   * 2. Validates part exists and has sufficient stock
   * 3. Stores historical price (precio_unitario_momento)
   * 4. Deducts stock
   * 5. Creates detail record
   * 6. Checks if stock fell below minimum and sends alert
   * All operations wrapped in database transaction for data consistency
   */
  async registerUsage(dto: RegisterUsageDto): Promise<DetalleRepuesto> {
    // Execute transaction and get both result and part info
    const { savedDetalle, partInfo } = await this.detalleRepuestoRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Validate task exists
        const tarea = await transactionalEntityManager.findOne(Tarea, {
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
        const repuesto = await transactionalEntityManager.findOne(Repuesto, {
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
        const detalle = transactionalEntityManager.create(DetalleRepuesto, {
          tarea,
          repuesto,
          cantidad_usada: dto.cantidad_usada,
          precio_unitario_momento,
        });

        // Save detail record
        const result = await transactionalEntityManager.save(
          DetalleRepuesto,
          detalle,
        );

        // Deduct stock atomically
        repuesto.cantidad_stock -= dto.cantidad_usada;
        await transactionalEntityManager.save(Repuesto, repuesto);

        this.logger.log(
          `Part usage registered: ${repuesto.codigo} x ${dto.cantidad_usada} for task ${tarea.id}. Price: $${precio_unitario_momento}`,
        );

        // Return both result and part info for low stock check
        const partStockInfo: PartStockInfo = {
          id: repuesto.id,
          codigo: repuesto.codigo,
          nombre: repuesto.nombre,
          cantidad_stock: repuesto.cantidad_stock,
          stock_minimo: repuesto.stock_minimo,
        };

        return { savedDetalle: result, partInfo: partStockInfo };
      },
    );

    // After transaction commits, check if stock fell below minimum
    if (partInfo.cantidad_stock <= partInfo.stock_minimo) {
      this.logger.warn(
        `Stock for ${partInfo.codigo} (${partInfo.cantidad_stock}) is at or below minimum (${partInfo.stock_minimo})`
      );

      // Send alert asynchronously (don't block the response)
      this.inventoryAlertsService.notifyLowStockPart(partInfo).catch((error) => {
        this.logger.error(`Failed to send low stock alert for ${partInfo.codigo}:`, error);
      });
    }

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
