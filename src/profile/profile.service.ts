import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}
  async create(profileData: CreateProfileDto) {
    const newProfile = this.profileRepository.create(profileData);
    await this.profileRepository.save(newProfile);
    return newProfile;
  }
}
