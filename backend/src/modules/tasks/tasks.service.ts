import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tarea } from "./entities/tarea.entity";

/**
 * Service for managing tasks within work orders
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
  ) {}

  /**
   * Find all tasks
   */
  async findAll(): Promise<Tarea[]> {
    return this.tareaRepository.find({
      relations: ["orden_trabajo", "mecanico_asignado"],
    });
  }

  /**
   * Find task by ID
   */
  async findOne(id: number): Promise<Tarea | null> {
    return this.tareaRepository.findOne({
      where: { id },
      relations: ["orden_trabajo", "mecanico_asignado", "detalles_repuestos"],
    });
  }
}
