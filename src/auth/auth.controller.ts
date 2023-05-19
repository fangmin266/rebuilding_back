import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { LocalAuthGuard } from '@root/guard/localAuth.gaurd';
import { RequestWithUserInterface } from './interface/requestWithUser.interface';
import { Response } from 'express';
import { JwtAuthGuard } from '@root/guard/jwtAuth.guard';
import { ConfirmEmailDto } from '@root/user/dto/confirm-email.dto';
import { ConfirmAuthenticate } from '@root/user/dto/confirm-authenticate.dto';
import { SmsService } from '@root/sms/sms.service';
import { GoogleOathGuard } from '@root/guard/googleAuth.guard';
import { FacebookGuard } from '@root/guard/facebookAuth.guard';
import { HttpStatusCode } from 'axios';
import { NaverGuard } from '@root/guard/naverAuth.guard';
import { KakaoGuard } from '@root/guard/kakaoAuth.guard';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@root/user/entities/user.entity';
import { UserService } from '@root/user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly smsService: SmsService,
  ) {}

  @Post('signup')
  @ApiCreatedResponse({
    description: 'the record has been seccuess',
    type: User,
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    await this.authService.sendVerificationLink(createUserDto.email);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() request: RequestWithUserInterface,
    @Res() response: Response,
  ) {
    const user = request.user;
    const token = await this.authService.generateJWT(user.id);
    return response.send({
      user,
      token,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request: RequestWithUserInterface) {
    const { user } = request;
    return user;
  }

  @Post('email/confirm')
  @ApiResponse({ status: 200, description: 'confirmation email' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '회원가입시 정송된 이메일로 인증',
    description: '사용자 전체 조회',
  })
  async confirm(@Body() confirmationDto: ConfirmEmailDto) {
    const email = await this.authService.decodedConfirmationToken(
      confirmationDto.token,
    );
    await this.authService.confirmEmail(email);
    return 'success';
  }

  @Post('check') //본인인증 //boot pay docs 본인인증 2-1 (서버사이드 )
  async checkAuthenticate() {
    return await this.authService.checkAuth();
  }

  @Post('confirm/authenticate')
  async confirmAuthenticate(
    @Body() confirmAuthenticateDto: ConfirmAuthenticate,
  ) {
    return await this.authService.authenticateConfirm(confirmAuthenticateDto);
  }

  @Post('sms/verify')
  async sendSMS(@Body('phone') phone: string): Promise<any> {
    return await this.smsService.initiatePhoneNumberVerification(phone);
  }

  @Post('sms/check')
  async checkSMS(@Body('phone') phone: string, @Body('code') code: string) {
    return await this.smsService.confirmPhoneVerification(phone, code);
  }

  @Get('google')
  @UseGuards(GoogleOathGuard)
  loginWithGoogle() {
    return HttpStatus.OK;
  }
  @Get('google/callback')
  @UseGuards(GoogleOathGuard)
  async googleCallback(@Req() req) {
    const user = req.user;
    const email = user.email;
    const username = user.displayName;
    const password_before = user.id + email;
    const photo = user.picture;
    const loginRes = await this.authService.socialLogin(
      email,
      username,
      password_before,
      photo,
    );
    return loginRes;
  }

  @Get('facebook')
  @UseGuards(FacebookGuard)
  loginWithFacebook() {
    return HttpStatusCode.Ok;
  }
  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  async facebookCallback(@Req() req) {
    const user = req.user;
    const email = user._json.email;
    const username = user.name.familyName + user.name.givenName;
    const password_before = user.id + email;
    const photo = null;
    const loginRes = await this.authService.socialLogin(
      email,
      username,
      password_before,
      photo,
    );
    return loginRes;
  }

  @Get('naver')
  @UseGuards(NaverGuard)
  loginWithNaver() {
    return HttpStatusCode.Ok;
  }

  @Get('naver/callback')
  @UseGuards(NaverGuard)
  async naverCallback(@Req() req) {
    const user = req.user;
    const userj = user._json;
    const email = userj.email ? userj.email : null;
    const username = userj.nickName ? userj.nickName : null;
    const password_before = user.id + email;
    const photo = userj.profile ? userj.profile : null;
    const loginRes = await this.authService.socialLogin(
      email,
      username,
      password_before,
      photo,
    );

    return loginRes;
  }

  @Get('kakao')
  @UseGuards(KakaoGuard)
  loginWithKakao() {
    return HttpStatusCode.Ok;
  }

  @Get('kakao/callback')
  @UseGuards(KakaoGuard)
  async kakaoCallback(@Req() req) {
    const user = JSON.parse(req.user._raw);
    const email = user.kakao_account.email;
    const username = user.properties.nickName;
    const password_before = user.id + email;
    const photo = user.kakao_account.profile.profile_image_url;
    const loginRes = await this.authService.socialLogin(
      email,
      username,
      password_before,
      photo,
    );
    return loginRes;
  }
}
