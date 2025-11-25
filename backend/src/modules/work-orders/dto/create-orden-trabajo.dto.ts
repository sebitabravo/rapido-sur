import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import {
  TipoOrdenTrabajo,
  PrioridadOrdenTrabajo,
} from "../../../common/enums";

/**
 * DTO for creating a work order
 */
export class CreateOrdenTrabajoDto {
  @ApiProperty({
    description: "ID del vehículo al que se le realizará el mantenimiento",
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty({ message: "El ID del vehículo es obligatorio" })
  vehiculo_id: number;

  @ApiProperty({
    description: "Tipo de orden de trabajo",
    enum: TipoOrdenTrabajo,
    example: TipoOrdenTrabajo.Preventivo,
    enumName: "TipoOrdenTrabajo",
  })
  @IsEnum(TipoOrdenTrabajo, { message: "El tipo de orden no es válido" })
  tipo: TipoOrdenTrabajo;

  @ApiPropertyOptional({
    description: "Prioridad de la orden de trabajo",
    enum: PrioridadOrdenTrabajo,
    example: PrioridadOrdenTrabajo.MEDIA,
    enumName: "PrioridadOrdenTrabajo",
    default: PrioridadOrdenTrabajo.MEDIA,
  })
  @IsOptional()
  @IsEnum(PrioridadOrdenTrabajo, { message: "La prioridad no es válida" })
  prioridad?: PrioridadOrdenTrabajo;

  @ApiProperty({
    description: "Descripción detallada del trabajo a realizar",
    example: "Mantenimiento preventivo 10.000 km - cambio de aceite y filtros",
    type: String,
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  descripcion: string;

  @ApiPropertyOptional({
    description: "Costo estimado del trabajo",
    example: 150000,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: "El costo estimado debe ser un número" })
  @Min(0, { message: "El costo estimado no puede ser negativo" })
  costo_estimado?: number;
}
