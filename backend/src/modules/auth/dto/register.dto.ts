import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { RolUsuario } from "../../../common/enums";
import { IsStrongPassword } from "../../../common/validators/password-strength.validator";

/**
 * DTO for user registration (admin only)
 */
export class RegisterDto {
  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Juan Pérez Mecánico",
    type: String,
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "El nombre completo es obligatorio" })
  @IsString()
  nombre_completo: string;

  @ApiProperty({
    description: "Email único del usuario",
    example: "nuevo.mecanico@rapidosur.cl",
    type: String,
    format: "email",
    uniqueItems: true,
  })
  @IsEmail({}, { message: "El email debe ser válido" })
  @IsNotEmpty({ message: "El email es obligatorio" })
  email: string;

  @ApiProperty({
    description:
      "Contraseña segura (mínimo 8 caracteres, una mayúscula, una minúscula, un número, un carácter especial)",
    example: "SecurePass123!",
    type: String,
    minLength: 8,
    format: "password",
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: "Rol del usuario en el sistema",
    enum: RolUsuario,
    example: RolUsuario.Mecanico,
    enumName: "RolUsuario",
  })
  @IsEnum(RolUsuario, { message: "El rol no es válido" })
  rol: RolUsuario;
}
