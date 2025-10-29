import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";

/**
 * Service for managing preventive maintenance plans
 */
@Injectable()
export class PreventivePlansService {
  constructor(
    @InjectRepository(PlanPreventivo)
    private readonly planPreventivoRepository: Repository<PlanPreventivo>,
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
}
