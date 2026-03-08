import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
