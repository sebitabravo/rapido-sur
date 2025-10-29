import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

/**
 * Password strength validator
 * Requires at least 8 characters, one uppercase, one lowercase, and one number
 */
@ValidatorConstraint({ name: "passwordStrength", async: false })
export class PasswordStrengthConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string) {
    if (!password) return false;

    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  defaultMessage() {
    return "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número";
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
