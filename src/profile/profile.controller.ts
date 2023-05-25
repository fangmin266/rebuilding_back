import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@root/guard/jwtAuth.guard';
import { RequestWithUserInterface } from '@root/auth/interface/requestWithUser.interface';
import { ApiResponse } from '@nestjs/swagger';
import { TransformInterceptor } from '@root/common/interceptor/transform.interceptor';

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
