import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty, IsString, IsEnum, IsBoolean } from "class-validator";
import { TipoAlerta } from "../../../common/enums";
import { Vehiculo } from "../../vehicles/entities/vehiculo.entity";

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
}
