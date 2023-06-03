import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), JwtModule.register({})],
  controllers: [ProfileController],
  providers: [ProfileService, JwtService],
})
export class ProfileModule {}
