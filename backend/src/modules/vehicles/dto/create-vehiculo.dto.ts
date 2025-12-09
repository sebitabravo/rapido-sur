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
    description: "Patente del vehículo (formatos chilenos: XXXX12 antiguo, XX-XX-12 o XXXX-12 nuevo)",
    example: "ABCD-12",
    type: String,
    minLength: 6,
    maxLength: 10,
    pattern: "^([A-Z]{4}[0-9]{2}|[A-Z]{2}-[A-Z]{2}-[0-9]{2}|[A-Z]{4}-[0-9]{2})$",
  })
  @IsNotEmpty({ message: "La patente es obligatoria" })
  @IsString()
  @Length(6, 10, { message: "La patente debe tener entre 6 y 10 caracteres" })
  @Matches(/^([A-Z]{4}[0-9]{2}|[A-Z]{2}-[A-Z]{2}-[0-9]{2}|[A-Z]{4}-[0-9]{2})$/i, {
    message:
      "Formato de patente chilena inválido. Use formato AA-BB-12 o ABCD-12",
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
    maximum: 9999999,
  })
  @IsInt()
  @Min(0, { message: "El kilometraje no puede ser negativo" })
  @Max(9999999, { message: "El kilometraje no puede superar 9.999.999 km" })
  @IsOptional()
  kilometraje_actual?: number;
}
