import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp } = winston.format;

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        format: combine(timestamp(), winston.format.json()),
        transports: [new winston.transports.Console()],
      }),
    }),
  ],
})
export class LoggerModule {}
