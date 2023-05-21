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
    JwtModule.register({}), //service 모듈내부에서 적용을하려면 이렇게 적용
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
