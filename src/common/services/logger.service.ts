import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends ConsoleLogger implements LoggerService {
  protected formatMessage(message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    return `${timestamp} ${ctx} ${message}`;
  }

  log(message: any, context?: string) {
    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS | ' + this.formatMessage(message, context));
    console.log('='.repeat(80) + '\n');
  }

  error(message: any, trace?: string, context?: string) {
    console.error('\n' + '🔴'.repeat(40));
    console.error('❌ ERROR | ' + this.formatMessage(message, context));
    if (trace) {
      console.error('📍 Stack Trace:');
      console.error(trace);
    }
    console.error('🔴'.repeat(40) + '\n');
  }

  warn(message: any, context?: string) {
    console.warn('\n' + '⚠️ WARNING | ' + this.formatMessage(message, context) + '\n');
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🐛 DEBUG | ' + this.formatMessage(message, context));
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 VERBOSE | ' + this.formatMessage(message, context));
    }
  }

  // Custom method for API requests
  logRequest(method: string, url: string, body?: any, query?: any, params?: any, headers?: any) {
    console.log('\n' + '🔵'.repeat(40));
    console.log(`📥 INCOMING REQUEST | ${new Date().toISOString()}`);
    console.log('─'.repeat(80));
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    
    if (params && Object.keys(params).length > 0) {
      console.log(`   Params:`, JSON.stringify(params, null, 2));
    }
    
    if (query && Object.keys(query).length > 0) {
      console.log(`   Query:`, JSON.stringify(query, null, 2));
    }
    
    if (body && Object.keys(body).length > 0) {
      // Mask sensitive fields
      const sanitizedBody = this.sanitizeSensitiveData(body);
      console.log(`   Body:`, JSON.stringify(sanitizedBody, null, 2));
    }

    if (headers) {
      const relevantHeaders = {
        'content-type': headers['content-type'],
        'user-agent': headers['user-agent'],
        authorization: headers['authorization'] ? '***PRESENT***' : 'NOT_PRESENT',
      };
      console.log(`   Headers:`, JSON.stringify(relevantHeaders, null, 2));
    }
    
    console.log('🔵'.repeat(40) + '\n');
  }

  // Custom method for API responses
  logResponse(method: string, url: string, statusCode: number, data: any, responseTime: number) {
    console.log('\n' + '🟢'.repeat(40));
    console.log(`📤 OUTGOING RESPONSE | ${new Date().toISOString()}`);
    console.log('─'.repeat(80));
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${statusCode}`);
    console.log(`   Response Time: ${responseTime}ms`);
    
    if (data) {
      // Limit response data to avoid console overflow
      const dataString = JSON.stringify(data, null, 2);
      if (dataString.length > 2000) {
        console.log(`   Response Data: [Large Response - ${dataString.length} characters]`);
        console.log(`   Preview:`, dataString.substring(0, 500) + '...');
      } else {
        console.log(`   Response Data:`, dataString);
      }
    }
    
    console.log('🟢'.repeat(40) + '\n');
  }

  // Custom method for API errors
  logApiError(method: string, url: string, statusCode: number, error: any, responseTime: number) {
    console.error('\n' + '🔴'.repeat(40));
    console.error(`❌ API ERROR | ${new Date().toISOString()}`);
    console.error('─'.repeat(80));
    console.error(`   Method: ${method}`);
    console.error(`   URL: ${url}`);
    console.error(`   Status Code: ${statusCode}`);
    console.error(`   Response Time: ${responseTime}ms`);
    console.error(`   Error Message: ${error.message || 'Unknown error'}`);
    
    if (error.response) {
      console.error(`   Error Response:`, JSON.stringify(error.response, null, 2));
    }
    
    if (error.stack) {
      console.error('   Stack Trace:');
      console.error(error.stack);
    }
    
    console.error('🔴'.repeat(40) + '\n');
  }

  // Sanitize sensitive data before logging
  private sanitizeSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization', 'creditCard', 'cvv'];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
