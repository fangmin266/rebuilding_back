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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
  ) {}

  @Post('signup')
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
    // return user;
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
  googleCallback(@Req() req) {
    console.log(req);
  }

  @Get('facebook')
  @UseGuards(FacebookGuard)
  loginWithFacebook() {
    return HttpStatusCode.Ok;
  }
  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  facebookCallback(@Req() req) {
    console.log(req, ' req facebook');
  }

  @Get('naver')
  @UseGuards(NaverGuard)
  loginWithNaver() {
    return HttpStatusCode.Ok;
  }

  @Get('naver/callback')
  @UseGuards(NaverGuard)
  naverCallback(@Req() req) {
    console.log(req, 'req callback');
  }

  @Get('kakao')
  @UseGuards(KakaoGuard)
  loginWithKakao() {
    return HttpStatusCode.Ok;
  }

  @Get('kakao/callback')
  @UseGuards(KakaoGuard)
  kakaoCallback(@Req() req) {
    console.log(req, ' req, kakao');
  }
}
