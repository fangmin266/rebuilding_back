import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@guard/jwtAuth.guard';
import { RequestWithUserInterface } from '@auth/interface/requestWithUser.interface';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'profile success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async createProfile(
    @Req() request: RequestWithUserInterface,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const { user } = request;
    const profile = await this.profileService.create(createProfileDto);
    return { user, profile };
  }
}
