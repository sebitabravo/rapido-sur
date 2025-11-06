import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  Length,
  IsOptional,
  Matches,
} from "class-validator";

/**
 * DTO for creating a vehicle
 */
export class CreateVehiculoDto {
  @ApiProperty({
    description: "Patente del vehículo en formato chileno con guiones (XX-XX-12 o XXXX-12)",
    example: "ABCD-12",
    type: String,
    minLength: 7,
    maxLength: 10,
    pattern: "^([A-Z]{2}-[A-Z]{2}-[0-9]{2}|[A-Z]{4}-[0-9]{2})$",
  })
  @IsNotEmpty({ message: "La patente es obligatoria" })
  @IsString()
  @Length(7, 10, { message: "La patente debe tener entre 7 y 10 caracteres" })
  @Matches(/^([A-Z]{2}-[A-Z]{2}-[0-9]{2}|[A-Z]{4}-[0-9]{2})$/i, {
    message:
      "La patente debe ser formato chileno válido con guiones (XX-XX-12 o XXXX-12)",
  })
  patente: string;

  @ApiProperty({
    description: "Marca del vehículo",
    example: "Mercedes-Benz",
    type: String,
  })
  @IsNotEmpty({ message: "La marca es obligatoria" })
  @IsString()
  marca: string;

  @ApiProperty({
    description: "Modelo del vehículo",
    example: "Citaro",
    type: String,
  })
  @IsNotEmpty({ message: "El modelo es obligatorio" })
  @IsString()
  modelo: string;

  @ApiProperty({
    description: "Año de fabricación del vehículo",
    example: 2023,
    type: Number,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  @IsInt()
  @Min(1900, { message: "El año debe ser mayor a 1900" })
  @Max(new Date().getFullYear() + 1, {
    message: "El año no puede ser mayor al año próximo",
  })
  anno: number;

  @ApiPropertyOptional({
    description: "Kilometraje actual del vehículo",
    example: 5000,
    type: Number,
    minimum: 0,
  })
  @IsInt()
  @Min(0, { message: "El kilometraje no puede ser negativo" })
  @IsOptional()
  kilometraje_actual?: number;
}
