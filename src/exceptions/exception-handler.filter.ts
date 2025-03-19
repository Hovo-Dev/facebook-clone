import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import ValidationException from './ValidationException';
import { UserRequest } from '../typings/user-request.type';
import {ObjectLiteral} from "../typings/shared.type";

type ExceptionResponseContext = {
  status: number;
  timestamp: string;
  path: string;
  message: string;
  stacktrace?: string[];
  errors?: any[];
};

@Catch()
export default class ExceptionHandlerFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Handle exception.
   *
   * @param exception
   * @param host
   */
  catch(exception: ObjectLiteral, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    // Fetch context.
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // Determine http status.
    const httpStatus = ExceptionHandlerFilter.getExceptionHttpStatus(exception);

    // Prepare default response body.
    let response: ExceptionResponseContext = {
      status: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: ExceptionHandlerFilter.transformMessage(
        httpStatus,
        exception,
        this.config.get('app.debug'),
      ),
    };

    //  Add stack trace if needed.
    if (
      this.config.get('app.debug') &&
      exception.stack &&
      !(exception instanceof ValidationException)
    ) {
      response['stacktrace'] = exception.stack.split('\n')
    }

    // Process validation exception.
    // Log any errors except validation if they should not be ignored.
    if (exception instanceof ValidationException) {
      response['errors'] = exception.renderErrors();
    } else if (this.shouldLog(response)) {
      ExceptionHandlerFilter.report(this.logger, exception, request);
    }

    // Reply with exception.
    httpAdapter.reply(
      ctx.getResponse<Response>(),
      response,
      httpStatus,
    );
  }

  /**
   * Report given exception with given logger service.
   *
   * @param logger
   * @param exception
   * @param request
   */
  public static report(
    logger: LoggerService,
    exception: any,
    request: Request | UserRequest,
  ) {
    // Determine http status.
    const httpStatus = ExceptionHandlerFilter.getExceptionHttpStatus(exception);

    // Determine message
    const message = ExceptionHandlerFilter.transformMessage(
      httpStatus,
      exception,
      true,
    );

    logger.error({
      // Get raw error for a log.
      message,
      context: {
        user: request['user'],
        response:
          exception instanceof HttpException
            ? exception.getResponse()
            : undefined,
      },
      label: exception.cause || 'Default Handler',
      stack: exception.stack,
    });
  }

  /**
   * Get HTTP status code from given exception.
   *
   * @param exception
   */
  public static getExceptionHttpStatus(exception: object): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Determine that we should log given response.
   *
   * @private
   * @param response
   */
  private shouldLog(response: ExceptionResponseContext) {
    return response['status'] >= 500;
  }

  /**
   * Transform message from exception.
   *
   * @param isDebug
   * @param httpStatus
   * @param exception
   * @private
   */
  public static transformMessage(
    httpStatus: number,
    exception: ObjectLiteral,
    isDebug?: boolean,
  ): string {
    // If debug enabled , then render all messages.
    // If debug disabled, then render messages only for none 500 errors
    if (isDebug || httpStatus < 500) {
      return exception.message || 'Unknown exception';
    } else {
      return 'Internal server error';
    }
  }
}
