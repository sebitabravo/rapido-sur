import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for a part used in work order
 */
export class RepuestoUsadoDto {
  @ApiProperty({
    description: "ID del repuesto utilizado",
    example: 1,
    type: Number,
  })
  @IsInt()
  repuesto_id: number;

  @ApiProperty({
    description: "Cantidad del repuesto utilizado",
    example: 2,
    type: Number,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: "La cantidad debe ser al menos 1" })
  cantidad: number;

  @ApiProperty({
    description: "ID de la tarea a la que pertenece este repuesto",
    example: 1,
    type: Number,
  })
  @IsInt()
  tarea_id: number;
}

/**
 * DTO for registering work on a work order
 */
export class RegistrarTrabajoDto {
  @ApiPropertyOptional({
    description: "Lista de repuestos utilizados en el trabajo",
    type: [RepuestoUsadoDto],
    example: [
      { repuesto_id: 1, cantidad: 2, tarea_id: 1 },
      { repuesto_id: 3, cantidad: 4, tarea_id: 1 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepuestoUsadoDto)
  repuestos?: RepuestoUsadoDto[];

  @ApiPropertyOptional({
    description: "Kilometraje actualizado del vehículo después del trabajo",
    example: 15500,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  kilometraje_actual?: number;

  @ApiPropertyOptional({
    description: "Observaciones adicionales sobre el trabajo realizado",
    example: "Trabajo completado sin inconvenientes. Vehículo en óptimas condiciones.",
    type: String,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
