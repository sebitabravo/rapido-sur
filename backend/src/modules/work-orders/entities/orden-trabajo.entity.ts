import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";
import { TipoOrdenTrabajo, EstadoOrdenTrabajo } from "../../../common/enums";
import { Vehiculo } from "../../vehicles/entities/vehiculo.entity";
import { Usuario } from "../../users/entities/usuario.entity";
import { Tarea } from "../../tasks/entities/tarea.entity";
import { DetalleRepuesto } from "../../part-details/entities/detalle-repuesto.entity";

/**
 * Entity representing a work order (core of the system)
 * Manages vehicle maintenance - both preventive and corrective
 * State flow: PENDIENTE → ASIGNADA → EN_PROGRESO → FINALIZADA
 */
@Entity("ordenes_trabajo")
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Work order number - unique identifier
   * Format: OT-YYYY-NNNNN (e.g., OT-2025-00001)
   */
  @Column({ type: "varchar", length: 20, unique: true })
  @IsNotEmpty({ message: "El número de OT es obligatorio" })
  @IsString()
  numero_ot: string;

  /**
   * Work order type - preventive or corrective
   */
  @Column({
    type: "enum",
    enum: TipoOrdenTrabajo,
  })
  @IsEnum(TipoOrdenTrabajo)
  tipo: TipoOrdenTrabajo;

  /**
   * Detailed description of work to be performed
   */
  @Column({ type: "text" })
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  @IsString()
  descripcion: string;

  /**
   * Current work order state
   * Unidirectional flow: Pendiente → Asignada → EnProgreso → Finalizada
   */
  @Column({
    type: "enum",
    enum: EstadoOrdenTrabajo,
    default: EstadoOrdenTrabajo.Pendiente,
  })
  @IsEnum(EstadoOrdenTrabajo)
  estado: EstadoOrdenTrabajo;

  /**
   * When the work order was created
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_creacion: Date;

  /**
   * When the work order was closed/completed
   * Null if still open
   */
  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  fecha_cierre: Date;

  /**
   * Total cost of work order (parts + labor)
   * Calculated when closing the work order
   */
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0, { message: "El costo total no puede ser negativo" })
  costo_total: number;

  /**
   * Additional observations or notes
   */
  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  observaciones: string;

  /**
   * Automatic timestamps
   */
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  /**
   * Soft delete timestamp
   * When a work order is deleted, this field is set to the deletion timestamp
   * Allows for data recovery and auditing
   */
  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at: Date;

  /**
   * Relationships
   */

  /**
   * Vehicle this work order belongs to
   */
  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.ordenes_trabajo, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "vehiculo_id" })
  vehiculo: Vehiculo;

  /**
   * Mechanic assigned to this work order
   */
  @ManyToOne(() => Usuario, (usuario) => usuario.ordenes_asignadas, {
    onDelete: "RESTRICT",
    nullable: true,
  })
  @JoinColumn({ name: "mecanico_id" })
  mecanico: Usuario;

  /**
   * Tasks within this work order
   */
  @OneToMany(() => Tarea, (tarea) => tarea.orden_trabajo, {
    cascade: true,
  })
  tareas: Tarea[];

  /**
   * Parts used in this work order
   */
  @OneToMany(() => DetalleRepuesto, (detalleRepuesto) => detalleRepuesto.tarea)
  detalles_repuestos: DetalleRepuesto[];

  /**
   * Computed property: vehicle downtime in days
   * Calculates difference between fecha_cierre and fecha_creacion
   * Returns null if work order is still open
   */
  get dias_inactividad(): number | null {
    if (!this.fecha_cierre) {
      return null;
    }

    const diffTime = Math.abs(
      this.fecha_cierre.getTime() - this.fecha_creacion.getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
