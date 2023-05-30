import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Provider } from '@root/user/entities/source.enum';

@Injectable()
export class NaverGuard extends AuthGuard(Provider.NAVER) {}
