import { Controller, Get, Param } from '@nestjs/common';
// import { ReadUserDTO } from './dto/User.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @Get('findUserById/:id')
  async findUserById(@Param('id') id: string) {
    await this.userservice.getUserById(id);
  }
}
