import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsStrongPassword } from "../../../common/validators/password-strength.validator";

/**
 * DTO for changing user password
 */
export class ChangePasswordDto {
  @ApiProperty({
    description:
      "Nueva contraseña segura (mínimo 8 caracteres, una mayúscula, una minúscula, un número, un carácter especial)",
    example: "NewSecurePass123!",
    type: String,
    minLength: 8,
    format: "password",
  })
  @IsString()
  @IsStrongPassword()
  nueva_password: string;
}
