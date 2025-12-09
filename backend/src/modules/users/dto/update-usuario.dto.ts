import { PartialType, OmitType } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateUsuarioDto } from "./create-usuario.dto";
import { IsBoolean, IsOptional, IsString } from "class-validator";

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

  @ApiPropertyOptional({
    description: "Avatar del usuario (ID predefinido: avatar-1 a avatar-12, o URL custom)",
    example: "avatar-3",
    type: String,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: "Recibir notificaciones por email",
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  notif_email?: boolean;

  @ApiPropertyOptional({
    description: "Recibir alertas de mantenimiento por email",
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  notif_mantenimiento?: boolean;

  @ApiPropertyOptional({
    description: "Recibir reportes semanales por email",
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  notif_reportes_semanales?: boolean;
}
