import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Library } from './entities/library.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Library]),
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
  ],
  controllers: [LibraryController],
  providers: [LibraryService, JwtService],
})
export class LibraryModule {}
