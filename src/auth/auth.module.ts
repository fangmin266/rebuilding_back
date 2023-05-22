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
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      expandVariables: true,
    }),
    EmailModule,
    SmsModule,
    JwtModule.register({}), //service 모듈내부에서 적용을하려면 이렇게 적용
    ThrottlerModule.forRoot({
      ttl: 200,
      limit: 20, //60초동안 10번만 할수 있음 - Ddos 공격에 대비 , bot 공격 대비
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
    // {
    //   //throttler 전역사용하기 위해 설정해줘야함
    //   //https://docs.nestjs.com/security/rate-limiting
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AuthModule {}
