import { registerAs } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export default registerAs('auth', () => ({
  // Amount of days for token lifetime.
  token_lifetime: process.env.APP_AUTHENTICATION_TOKEN_LIFETIME,

  secret: process.env.APP_AUTHENTICATION_SECRET_KEY,

  // Settings for jwt generation.
  jwt_settings: {
    expiresIn: process.env.APP_AUTHENTICATION_TOKEN_LIFETIME + 'd',
  } as jwt.SignOptions,
}));
