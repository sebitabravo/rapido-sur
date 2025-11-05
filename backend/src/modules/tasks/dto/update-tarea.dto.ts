import { IsOptional, IsString, IsNumber, IsDate, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for updating an existing task
 */
export class UpdateTareaDto {
  /**
   * Task description
   */
  @IsOptional()
  @IsString()
  descripcion?: string;

  /**
   * Mechanic assigned to this task
   */
  @IsOptional()
  @IsNumber()
  mecanico_asignado_id?: number;

  /**
   * Due date for the task
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_vencimiento?: Date;

  /**
   * Hours worked on this task
   */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Las horas trabajadas no pueden ser negativas" })
  horas_trabajadas?: number;

  /**
   * Additional observations
   */
  @IsOptional()
  @IsString()
  observaciones?: string;
}
