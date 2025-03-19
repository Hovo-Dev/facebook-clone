import { Module } from '@nestjs/common';
import { ConfigModule } from './config.module';
import { LoggerModule } from './logger.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
  ],
})
export class BaseModule {}
