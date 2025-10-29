import { PartialType, OmitType } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateUsuarioDto } from "./create-usuario.dto";
import { IsBoolean, IsOptional } from "class-validator";

/**
 * DTO for updating user
 * All fields are optional, password cannot be updated here
 */
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ["password"] as const),
) {
  @ApiPropertyOptional({
    description: "Estado activo/inactivo del usuario",
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
