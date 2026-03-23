import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDTO } from 'src/user/User.dto';
import type { AuthenticatedUser, LoginResponse } from './auth.interface';
import { currentUser } from './current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginUserDTO): Promise<LoginResponse> {
    return await this.authService.logIn(loginDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return await this.authService.register(createUserDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@currentUser() user: AuthenticatedUser) {
    return user;
  }
}
