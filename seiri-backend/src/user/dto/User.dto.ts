import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, Length, MaxLength } from 'class-validator';
import { User } from '../user.entity';

export class CreateUserDto {
  @MaxLength(100)
  firstName: string;

  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @Length(6, 255)
  password: string;
}
export class LoginUserDTO extends OmitType(CreateUserDto, ['firstName', 'lastName']) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ReadUserDTO extends OmitType(CreateUserDto, ['password']) {
  constructor(entity: User | null) {
    if (!entity) return;
    super();
    this.id = entity.id;
    this.email = entity.email;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.role = entity.role;
  }

  id: number;
  role: 'User' | 'Admin';
  isActive: boolean;
}
