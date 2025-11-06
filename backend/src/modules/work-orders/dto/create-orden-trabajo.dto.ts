import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { TipoOrdenTrabajo } from "../../../common/enums";

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
}
