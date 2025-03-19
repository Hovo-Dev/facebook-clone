import { registerAs } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export default registerAs(
  'cors',
  (): CorsOptions => ({
    origin: [
      new RegExp('^(https:\/\/)?[a-z0-9]+\.facebook\.com:?.*$', 'u'),
      new RegExp('^(https?:\/\/)?localhost:?.*$', 'u'),
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: false,
    maxAge: 0,
    preflightContinue: false,
  }),
);
