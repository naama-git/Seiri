import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import bcrypt from 'bcrypt';
import { BusinessException } from 'src/core/exception.model';
import { CreateUserDto, LoginUserDTO } from 'src/user/User.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayload, LoginResponse } from './auth.interface';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async register(user: CreateUserDto): Promise<User> {
    const existingUser = await this.userService.findRawUserByEmail(user.email);
    if (existingUser) {
      throw new BusinessException(
        'User data error',
        HttpStatus.BAD_REQUEST,
        'User already exist',
      );
    }
    const hashPass: string = await this.hashPassword(user.password);
    return await this.userService.createUser({
      ...user,
      password: hashPass,
    });
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async logIn(user: LoginUserDTO): Promise<LoginResponse> {
    const existingUser = await this.userService.findRawUserByEmail(user.email);
    if (!existingUser) {
      throw new BusinessException(
        'User not found',
        HttpStatus.BAD_REQUEST,
        'User not found',
      );
    }
    const isMatch = await bcrypt.compare(user.password, existingUser.password);

    if (!isMatch) {
      throw new BusinessException(
        'Authentication failed',
        HttpStatus.UNAUTHORIZED,
        'Invalid email or password',
      );
    }

    const payload: JwtPayload = {
      username: existingUser.firstName + ' ' + existingUser.lastName,
      sub: existingUser.id,
      role: existingUser.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: existingUser.id,
        userEmail: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role,
      },
    };
  }
}
