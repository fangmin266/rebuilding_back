import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Provider } from '@root/user/entities/source.enum';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  Provider.FACEBOOK,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get('FACEBOOK_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    return { profile, accessToken: accessToken, refreshToken: refreshToken };
  }
}
