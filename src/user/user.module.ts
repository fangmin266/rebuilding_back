import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@root/strategy/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}), //service 모듈내부에서 적용을하려면 이렇게 적용
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      expandVariables: true,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService], //*authService에서 사용-의존성에러해결 */
})
export class UserModule {}
