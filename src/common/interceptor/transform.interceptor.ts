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
    // return next.handle().pipe(
    //   map((data) => {
    //     if (Info.statusCode === 400) {
    //       // 원하는 상태 코드로 수정하세요
    //       return Object.assign({}, Info, { data, statusCode: 400 });
    //     }
    //     return Object.assign({}, Info, { data });
    //   }),
    // );
  }
}
