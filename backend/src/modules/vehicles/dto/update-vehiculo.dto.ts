import { PartialType } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateVehiculoDto } from "./create-vehiculo.dto";
import { IsEnum, IsOptional } from "class-validator";
import { EstadoVehiculo } from "../../../common/enums";

/**
 * DTO for updating a vehicle
 */
export class UpdateVehiculoDto extends PartialType(CreateVehiculoDto) {
  @ApiPropertyOptional({
    description: "Estado operacional del vehículo",
    enum: EstadoVehiculo,
    example: EstadoVehiculo.Activo,
    enumName: "EstadoVehiculo",
  })
  @IsEnum(EstadoVehiculo)
  @IsOptional()
  estado?: EstadoVehiculo;
}
