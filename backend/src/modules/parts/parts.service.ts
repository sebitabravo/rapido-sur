import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Repuesto } from "./entities/repuesto.entity";
import { CreateRepuestoDto } from "./dto/create-repuesto.dto";
import { UpdateRepuestoDto } from "./dto/update-repuesto.dto";

/**
 * Service for managing parts inventory
 */
@Injectable()
export class PartsService {
  private readonly logger = new Logger(PartsService.name);

  constructor(
    @InjectRepository(Repuesto)
    private readonly repuestoRepository: Repository<Repuesto>,
  ) {}

  /**
   * Create new part
   */
  async create(createDto: CreateRepuestoDto): Promise<Repuesto> {
    // Validate code is unique
    const exists = await this.repuestoRepository.findOne({
      where: { codigo: createDto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un repuesto con el código ${createDto.codigo}`,
      );
    }

    // Create part
    const repuesto = this.repuestoRepository.create({
      nombre: createDto.nombre,
      codigo: createDto.codigo,
      precio_unitario: createDto.precio_unitario,
      cantidad_stock: createDto.cantidad_stock || 0,
      descripcion: createDto.descripcion,
    });

    const saved = await this.repuestoRepository.save(repuesto);
    this.logger.log(
      `New part created: ${saved.codigo} - ${saved.nombre}, Stock: ${saved.cantidad_stock}`,
    );

    return saved;
  }

  /**
   * Update existing part
   */
  async update(id: number, updateDto: UpdateRepuestoDto): Promise<Repuesto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) {
      throw new NotFoundException("Repuesto no encontrado");
    }

    // Validate code uniqueness if being changed
    if (updateDto.codigo && updateDto.codigo !== repuesto.codigo) {
      const exists = await this.repuestoRepository.findOne({
        where: { codigo: updateDto.codigo },
      });
      if (exists) {
        throw new ConflictException(
          `Ya existe un repuesto con el código ${updateDto.codigo}`,
        );
      }
    }

    // Update fields
    if (updateDto.nombre !== undefined) {
      repuesto.nombre = updateDto.nombre;
    }
    if (updateDto.codigo !== undefined) {
      repuesto.codigo = updateDto.codigo;
    }
    if (updateDto.precio_unitario !== undefined) {
      repuesto.precio_unitario = updateDto.precio_unitario;
    }
    if (updateDto.cantidad_stock !== undefined) {
      repuesto.cantidad_stock = updateDto.cantidad_stock;
    }
    if (updateDto.descripcion !== undefined) {
      repuesto.descripcion = updateDto.descripcion;
    }

    const saved = await this.repuestoRepository.save(repuesto);
    this.logger.log(`Part updated: ${saved.codigo} - ${saved.nombre}`);

    return saved;
  }

  /**
   * Deduct stock for a part
   * CRITICAL: Used when registering parts in work orders
   */
  async deductStock(id: number, cantidad: number): Promise<Repuesto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) {
      throw new NotFoundException("Repuesto no encontrado");
    }

    // Validate sufficient stock
    if (repuesto.cantidad_stock < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.cantidad_stock}, Solicitado: ${cantidad}`,
      );
    }

    // Deduct stock
    repuesto.cantidad_stock -= cantidad;

    // Database check constraint ensures stock cannot be negative
    const saved = await this.repuestoRepository.save(repuesto);
    this.logger.log(
      `Stock deducted: ${saved.codigo} - ${cantidad} units. New stock: ${saved.cantidad_stock}`,
    );

    return saved;
  }

  /**
   * Add stock for a part
   * Used when receiving new inventory
   */
  async addStock(id: number, cantidad: number): Promise<Repuesto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) {
      throw new NotFoundException("Repuesto no encontrado");
    }

    if (cantidad <= 0) {
      throw new BadRequestException("La cantidad debe ser mayor a cero");
    }

    // Add stock
    repuesto.cantidad_stock += cantidad;

    const saved = await this.repuestoRepository.save(repuesto);
    this.logger.log(
      `Stock added: ${saved.codigo} + ${cantidad} units. New stock: ${saved.cantidad_stock}`,
    );

    return saved;
  }

  /**
   * Find all parts
   */
  async findAll(): Promise<Repuesto[]> {
    return this.repuestoRepository.find();
  }

  /**
   * Find part by ID
   */
  async findOne(id: number): Promise<Repuesto | null> {
    return this.repuestoRepository.findOne({ where: { id } });
  }

  /**
   * Find part by code
   */
  async findByCode(codigo: string): Promise<Repuesto | null> {
    return this.repuestoRepository.findOne({ where: { codigo } });
  }

  /**
   * Find parts with low stock
   * Useful for inventory alerts
   */
  async findLowStock(threshold: number = 10): Promise<Repuesto[]> {
    return this.repuestoRepository
      .createQueryBuilder("repuesto")
      .where("repuesto.cantidad_stock <= :threshold", { threshold })
      .orderBy("repuesto.cantidad_stock", "ASC")
      .getMany();
  }
}
