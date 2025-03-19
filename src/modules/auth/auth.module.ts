import { Module } from '@nestjs/common';
import AuthService from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import authConfig from '../../config/auth';
import { AuthController } from './controllers/auth.controller';
import { UserRepository } from '../database/repositories/user.repository';
import { AuthTokenRepository } from '../database/repositories/auth-token.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: ConfigType<typeof authConfig>) => {
        return {
          secret: config.secret,
          signOptions: config.jwt_settings,
        };
      },
      inject: [authConfig.KEY],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenRepository, UserRepository],
  exports: [JwtModule, AuthTokenRepository],
})
export class AuthModule {}
