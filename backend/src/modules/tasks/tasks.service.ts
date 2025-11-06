import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tarea } from "./entities/tarea.entity";
import { OrdenTrabajo } from "../work-orders/entities/orden-trabajo.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { CreateTareaDto } from "./dto/create-tarea.dto";
import { UpdateTareaDto } from "./dto/update-tarea.dto";
import { MarkCompletedDto } from "./dto/mark-completed.dto";
import { RolUsuario, EstadoOrdenTrabajo } from "../../common/enums";

/**
 * Service for managing tasks within work orders
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(OrdenTrabajo)
    private readonly otRepository: Repository<OrdenTrabajo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Create new task
   */
  async create(createDto: CreateTareaDto): Promise<Tarea> {
    // Validate work order exists
    const ordenTrabajo = await this.otRepository.findOne({
      where: { id: createDto.orden_trabajo_id },
    });
    if (!ordenTrabajo) {
      throw new NotFoundException("Orden de trabajo no encontrada");
    }

    // Validate work order is not finalized
    if (ordenTrabajo.estado === EstadoOrdenTrabajo.Finalizada) {
      throw new BadRequestException(
        "No se pueden agregar tareas a una orden finalizada",
      );
    }

    // Validate mechanic if provided
    let mecanicoAsignado: Usuario | null = null;
    if (createDto.mecanico_asignado_id) {
      mecanicoAsignado = await this.usuarioRepository.findOne({
        where: { id: createDto.mecanico_asignado_id },
      });
      if (!mecanicoAsignado) {
        throw new NotFoundException("Mecánico no encontrado");
      }
      if (
        ![RolUsuario.Mecanico, RolUsuario.JefeMantenimiento].includes(
          mecanicoAsignado.rol,
        )
      ) {
        throw new BadRequestException(
          "El usuario debe ser mecánico o jefe de mantenimiento",
        );
      }
    }

    // Create task
    const tarea = this.tareaRepository.create({
      descripcion: createDto.descripcion,
      orden_trabajo: ordenTrabajo,
      mecanico_asignado: mecanicoAsignado,
      fecha_vencimiento: createDto.fecha_vencimiento,
      horas_trabajadas: createDto.horas_trabajadas,
      observaciones: createDto.observaciones,
      completada: false,
    });

    return this.tareaRepository.save(tarea);
  }

  /**
   * Update existing task
   */
  async update(
    id: number,
    updateDto: UpdateTareaDto,
    user: Usuario,
  ): Promise<Tarea> {
    const tarea = await this.tareaRepository.findOne({
      where: { id },
      relations: ["orden_trabajo", "mecanico_asignado"],
    });

    if (!tarea) {
      throw new NotFoundException("Tarea no encontrada");
    }

    // Validate task is not completed
    if (tarea.completada) {
      throw new BadRequestException(
        "No se puede modificar una tarea completada",
      );
    }

    // Validate work order is not finalized
    if (tarea.orden_trabajo.estado === EstadoOrdenTrabajo.Finalizada) {
      throw new BadRequestException(
        "No se pueden modificar tareas de una orden finalizada",
      );
    }

    // Validate mechanic permission
    if (
      user.rol === RolUsuario.Mecanico &&
      tarea.mecanico_asignado?.id !== user.id
    ) {
      throw new ForbiddenException(
        "No tienes permiso para modificar esta tarea",
      );
    }

    // Update mechanic if provided
    if (updateDto.mecanico_asignado_id !== undefined) {
      if (updateDto.mecanico_asignado_id === null) {
        tarea.mecanico_asignado = null;
      } else {
        const mecanico = await this.usuarioRepository.findOne({
          where: { id: updateDto.mecanico_asignado_id },
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
            "El usuario debe ser mecánico o jefe de mantenimiento",
          );
        }
        tarea.mecanico_asignado = mecanico;
      }
    }

    // Update other fields
    if (updateDto.descripcion !== undefined) {
      tarea.descripcion = updateDto.descripcion;
    }
    if (updateDto.fecha_vencimiento !== undefined) {
      tarea.fecha_vencimiento = updateDto.fecha_vencimiento;
    }
    if (updateDto.horas_trabajadas !== undefined) {
      tarea.horas_trabajadas = updateDto.horas_trabajadas;
    }
    if (updateDto.observaciones !== undefined) {
      tarea.observaciones = updateDto.observaciones;
    }

    return this.tareaRepository.save(tarea);
  }

  /**
   * Mark task as completed
   */
  async markAsCompleted(
    id: number,
    dto: MarkCompletedDto,
    user: Usuario,
  ): Promise<Tarea> {
    const tarea = await this.tareaRepository.findOne({
      where: { id },
      relations: ["orden_trabajo", "mecanico_asignado"],
    });

    if (!tarea) {
      throw new NotFoundException("Tarea no encontrada");
    }

    // Validate task is not already completed
    if (tarea.completada) {
      throw new BadRequestException("La tarea ya está completada");
    }

    // Validate work order is not finalized
    if (tarea.orden_trabajo.estado === EstadoOrdenTrabajo.Finalizada) {
      throw new BadRequestException(
        "No se pueden completar tareas de una orden finalizada",
      );
    }

    // Validate mechanic permission
    if (
      user.rol === RolUsuario.Mecanico &&
      tarea.mecanico_asignado?.id !== user.id
    ) {
      throw new ForbiddenException(
        "Solo el mecánico asignado puede completar esta tarea",
      );
    }

    // Mark as completed
    tarea.completada = true;

    // Add final observations if provided
    if (dto.observaciones_finales) {
      tarea.observaciones = tarea.observaciones
        ? `${tarea.observaciones}\n[FINALIZADO] ${dto.observaciones_finales}`
        : `[FINALIZADO] ${dto.observaciones_finales}`;
    }

    return this.tareaRepository.save(tarea);
  }

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
