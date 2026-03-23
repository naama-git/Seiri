import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { serialize } from './user.interceptor';
import { ReadUserDto } from './User.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @serialize(ReadUserDto)
  @Get('findUserById/:id')
  async findUserById(@Param('id') id: string) {
    await this.userservice.getUserById(id);
  }
}
