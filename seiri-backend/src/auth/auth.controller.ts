import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDTO, ReadUserDto } from 'src/user/User.dto';
import type { AuthenticatedUser, LoginResponse } from './auth.interface';
import { currentUser } from './current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { User } from 'src/user/user.entity';
import { serialize } from 'src/user/user.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @serialize(ReadUserDto)
  @Post('login')
  async login(@Body() loginDto: LoginUserDTO): Promise<LoginResponse> {
    return await this.authService.logIn(loginDto);
  }

  @serialize(ReadUserDto)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.register(createUserDto);
  }

  @serialize(ReadUserDto)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@currentUser() user: AuthenticatedUser) {
    return user;
  }
}
