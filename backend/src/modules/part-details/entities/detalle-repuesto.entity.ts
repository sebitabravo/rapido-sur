import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { Tarea } from "../../tasks/entities/tarea.entity";
import { Repuesto } from "../../parts/entities/repuesto.entity";

/**
 * Entity representing the many-to-many relationship between Tasks and Parts
 * Stores historical pricing for accurate cost reporting
 */
@Entity("detalles_repuestos")
export class DetalleRepuesto {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Quantity of parts used in the task
   */
  @Column({ type: "int" })
  @IsNotEmpty({ message: "La cantidad es obligatoria" })
  @IsNumber()
  @Min(1, { message: "La cantidad debe ser al menos 1" })
  cantidad_usada: number;

  /**
   * Unit price at the moment of usage
   * CRITICAL: Store historical price for accurate cost reporting
   * Even if the part price changes later, this preserves the actual cost
   */
  @Column({ type: "decimal", precision: 10, scale: 2 })
  @IsNotEmpty({ message: "El precio unitario es obligatorio" })
  @IsNumber()
  @Min(0, { message: "El precio no puede ser negativo" })
  precio_unitario_momento: number;

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
   * Task where this part was used
   */
  @ManyToOne(() => Tarea, (tarea) => tarea.detalles_repuestos, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "tarea_id" })
  tarea: Tarea;

  /**
   * Part that was used
   */
  @ManyToOne(() => Repuesto, (repuesto) => repuesto.detalles, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "repuesto_id" })
  repuesto: Repuesto;
}
