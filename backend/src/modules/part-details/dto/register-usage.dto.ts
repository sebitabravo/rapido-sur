import { IsNotEmpty, IsNumber, Min } from "class-validator";

/**
 * DTO for registering part usage in a task
 * This creates a DetalleRepuesto record
 */
export class RegisterUsageDto {
  /**
   * Task ID where the part is being used
   */
  @IsNotEmpty({ message: "La tarea es obligatoria" })
  @IsNumber()
  tarea_id: number;

  /**
   * Part ID being used
   */
  @IsNotEmpty({ message: "El repuesto es obligatorio" })
  @IsNumber()
  repuesto_id: number;

  /**
   * Quantity of parts used
   */
  @IsNotEmpty({ message: "La cantidad es obligatoria" })
  @IsNumber()
  @Min(1, { message: "La cantidad debe ser al menos 1" })
  cantidad_usada: number;
}
