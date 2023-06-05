import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const headers = request.body.headers;
    console.log(headers, 'headers');
    const authorizationHeader = headers.Authorization; //들어오는 authrization 받아옴

    try {
      //access토큰 유효
      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const accessToken = authorizationHeader?.replace('Bearer ', '');
        this.jwtService.verify(accessToken, {
          secret: this.configService.get('JWT_SECRET'),
        });
        console.log('accesstoken유효');
        request.body = {
          refersh: headers.refresh,
          access: accessToken,
        };
      }
    } catch (error) {
      console.log('access 만료');
      if (error.message === 'jwt expired') {
        //access 토큰 만료
        const refreshToken = headers.refresh; //headers에서 임의로 만든 refresh라는 key값
        const decodedRefreshToken = this.jwtService.verify(refreshToken, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
        const newAccessToken = this.jwtService.sign(
          { id: decodedRefreshToken.userId },
          {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
          },
        );
        console.log('refresh토큰유효');
        const removeCookies = [
          'Authentication=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-1;',
          'Refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-1;',
        ];

        const AccessCookie = `Authentication=${newAccessToken};Path=/;`;
        const RefreshCookie = `Refresh=${refreshToken};Path=/;Max-Age=${this.configService.get(
          'JWT_REFRESH_EXPIRATION_TIME',
        )};`;
        const newCookies = [AccessCookie, RefreshCookie];

        response.setHeader('Set-Cookie', [...removeCookies, ...newCookies]);
        // response.send({});
      } else {
        throw new BadRequestException('refresh token 만료');
      }
    }

    return user;
  }
}
