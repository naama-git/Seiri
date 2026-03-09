import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDTO } from 'src/user/dto/User.dto';
import type { AuthenticatedUser, LoginResponse } from './auth.interface';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginUserDTO): Promise<LoginResponse> {
    return await this.authService.logIn(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@CurrentUser() user:AuthenticatedUser) {
    return user;
  }
}
