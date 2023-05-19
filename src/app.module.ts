import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from '@product/product.module';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { ConfigModule } from '@nestjs/config';

import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import { TerminusModule } from '@nestjs/terminus';
import { ProfileModule } from './profile/profile.module';
import { CommentModule } from './comment/comment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LibraryModule } from './library/library.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ProductModule,
    UserModule,
    AuthModule,
    EmailModule,
    SmsModule,
    TerminusModule,
    ProfileModule,
    CommentModule,
    ScheduleModule.forRoot(),
    LibraryModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
