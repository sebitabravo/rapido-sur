import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { EstadoVehiculo } from "../../../common/enums";

/**
 * DTO for filtering vehicles with pagination
 */
export class FilterVehiculoDto {
  @ApiPropertyOptional({
    description: "Número de página para paginación",
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de resultados por página",
    example: 10,
    type: Number,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Filtrar por estado del vehículo",
    enum: EstadoVehiculo,
    example: EstadoVehiculo.Activo,
    enumName: "EstadoVehiculo",
  })
  @IsOptional()
  @IsEnum(EstadoVehiculo)
  estado?: EstadoVehiculo;

  @ApiPropertyOptional({
    description: "Filtrar por marca del vehículo",
    example: "Mercedes-Benz",
    type: String,
  })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({
    description: "Filtrar por patente del vehículo",
    example: "ABCD12",
    type: String,
  })
  @IsOptional()
  @IsString()
  patente?: string;
}
