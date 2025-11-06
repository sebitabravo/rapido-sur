import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/**
 * DTO for user login
 */
export class LoginDto {
  @ApiProperty({
    description: "Email del usuario registrado en el sistema",
    example: "admin@rapidosur.cl",
    type: String,
    format: "email",
  })
  @IsEmail({}, { message: "El email debe ser válido" })
  @IsNotEmpty({ message: "El email es obligatorio" })
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "Admin123!",
    type: String,
    minLength: 6,
    format: "password",
  })
  @IsString()
  @IsNotEmpty({ message: "La contraseña es obligatoria" })
  password: string;
}
