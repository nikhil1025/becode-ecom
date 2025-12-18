"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse;
                message = responseObj.message || message;
                errors = responseObj.errors || null;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            switch (exception.code) {
                case 'P2002': {
                    const target = exception.meta?.target;
                    const targetStr = Array.isArray(target)
                        ? target.join(', ')
                        : typeof target === 'string'
                            ? target
                            : 'field';
                    message = `A record with this ${targetStr} already exists`;
                    break;
                }
                case 'P2025':
                    message = 'Record not found';
                    status = common_1.HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    message = 'Foreign key constraint failed';
                    break;
                case 'P2014':
                    message = 'Invalid relation';
                    break;
                default:
                    message = 'Database operation failed';
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        this.logger.error(`${request.method} ${request.url} - Status: ${status} - Message: ${message}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json({
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map