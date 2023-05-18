import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    return user;
  }

  @Post('login')
  async login(@Body() loginuserDto: LoginUserDto) {
    const loggedUser = await this.authService.getAuthenticatedUser(
      loginuserDto.email,
      loginuserDto.password,
    );
    return loggedUser;
  }
}
