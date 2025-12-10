import { IsOptional, IsString, IsNumber, Min } from "class-validator";

/**
 * DTO for updating an existing part
 */
export class UpdateRepuestoDto {
  /**
   * Part name
   */
  @IsOptional()
  @IsString()
  nombre?: string;

  /**
   * Unique part code/SKU
   */
  @IsOptional()
  @IsString()
  codigo?: string;

  /**
   * Unit price
   */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "El precio no puede ser negativo" })
  precio_unitario?: number;

  /**
   * Stock quantity
   */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "El stock no puede ser negativo" })
  cantidad_stock?: number;

  /**
   * Description
   */
  @IsOptional()
  @IsString()
  descripcion?: string;

  /**
   * Part category
   */
  @IsOptional()
  @IsString()
  categoria?: string;

  /**
   * Minimum stock level for alerts
   */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "El stock mínimo no puede ser negativo" })
  stock_minimo?: number;
}
