import { IsDateString, IsInt, IsOptional } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for filtering reports
 */
export class FilterReportDto {
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  vehiculo_id?: number;
}
