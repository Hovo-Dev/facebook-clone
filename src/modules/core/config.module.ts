import { Module } from '@nestjs/common';
import { ConfigModule as CoreConfigModule } from '@nestjs/config';
import EnvironmentEnum from '../../enums/environment.enum';
import appConfig from '../../config/app';
import databaseConfig from '../../config/database';
import hashingConfig from '../../config/hashing';
import authConfig from '../../config/auth';
import corsConfig from '../../config/cors';

import * as Joi from 'joi';

const envSchema = Joi.object({
  // Core settings
  NODE_ENV: Joi.string()
    .optional()
    .valid(...Object.values(EnvironmentEnum)),

  // App settings
  APP_ENV: Joi.string()
    .optional()
    .valid(...Object.values(EnvironmentEnum))
    .default(EnvironmentEnum.LOCAL),
  APP_PORT: Joi.number().port().default(3000),
  APP_DEBUG: Joi.boolean().default(true),
  APP_SWAGGER_ENABLED: Joi.boolean().default(true),

  // JWT Settings
  APP_AUTHENTICATION_TOKEN_LIFETIME: Joi.number().optional(),
  APP_AUTHENTICATION_SECRET_KEY: Joi.string(),

  // Hashing settings
  APP_KEY: Joi.string(),

  // DB settings
  DB_CONNECTION: Joi.string().valid('postgres', 'testing'),
  DB_TYPE: Joi.string().optional().valid('postgres', 'sqlite'),
  DB_PORT: Joi.number().optional().port().default(5432),
  DB_HOST: Joi.string().optional(),
  DB_USERNAME: Joi.string(),
  DB_PASSWORD: Joi.string().optional(),
  DB_NAME: Joi.string(),
});

@Module({
  imports: [
    CoreConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      expandVariables: true,
      validate: (environment: Record<string, any>) => {
        // If environment is testing, then set DB connection to testing.
        if (environment.NODE_ENV === EnvironmentEnum.TESTING) {
          environment.DB_CONNECTION = 'testing';
        }

        // Run joi validation with conversions.
        const result = envSchema.validate(environment, {
          abortEarly: true,
          allowUnknown: true,
          convert: true,
        });

        // Check for errors.
        if (result.error) {
          throw result.error;
        }

        return result.value;
      },
      // Attach new files if required.
      load: [
        appConfig,
        databaseConfig,
        hashingConfig,
        authConfig,
        corsConfig,
      ],
    }),
  ],
})
export class ConfigModule {}
