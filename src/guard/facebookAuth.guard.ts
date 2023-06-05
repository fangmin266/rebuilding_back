import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Provider } from '@user/entities/source.enum';

@Injectable()
export class FacebookGuard extends AuthGuard(Provider.FACEBOOK) {}
