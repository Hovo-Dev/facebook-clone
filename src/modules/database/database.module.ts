import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import databaseConfig from "./../../config/database";

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
