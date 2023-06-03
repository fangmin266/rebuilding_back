import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { response } from 'express';

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

  // console.log(response.req.body, '.?');
  // const resBody = response.req.body;
  // const accessToken = resBody.access;
  // const refeshTokenCookie =
  //   await this.authService.generateRefreshTokenCookieString(resBody.refresh);
  // console.log(resBody, 'resbody');
  // const newCookies = [
  //   `Authentication=${accessToken}; Path=/; `,
  //   refeshTokenCookie,
  // ];
  // console.log(newCookies, 'newCOokies???');

  // const removeCookies = [
  //   'Authentication=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-1; Domain=localhost',
  //   'Refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-1; Domain=localhost',
  // ];

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const headers = request.body.headers;
    const authorizationHeader = headers.Authorization; //들어오는 authrization 받아옴
    console.log(headers, 'headers');
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
      console.log(error.message, 'errormessage');
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

        // request.body = {
        //   refresh: refreshToken,
        //   access: newAccessToken,
        // };

        const removeCookies = [
          'Authentication=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-1',
          'Refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=-1',
        ];
        response.setHeader('Set-Cookie', removeCookies);

        const AccessCookie = `Authentication=${newAccessToken};Path=/; `;
        const RefreshCookie = `Refresh=${refreshToken}; Path=/; Max-Age=${this.configService.get(
          'JWT_REFRESH_EXPIRATION_TIME',
        )}`;
        const newCookies = [AccessCookie, RefreshCookie];
        console.log(newCookies, 'newCOokies');
        response.clearCookie('Authentication');
        response.clearCookie('Refresh');
        // response.clearCookie('Authentication');
        // response.clearCookie('Refresh');
        // response.setHeader('Set-Cookie', [...removeCookies, ...newCookies]);

        // response.setHeader('Set-Cookie', newCookies);
        response.send({});
      } else {
        throw new BadRequestException('refresh token error access');
      }
    }

    return user;
  }
}
