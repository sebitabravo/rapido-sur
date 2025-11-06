import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for creating a new task
 */
export class CreateTareaDto {
  /**
   * Task description
   */
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  @IsString()
  descripcion: string;

  /**
   * Work order ID this task belongs to
   */
  @IsNotEmpty({ message: "La orden de trabajo es obligatoria" })
  @IsNumber()
  orden_trabajo_id: number;

  /**
   * Optional: Mechanic assigned to this task
   */
  @IsOptional()
  @IsNumber()
  mecanico_asignado_id?: number;

  /**
   * Optional: Due date for the task
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_vencimiento?: Date;

  /**
   * Optional: Hours worked on this task
   */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Las horas trabajadas no pueden ser negativas" })
  horas_trabajadas?: number;

  /**
   * Optional: Additional observations
   */
  @IsOptional()
  @IsString()
  observaciones?: string;
}
