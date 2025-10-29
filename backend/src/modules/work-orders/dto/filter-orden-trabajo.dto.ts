import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { EstadoOrdenTrabajo, TipoOrdenTrabajo } from "../../../common/enums";

/**
 * DTO for filtering work orders
 */
export class FilterOrdenTrabajoDto {
  @ApiPropertyOptional({
    description: "Filtrar por ID de vehículo",
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  vehiculo_id?: number;

  @ApiPropertyOptional({
    description: "Filtrar por estado de la orden",
    enum: EstadoOrdenTrabajo,
    example: EstadoOrdenTrabajo.EnProgreso,
    enumName: "EstadoOrdenTrabajo",
  })
  @IsOptional()
  @IsEnum(EstadoOrdenTrabajo)
  estado?: EstadoOrdenTrabajo;

  @ApiPropertyOptional({
    description: "Filtrar por tipo de orden",
    enum: TipoOrdenTrabajo,
    example: TipoOrdenTrabajo.Preventivo,
    enumName: "TipoOrdenTrabajo",
  })
  @IsOptional()
  @IsEnum(TipoOrdenTrabajo)
  tipo?: TipoOrdenTrabajo;

  @ApiPropertyOptional({
    description: "Fecha de inicio del rango de búsqueda (ISO 8601)",
    example: "2025-01-01",
    type: String,
    format: "date",
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin del rango de búsqueda (ISO 8601)",
    example: "2025-01-31",
    type: String,
    format: "date",
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: "Filtrar por ID del mecánico asignado",
    example: 3,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mecanico_id?: number;
}
