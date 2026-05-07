import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.SECRET_KEY || 'default_secret_key',
}));
