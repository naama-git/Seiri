import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { AuthenticatedUser, JwtPayload } from './auth.interface';
import { UserService } from 'src/user/user.service';
import { BusinessException } from 'src/core/exception.model';

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findUserById(payload.sub);
    if (!user) {
      throw new BusinessException(
        'Unauthorized',
        401,
        'User not found',
        'validate',
        'JwtStrategy',
      );
    }
    const { id, name, email, role } = user;
    return { userId: id, username: name, userEmail: email, role };
  }
}
