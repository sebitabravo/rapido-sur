import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

/**
 * DTO for assigning a mechanic to a work order
 */
export class AsignarMecanicoDto {
  @ApiProperty({
    description: "ID del mecánico que se asignará a la orden de trabajo",
    example: 3,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty({ message: "El ID del mecánico es obligatorio" })
  mecanico_id: number;
}
