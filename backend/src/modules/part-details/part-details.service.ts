import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DetalleRepuesto } from "./entities/detalle-repuesto.entity";

/**
 * Service for managing part usage details
 */
@Injectable()
export class PartDetailsService {
  constructor(
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepuestoRepository: Repository<DetalleRepuesto>,
  ) {}

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
}
