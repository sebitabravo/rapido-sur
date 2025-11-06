import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

/**
 * Password strength validator
 * Requires at least 12 characters, one uppercase, one lowercase, one number, and one special character
 * Special characters allowed: @$!%*?&#
 */
@ValidatorConstraint({ name: "passwordStrength", async: false })
export class PasswordStrengthConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string) {
    if (!password) return false;

    // At least 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/;
    return regex.test(password);
  }

  defaultMessage() {
    return "La contraseña debe tener al menos 12 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (@$!%*?&#)";
  }
}

/**
 * Decorator for password strength validation
 * Usage: @IsStrongPassword()
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordStrengthConstraint,
    });
  };
}
