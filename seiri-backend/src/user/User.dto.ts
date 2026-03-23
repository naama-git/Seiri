import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
} from 'class-validator';
import { Role } from './user.entity';

export class ReadUserDto {
  readonly id: string;

  @MaxLength(100)
  @IsString()
  readonly firstName: string;

  @MaxLength(100)
  @IsString()
  readonly lastName: string;

  @IsEmail()
  readonly email: string;

  @IsEnum(Role)
  readonly role: Role;

  @IsBoolean()
  readonly isActive: boolean;
}

export class CreateUserDto extends OmitType(ReadUserDto, [
  'role',
  'isActive',
  'id',
]) {
  @IsString()
  @MaxLength(255)
  readonly password: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(ReadUserDto, ['id', 'role', 'isActive'] as const),
) {}

export class LoginUserDTO extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}
