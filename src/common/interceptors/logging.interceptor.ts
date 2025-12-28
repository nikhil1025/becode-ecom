import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppLoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLoggerService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    const now = Date.now();

    // Log incoming request
    this.logger.logRequest(method, url, body, query, params, headers);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // Log successful response
        this.logger.logResponse(method, url, statusCode, data, responseTime);
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        const statusCode = error.status || error.statusCode || 500;

        // Log error response
        this.logger.logApiError(method, url, statusCode, error, responseTime);
        
        return throwError(() => error);
      }),
    );
  }
}
