import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EstadoOrdenTrabajo } from "../../../common/enums/estado-orden-trabajo.enum";

/**
 * DTO para actualizar el estado de una orden de trabajo
 */
export class UpdateStatusDto {
  @ApiProperty({
    description: "Nuevo estado de la orden de trabajo",
    enum: EstadoOrdenTrabajo,
    example: EstadoOrdenTrabajo.EnProgreso,
  })
  @IsEnum(EstadoOrdenTrabajo, {
    message:
      "Estado debe ser uno de: Pendiente, Asignada, EnProgreso, Finalizada",
  })
  @IsNotEmpty({ message: "El estado es obligatorio" })
  estado: EstadoOrdenTrabajo;
}
