import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@root/strategy/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@root/strategy/jwt.strategy';
import { EmailModule } from '@root/email/email.module';
import { SmsModule } from '@root/sms/sms.module';
import { GoogleStrategy } from '@root/strategy/google.strategy';
import { FacebookStrategy } from '@root/strategy/facebook.strategy';
import { NaverStrategy } from '@root/strategy/naver.strategy';
import { KakaoStrategy } from '@root/strategy/kakao.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    EmailModule,
    SmsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`, //.env로 바로 하는 경우도 있는데, 매뉴얼적인 스타일
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
})
export class AuthModule {}
