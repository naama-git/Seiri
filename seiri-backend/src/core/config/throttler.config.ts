import { registerAs } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export default registerAs(
  'throttler',
  (): ThrottlerModuleOptions => [
    {
      name: 'short',
      ttl: 1000,
      limit: 3,
    },
    {
      name: 'medium',
      ttl: 60000,
      limit: 60,
    },
  ],
);
