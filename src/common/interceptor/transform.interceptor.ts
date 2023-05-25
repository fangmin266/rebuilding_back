import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  Injectable,
} from '@nestjs/common';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const Info = {
  statusCode: 200,
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
    return next.handle().pipe(map((data) => Object.assign({}, Info, { data })));
  }
}
