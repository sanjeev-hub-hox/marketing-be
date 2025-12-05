import { IsString, IsEmail, IsOptional, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';

@ValidatorConstraint({ name: 'isStringOrNumber', async: false })
export class IsStringOrNumber implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return typeof value === 'string' || typeof value === 'number';
  }

  defaultMessage(args: ValidationArguments) {
    return 'Age must be a string or a number';
  }
}

export class createTestSchema {
  @IsString()
  Name: string;

  @IsEmail()
  Email: string;

  @Validate(IsStringOrNumber)
  Age: string | number;

  @IsString()
  Address: string;

  @IsOptional()
  @IsString()
  uniqueField?: string;
}

export class updateTestSchema {
  @IsString()
  Name: string;

  @IsEmail()
  Email: string;

  @Validate(IsStringOrNumber)
  Age: number;

  @IsString()
  Address: string;

  @IsString()
  uniqueField: string;
}