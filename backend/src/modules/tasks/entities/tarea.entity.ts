import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDate,
  Min,
} from "class-validator";
import { OrdenTrabajo } from "../../work-orders/entities/orden-trabajo.entity";
import { Usuario } from "../../users/entities/usuario.entity";
import { DetalleRepuesto } from "../../part-details/entities/detalle-repuesto.entity";

/**
 * Entity representing a task within a work order
 * Each work order contains multiple tasks that need to be completed
 */
@Entity("tareas")
@Index(["mecanico_asignado"]) // Index for mechanic's assigned tasks
@Index(["orden_trabajo"]) // Index for tasks by work order (foreign key)
@Index(["completada"]) // Index for filtering completed/pending tasks
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Description of the task to be performed
   */
  @Column({ type: "text" })
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  @IsString()
  descripcion: string;

  /**
   * Whether the task has been completed
   */
  @Column({ type: "boolean", default: false })
  @IsBoolean()
  completada: boolean;

  /**
   * Optional due date for the task
   */
  @Column({ type: "date", nullable: true })
  @IsOptional()
  @IsDate()
  fecha_vencimiento: Date;

  /**
   * Hours worked on this task
   * Used for labor cost calculation
   */
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Las horas trabajadas no pueden ser negativas" })
  horas_trabajadas: number;

  /**
   * Additional notes or observations about the task
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
   * Relationships
   */

  /**
   * Work order this task belongs to
   */
  @ManyToOne(() => OrdenTrabajo, (ordenTrabajo) => ordenTrabajo.tareas, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "orden_trabajo_id" })
  orden_trabajo: OrdenTrabajo;

  /**
   * Mechanic assigned to this task
   */
  @ManyToOne(() => Usuario, (usuario) => usuario.tareas_asignadas, {
    onDelete: "RESTRICT",
    nullable: true,
  })
  @JoinColumn({ name: "mecanico_id" })
  mecanico_asignado: Usuario | null;

  /**
   * Parts used in this task
   */
  @OneToMany(() => DetalleRepuesto, (detalle) => detalle.tarea, {
    cascade: true,
  })
  detalles_repuestos: DetalleRepuesto[];
}
