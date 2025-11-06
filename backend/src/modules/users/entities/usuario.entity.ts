import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { Exclude } from "class-transformer";
import { RolUsuario } from "../../../common/enums";
import { OrdenTrabajo } from "../../work-orders/entities/orden-trabajo.entity";
import { Tarea } from "../../tasks/entities/tarea.entity";

/**
 * Entity representing a system user
 * Supports RBAC with three roles: Admin, Maintenance Manager, Mechanic
 */
@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  @IsNotEmpty({ message: "El nombre completo es obligatorio" })
  @IsString()
  nombre_completo: string;

  /**
   * Email used for login - must be unique
   */
  @Column({ type: "varchar", length: 100, unique: true })
  @IsNotEmpty({ message: "El email es obligatorio" })
  @IsEmail({}, { message: "El email debe ser válido" })
  email: string;

  /**
   * Password hash - NEVER store plain text passwords
   * Hashed with bcrypt cost factor 12
   * Excluded from JSON serialization for security
   */
  @Column({ type: "varchar", length: 255 })
  @IsNotEmpty({ message: "La contraseña es obligatoria" })
  @IsString()
  @Exclude() // Never send password_hash in HTTP responses
  password_hash: string;

  /**
   * User role - defines permissions (RBAC)
   */
  @Column({
    type: "enum",
    enum: RolUsuario,
  })
  @IsEnum(RolUsuario)
  rol: RolUsuario;

  /**
   * Account status - inactive users cannot login
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
   * Soft delete timestamp
   * When a user is deleted, this field is set to the deletion timestamp
   * Allows for data recovery and auditing
   */
  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at: Date;

  /**
   * Relationships
   */

  /**
   * Work orders assigned to this user (when user is a mechanic)
   */
  @OneToMany(() => OrdenTrabajo, (ordenTrabajo) => ordenTrabajo.mecanico)
  ordenes_asignadas: OrdenTrabajo[];

  /**
   * Tasks assigned to this user (when user is a mechanic)
   */
  @OneToMany(() => Tarea, (tarea) => tarea.mecanico_asignado)
  tareas_asignadas: Tarea[];
}
