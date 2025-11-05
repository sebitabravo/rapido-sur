import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Check,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";
import { DetalleRepuesto } from "../../part-details/entities/detalle-repuesto.entity";

/**
 * Entity representing a part/spare part in the catalog
 * Manages inventory and pricing
 */
@Entity("repuestos")
@Check('"cantidad_stock" >= 0') // Stock cannot be negative
export class Repuesto {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Part name
   */
  @Column({ type: "varchar", length: 100 })
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  @IsString()
  nombre: string;

  /**
   * Unique part code/SKU
   */
  @Column({ type: "varchar", length: 50, unique: true })
  @IsNotEmpty({ message: "El código es obligatorio" })
  @IsString()
  codigo: string;

  /**
   * Current unit price
   */
  @Column({ type: "decimal", precision: 10, scale: 2 })
  @IsNotEmpty({ message: "El precio unitario es obligatorio" })
  @IsNumber()
  @Min(0, { message: "El precio no puede ser negativo" })
  precio_unitario: number;

  /**
   * Available stock quantity
   * Cannot be negative - enforced by database check constraint
   */
  @Column({ type: "int", default: 0 })
  @IsNumber()
  @Min(0, { message: "El stock no puede ser negativo" })
  cantidad_stock: number;

  /**
   * Optional description or notes about the part
   */
  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  descripcion: string;

  /**
   * Automatic timestamps
   */
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  /**
   * Soft delete timestamp
   * When a part is deleted, this field is set to the deletion timestamp
   * Allows for data recovery and auditing
   */
  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at: Date;

  /**
   * Relationships
   */

  /**
   * Usage history of this part across all work orders
   */
  @OneToMany(() => DetalleRepuesto, (detalle) => detalle.repuesto)
  detalles: DetalleRepuesto[];
}
