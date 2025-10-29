import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Repuesto } from "./entities/repuesto.entity";

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
}
