import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO for registering part usage in a task
 * This creates a DetalleRepuesto record
 */
export class RegisterUsageDto {
  /**
   * Task ID where the part is being used
   */
  @ApiProperty({
    description: "ID de la tarea",
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: "La tarea es obligatoria" })
  @Type(() => Number)
  @IsNumber()
  tarea_id: number;

  /**
   * Part ID being used
   */
  @ApiProperty({
    description: "ID del repuesto",
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: "El repuesto es obligatorio" })
  @Type(() => Number)
  @IsNumber()
  repuesto_id: number;

  /**
   * Quantity of parts used
   */
  @ApiProperty({
    description: "Cantidad de repuestos utilizados",
    example: 2,
    type: Number,
    minimum: 1,
  })
  @IsNotEmpty({ message: "La cantidad es obligatoria" })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: "La cantidad debe ser al menos 1" })
  cantidad_usada: number;
}
