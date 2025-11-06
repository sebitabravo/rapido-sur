import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from "class-validator";

/**
 * DTO for creating a new part
 */
export class CreateRepuestoDto {
  /**
   * Part name
   */
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  @IsString()
  nombre: string;

  /**
   * Unique part code/SKU
   */
  @IsNotEmpty({ message: "El código es obligatorio" })
  @IsString()
  codigo: string;

  /**
   * Unit price
   */
  @IsNotEmpty({ message: "El precio unitario es obligatorio" })
  @IsNumber()
  @Min(0, { message: "El precio no puede ser negativo" })
  precio_unitario: number;

  /**
   * Initial stock quantity
   */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "El stock no puede ser negativo" })
  cantidad_stock?: number;

  /**
   * Optional description
   */
  @IsOptional()
  @IsString()
  descripcion?: string;
}
