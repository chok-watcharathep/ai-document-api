// src/common/filters/http-exception.filter.ts
import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError } from '@/common/interfaces/api-error.interface';
import { ApiErrorCode } from '@/common/enums/api-error-code.enum';

@Catch() // Catches all exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: HttpStatus;
    let message: string;
    let code: string;
    let details: Record<string, any> | string[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // If the exception response is an object (our custom error format)
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const errorBody = exceptionResponse as {
          message: string | string[];
          statusCode: number;
          error?: string; // Standard NestJS error field for default exceptions
          code?: string;
          details?: Record<string, any>[];
        };

        message = Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : errorBody.message || errorBody.error || 'An error occurred';
        code =
          errorBody.code ||
          HttpStatus[statusCode].toUpperCase().replace(/ /g, '_'); // Fallback to HTTP status name
        details = errorBody.details || [];
      } else {
        // For simple string messages thrown by HttpException
        message = exceptionResponse as unknown as string;
        code = HttpStatus[statusCode].toUpperCase().replace(/ /g, '_');
      }
    } else {
      // For unexpected errors that are not HttpExceptions
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      code = ApiErrorCode.INTERNAL_SERVER_ERROR;
      this.logger.error(
        `Unhandled exception: ${exception as string}`,
        (exception as Error)?.stack,
      );
    }

    const errorResponse: ApiError = {
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }), // Only add details if present
    };

    response.status(statusCode).json(errorResponse);
  }
}
