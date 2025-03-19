import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.APP_PORT || 3000,
  env: process.env.NODE_ENV || process.env.APP_ENV || 'local',
  debug: process.env.APP_DEBUG,
  swagger: process.env.APP_SWAGGER_ENABLED,
}));
