// src/main.ts
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // Import your custom filter
import { ApiErrorCode } from './common/enums/api-error-code.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe using class-validator
  // This pipe will automatically transform validation errors into a BadRequestException
  // which our HttpExceptionFilter will then format.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // Customize validation error response here if needed,
        // though the HttpExceptionFilter handles it well already.
        return new BadRequestException({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      },
    }),
  );

  // --- Register Global Exception Filter ---
  app.useGlobalFilters(new HttpExceptionFilter());
  // --- End Global Exception Filter ---

  app.enableCors();

  // --- Swagger Setup ---
  const config = new DocumentBuilder()
    .setTitle('NestJS Supabase API')
    .setDescription('API documentation for the AI Document API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // --- End Swagger Setup ---

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}
bootstrap();
