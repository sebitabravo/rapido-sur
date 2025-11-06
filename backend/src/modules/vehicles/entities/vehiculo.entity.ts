import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  Length,
  Min,
  Max,
} from "class-validator";
import { EstadoVehiculo } from "../../../common/enums";
import { OrdenTrabajo } from "../../work-orders/entities/orden-trabajo.entity";
import { PlanPreventivo } from "../../preventive-plans/entities/plan-preventivo.entity";

/**
 * Entity representing a vehicle in the fleet
 * Each vehicle has maintenance history, preventive plan, and current status
 */
@Entity("vehiculos")
@Index(["estado"]) // Index for filtering active/inactive vehicles
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * License plate - unique identifier
   * Supports both current and new Chilean formats (max 10 chars)
   */
  @Column({ type: "varchar", length: 10, unique: true })
  @IsNotEmpty({ message: "La patente es obligatoria" })
  @IsString()
  @Length(6, 10, { message: "La patente debe tener entre 6 y 10 caracteres" })
  patente: string;

  @Column({ type: "varchar", length: 50 })
  @IsNotEmpty({ message: "La marca es obligatoria" })
  @IsString()
  marca: string;

  @Column({ type: "varchar", length: 50 })
  @IsNotEmpty({ message: "El modelo es obligatorio" })
  @IsString()
  modelo: string;

  /**
   * Manufacturing year
   */
  @Column({ type: "int" })
  @IsNotEmpty({ message: "El año es obligatorio" })
  @IsNumber()
  @Min(1900, { message: "El año debe ser mayor a 1900" })
  @Max(new Date().getFullYear() + 1, {
    message: "El año no puede ser mayor al año próximo",
  })
  anno: number;

  /**
   * Current mileage in kilometers
   */
  @Column({ type: "int", default: 0 })
  @IsNumber()
  @Min(0, { message: "El kilometraje no puede ser negativo" })
  kilometraje_actual: number;

  /**
   * Current vehicle status
   */
  @Column({
    type: "enum",
    enum: EstadoVehiculo,
    default: EstadoVehiculo.Activo,
  })
  @IsEnum(EstadoVehiculo)
  estado: EstadoVehiculo;

  /**
   * Date of last maintenance/revision
   */
  @Column({ type: "date", nullable: true })
  @IsDate()
  ultima_revision: Date;

  /**
   * Automatic timestamps
   */
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  /**
   * Soft delete timestamp
   * When a vehicle is deleted, this field is set to the deletion timestamp
   * Allows for data recovery and auditing
   */
  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at: Date;

  /**
   * Relationships
   */

  /**
   * Work orders associated with this vehicle
   * A vehicle can have multiple work orders over time
   */
  @OneToMany(() => OrdenTrabajo, (ordenTrabajo) => ordenTrabajo.vehiculo)
  ordenes_trabajo: OrdenTrabajo[];

  /**
   * Preventive maintenance plan for this vehicle
   * Each vehicle has one active preventive plan
   */
  @OneToOne(() => PlanPreventivo, (planPreventivo) => planPreventivo.vehiculo, {
    cascade: true,
  })
  plan_preventivo: PlanPreventivo;
}
