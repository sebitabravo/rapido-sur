import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDate,
  Min,
} from "class-validator";
import { TipoIntervalo } from "../../../common/enums";
import { Vehiculo } from "../../vehicles/entities/vehiculo.entity";

/**
 * Entity representing a preventive maintenance plan for a vehicle
 * Defines maintenance intervals based on mileage or time
 * Automatically recalculated when preventive work order is closed
 */
@Entity("planes_preventivos")
export class PlanPreventivo {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Type of maintenance (e.g., "Oil Change", "Brake Inspection")
   */
  @Column({ type: "varchar", length: 100 })
  @IsNotEmpty({ message: "El tipo de mantenimiento es obligatorio" })
  @IsString()
  tipo_mantenimiento: string;

  /**
   * Interval type - based on mileage (KM) or time (TIEMPO)
   */
  @Column({
    type: "enum",
    enum: TipoIntervalo,
  })
  @IsEnum(TipoIntervalo)
  tipo_intervalo: TipoIntervalo;

  /**
   * Interval value
   * - If tipo_intervalo is KM: kilometers between maintenance
   * - If tipo_intervalo is TIEMPO: days between maintenance
   */
  @Column({ type: "int" })
  @IsNotEmpty({ message: "El intervalo es obligatorio" })
  @IsNumber()
  @Min(1, { message: "El intervalo debe ser mayor a 0" })
  intervalo: number;

  /**
   * Detailed description of the maintenance to be performed
   */
  @Column({ type: "text" })
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  @IsString()
  descripcion: string;

  /**
   * Next scheduled mileage for maintenance
   * Only used when tipo_intervalo is KM
   */
  @Column({ type: "int", nullable: true })
  @IsOptional()
  @IsNumber()
  proximo_kilometraje: number;

  /**
   * Next scheduled date for maintenance
   * Only used when tipo_intervalo is TIEMPO
   */
  @Column({ type: "date", nullable: true })
  @IsOptional()
  @IsDate()
  proxima_fecha: Date;

  /**
   * Whether this plan is currently active
   */
  @Column({ type: "boolean", default: true })
  @IsBoolean()
  activo: boolean;

  /**
   * Automatic timestamps
   */
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  /**
   * Relationships
   */

  /**
   * Vehicle this preventive plan belongs to
   * Each vehicle has one preventive plan
   */
  @OneToOne(() => Vehiculo, (vehiculo) => vehiculo.plan_preventivo, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "vehiculo_id" })
  vehiculo: Vehiculo;
}
