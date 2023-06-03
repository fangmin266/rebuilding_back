import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '@root/auth/interface/tokenPayload.interface';
import { UserService } from '@root/user/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // console.log(request?.cookies.Authentication, 'reqquest');
          return request?.cookies.Authentication;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken,
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: TokenPayload) {
    return this.userService.getById(payload.userId);
  }
}
