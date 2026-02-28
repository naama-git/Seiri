import { Body, Controller, Get, Param } from '@nestjs/common';
// import { ReadUserDTO } from './dto/User.dto';
import { UserService } from './user.service';
// import { Observable } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @Get('findUserById/:id')
  async findUserById(@Param('id') id: number) {
    return this.userservice.findUserById(id);
  }
  @Get('findUserByEmail')
  async findUserByEmail(@Body() email: string) {
    return this.userservice.findUserByEmail(email);
  }
}
