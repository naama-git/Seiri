import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, Length, MaxLength } from 'class-validator';
import { User } from '../user.entity';

export class CreateUserDto {
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @Length(6, 255)
  password: string;
}
export class LoginUserDTO extends OmitType(CreateUserDto, ['name']) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ReadUserDTO extends OmitType(CreateUserDto, ['password']) {
  constructor(entity: User | null) {
    if (!entity) return;
    super();
    this.id = entity.id;
    this.email = entity.email;
    this.name = entity.name;
    this.role = entity.role;
  }

  id: number;
  role: 'User' | 'Admin';
  isActive: boolean;
}
