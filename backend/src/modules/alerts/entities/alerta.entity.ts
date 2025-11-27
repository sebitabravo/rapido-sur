import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional } from "class-validator";
import { TipoAlerta, EstadoAlerta } from "../../../common/enums";
import { Vehiculo } from "../../vehicles/entities/vehiculo.entity";
import { OrdenTrabajo } from "../../work-orders/entities/orden-trabajo.entity";
import { Usuario } from "../../users/entities/usuario.entity";

/**
 * Entity representing a preventive maintenance alert
 * Generated automatically by cron job when vehicle approaches maintenance due
 */
@Entity("alertas")
export class Alerta {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Type of alert - based on mileage or time
   */
  @Column({
    type: "enum",
    enum: TipoAlerta,
  })
  @IsEnum(TipoAlerta)
  tipo_alerta: TipoAlerta;

  /**
   * Alert message describing the maintenance needed
   */
  @Column({ type: "text" })
  @IsNotEmpty({ message: "El mensaje es obligatorio" })
  @IsString()
  mensaje: string;

  /**
   * When the alert was generated
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_generacion: Date;

  /**
   * Whether notification email has been sent
   * Prevents duplicate emails
   */
  @Column({ type: "boolean", default: false })
  @IsBoolean()
  email_enviado: boolean;

  /**
   * Current state of the alert
   */
  @Column({
    type: "enum",
    enum: EstadoAlerta,
    default: EstadoAlerta.Activa,
  })
  @IsEnum(EstadoAlerta)
  estado: EstadoAlerta;

  /**
   * Reason for dismissing the alert (if dismissed)
   */
  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  razon_descarte?: string;

  /**
   * When the alert was dismissed
   */
  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  fecha_descarte?: Date;

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
   * Vehicle this alert is for
   */
  @ManyToOne(() => Vehiculo, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "vehiculo_id" })
  vehiculo: Vehiculo;

  /**
   * Work order created from this alert (if any)
   */
  @ManyToOne(() => OrdenTrabajo, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "orden_trabajo_id" })
  @IsOptional()
  orden_trabajo?: OrdenTrabajo;

  /**
   * User who dismissed this alert (if dismissed)
   */
  @ManyToOne(() => Usuario, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "descartada_por_id" })
  @IsOptional()
  descartada_por?: Usuario;
}
