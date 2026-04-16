import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Lazy Prisma import to avoid module resolution errors before client is generated
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Prisma } = require('@prisma/client');

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let code: string | undefined = 'INTERNAL_ERROR';

    // ── HttpException (NestJS) ────────────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
      code = this.getHttpErrorCode(status);
    }

    // ── Prisma Known Request Error ────────────────────────────
    else if (Prisma && exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = exception as { code: string };
      switch (prismaError.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with this value already exists';
          code = 'DUPLICATE_ENTRY';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          code = 'NOT_FOUND';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference: related record does not exist';
          code = 'INVALID_REFERENCE';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database operation failed';
          code = 'DB_ERROR';
      }
    }

    // ── Prisma Validation Error ───────────────────────────────
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      code = 'VALIDATION_ERROR';
    }

    // ── Log with context ──────────────────────────────────────
    const logPayload = {
      statusCode: status,
      method: request.method,
      path: request.url,
      code,
    };

    if (status >= 500) {
      this.logger.error(`${message} | Route: ${request.path} | Code: ${code}`, exception instanceof Error ? exception.stack : String(exception), GlobalExceptionFilter.name);
    } else {
      this.logger.warn(`${message} | Route: ${request.path} | Code: ${code}`, GlobalExceptionFilter.name);
    }

    // ── Safe user-facing response ─────────────────────────────
    response.status(status).json({
      success: false,
      error: {
        message: this.sanitizeMessage(message, status),
        code,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }

  private sanitizeMessage(message: string, status: number): string {
    // Never expose internal details in production 500s
    if (status >= 500 && process.env.NODE_ENV === 'production') {
      return 'An internal error occurred. Please try again later.';
    }
    return message;
  }

  private getHttpErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'HTTP_ERROR';
  }
}
