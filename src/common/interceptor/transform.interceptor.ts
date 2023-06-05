import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  Injectable,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export const Info = {
  statusCode: HttpStatus.OK,
  message: 'success',
};

export type Response<T> = typeof Info & {
  data: T;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => Object.assign({}, Info, { data })),
      catchError((error) => {
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        return throwError({
          success: false,
          statusCode,
          message: error.message,
          timestamp: new Date().toISOString(),
          data: null,
        });
      }),
    );
  }
}
