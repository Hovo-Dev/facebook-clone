import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import ExceptionHandlerFilter from './exceptions/exception-handler.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Retrieve ConfigService
  const configService = app.get(ConfigService);

  // Enable project cors
  app.enableCors(configService.get('cors'));

  // Replace nest Logger with Winston
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(
      new ExceptionHandlerFilter(httpAdapter, configService, logger),
  );

  setupSwagger(app, configService);

  await app.listen(
      Number(configService.get('app.port'))
  );
}

function setupSwagger(app: INestApplication, configService: ConfigService) {
  if (configService.get('app.swagger')) {
    const config = new DocumentBuilder()
        .setTitle('Facebook API')
        .setDescription('The Facebook API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
}

bootstrap();
