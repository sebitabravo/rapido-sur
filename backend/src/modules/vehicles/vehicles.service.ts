import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vehiculo } from "./entities/vehiculo.entity";
import { CreateVehiculoDto } from "./dto/create-vehiculo.dto";
import { UpdateVehiculoDto } from "./dto/update-vehiculo.dto";
import { FilterVehiculoDto } from "./dto/filter-vehiculo.dto";
import { EstadoVehiculo, EstadoOrdenTrabajo } from "../../common/enums";

/**
 * Service for managing vehicles
 * Handles CRUD operations and business logic
 */
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
  ) {}

  /**
   * Create new vehicle
   */
  async create(createDto: CreateVehiculoDto): Promise<Vehiculo> {
    // Validate unique patente
    const existente = await this.vehiculoRepo.findOne({
      where: { patente: createDto.patente.toUpperCase() },
    });
    if (existente) {
      throw new ConflictException("Ya existe un vehículo con esa patente");
    }

    // Validate Chilean patente format
    if (!this.validarFormatoPatente(createDto.patente)) {
      throw new BadRequestException(
        "Formato de patente inválido. Use formato AA-BB-12 o ABCD-12",
      );
    }

    const vehiculo = this.vehiculoRepo.create({
      ...createDto,
      patente: createDto.patente.toUpperCase(),
      kilometraje_actual: createDto.kilometraje_actual || 0,
    });

    return this.vehiculoRepo.save(vehiculo);
  }

  /**
   * Find all vehicles with pagination and filters
   */
  async findAll(filters: FilterVehiculoDto): Promise<{
    items: Vehiculo[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const { page = 1, limit = 10, estado, marca, patente } = filters;

    const qb = this.vehiculoRepo.createQueryBuilder("v");

    if (estado) {
      qb.andWhere("v.estado = :estado", { estado });
    }
    if (marca) {
      qb.andWhere("v.marca ILIKE :marca", { marca: `%${marca}%` });
    }
    if (patente) {
      qb.andWhere("v.patente ILIKE :patente", { patente: `%${patente}%` });
    }

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy("v.created_at", "DESC");

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * Find vehicle by ID with relations
   */
  async findOne(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepo.findOne({
      where: { id },
      relations: ["ordenes_trabajo", "plan_preventivo"],
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return vehiculo;
  }

  /**
   * Get complete vehicle history with calculations
   */
  async getHistorial(id: number): Promise<{
    vehiculo: Vehiculo;
    ordenes: any[];
    costoTotal: number;
    tiempoInactividadTotal: number;
  }> {
    const vehiculo = await this.vehiculoRepo
      .createQueryBuilder("v")
      .leftJoinAndSelect("v.ordenes_trabajo", "ot")
      .where("v.id = :id", { id })
      .orderBy("ot.fecha_creacion", "DESC")
      .getOne();

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    const costoTotal = vehiculo.ordenes_trabajo.reduce(
      (sum, ot) => sum + Number(ot.costo_total),
      0,
    );

    const tiempoInactividadTotal = vehiculo.ordenes_trabajo
      .filter((ot) => ot.dias_inactividad !== null)
      .reduce((sum, ot) => sum + (ot.dias_inactividad || 0), 0);

    return {
      vehiculo,
      ordenes: vehiculo.ordenes_trabajo,
      costoTotal,
      tiempoInactividadTotal,
    };
  }

  /**
   * Update vehicle
   */
  async update(id: number, updateDto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);

    // Validate mileage increase
    if (
      updateDto.kilometraje_actual &&
      updateDto.kilometraje_actual < vehiculo.kilometraje_actual
    ) {
      throw new BadRequestException(
        "El nuevo kilometraje no puede ser menor al actual",
      );
    }

    Object.assign(vehiculo, updateDto);

    if (updateDto.patente) {
      vehiculo.patente = updateDto.patente.toUpperCase();
    }

    return this.vehiculoRepo.save(vehiculo);
  }

  /**
   * Soft delete vehicle
   */
  async remove(id: number): Promise<void> {
    const vehiculo = await this.vehiculoRepo
      .createQueryBuilder("v")
      .leftJoin("v.ordenes_trabajo", "ot")
      .where("v.id = :id", { id })
      .andWhere("ot.estado IN (:...estados)", {
        estados: [EstadoOrdenTrabajo.EnProgreso, EstadoOrdenTrabajo.Asignada],
      })
      .getCount();

    if (vehiculo > 0) {
      throw new BadRequestException(
        "No se puede eliminar un vehículo con órdenes de trabajo activas",
      );
    }

    const veh = await this.findOne(id);
    veh.estado = EstadoVehiculo.Inactivo;
    await this.vehiculoRepo.save(veh);
  }

  /**
   * Validate Chilean patente format
   * Old format: AA-BB-12
   * New format: ABCD-12
   */
  private validarFormatoPatente(patente: string): boolean {
    const regex = /^([A-Z]{2}-[A-Z]{2}-\d{2}|[A-Z]{4}-\d{2})$/i;
    return regex.test(patente);
  }
}
