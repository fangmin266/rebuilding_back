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
    // super({
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   secretOrKey: configService.get('JWT_SECRET'),
    // });
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies['Authorization'];
        },
        ExtractJwt.fromAuthHeaderAsBearerToken,
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
    // super({
    //   jwtFromRequest: [
    //     ExtractJwt.fromAuthHeaderAsBearerToken(),
    //     ExtractJwt.fromExtractors([
    //       (req: Request) => {
    //         return req?.cookies?.Authentication;
    //       },
    //     ]),
    //   ],
    //   secretOrKey: configService.get('JWT_SECRET'),
    // });
  }
  async validate(payload: TokenPayload) {
    return this.userService.getById(payload.userId);
  }
}
