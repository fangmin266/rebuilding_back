import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Get,
  HttpStatus,
  UseInterceptors,
  HttpException,
  Put,
  Inject,
  CACHE_MANAGER,
  HttpCode,
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
import {
  Info,
  TransformInterceptor,
} from '@root/common/interceptor/transform.interceptor';
import { PasswordChangeDto } from '@root/user/dto/password-change.dto';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly smsService: SmsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Post('signup')
  @UseInterceptors(TransformInterceptor)
  @ApiCreatedResponse({
    description: 'the record has been seccuess',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '회원가입',
    description: '회원가입',
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.signup(createUserDto);
      return user;
    } catch (error) {
      throw new HttpException(
        'something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @UseInterceptors(TransformInterceptor)
  @UseGuards(LocalAuthGuard)
  @ApiResponse({ status: 200, description: 'login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '로그인',
    description: '로그인',
  })
  async login(@Req() request: RequestWithUserInterface) {
    const user = request.user;
    await this.cacheManager.set(user.id, user);
    const accessTokenCookie = await this.authService.generateJWT(user.id);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      await this.authService.generateRefreshToken(user.id);
    await this.userService.setCurrnetsRefreshToken(refreshToken, user.id);
    const cookies = [
      `accessToken=${accessTokenCookie}; Path=/; HttpOnly`,
      `refreshToken=${refreshTokenCookie}; Path=/; HttpOnly`,
    ];

    request.res.setHeader('Set-Cookie', cookies);
    return { user, accessTokenCookie };
  }

  @Post('logout')
  @ApiOperation({ summary: 'logout', description: 'logout' })
  @ApiResponse({ status: 200, description: 'logout success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() request: RequestWithUserInterface) {
    await this.cacheManager.del(request.user.id);
    await this.userService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogout());
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'profile get success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'get profile(jwt 토근 bearer 인증)',
    description: 'get profile',
  })
  async getProfile(@Req() request: RequestWithUserInterface) {
    const { user } = request;
    return user;
  }

  @Post('email/confirm')
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'confirmation email' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '회원가입시 정송된 이메일로 인증',
    description: '이메일 인증',
  })
  async confirm(@Body() confirmationDto: ConfirmEmailDto) {
    const email = await this.authService.decodedConfirmationToken(
      confirmationDto.token,
    );
    const res = await this.authService.confirmEmail(email);
    // console.log(res, 'res');
    return res;
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
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'sms verification send success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'sms 인증(twilio) 전송 성공',
    description: 'sms 인증 전송 성공',
  })
  async sendSMS(@Body('phone') phone: string): Promise<any> {
    return await this.smsService.initiatePhoneNumberVerification(phone);
  }

  @Post('sms/check')
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'sms verification confirm success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'sms 인증(twilio) 확인 성공',
    description: 'sms 인증 확인 성공',
  })
  async checkSMS(@Body('phone') phone: string, @Body('code') code: string) {
    return await this.smsService.confirmPhoneVerification(phone, code);
  }

  @Get('google')
  @UseGuards(GoogleOathGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'google login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'google login',
    description: 'google login',
  })
  loginWithGoogle() {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @UseGuards(GoogleOathGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'google login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'google login callback',
    description: 'google login callback',
  })
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
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'facebook login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  loginWithFacebook() {
    return HttpStatusCode.Ok;
  }

  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'facebook login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
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
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'naver login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  loginWithNaver() {
    return HttpStatusCode.Ok;
  }

  @Get('naver/callback')
  @UseGuards(NaverGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'naver login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
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
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'kakao login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  loginWithKakao() {
    return HttpStatusCode.Ok;
  }

  @Get('kakao/callback')
  @UseGuards(KakaoGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'kakao login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
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

  @Post('password/sendtokentoemail')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({
    summary: 'password findby email',
    description: 'email 로 token 발행',
  })
  @ApiResponse({ status: 200, description: 'passwordfind by email success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async findPassword(@Body('email') email: string) {
    const findUser = await this.userService.findPasswordByEmail(email);
    await this.authService.sendPasswordVerification(findUser.email);
    return 'successful send password link';
  }

  @Put('password/changebyemail')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({
    summary: '발행된 토큰 + 변경비밀번호',
    description: 'password changeby email',
  })
  @ApiResponse({ status: 200, description: 'passwordchange by email success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async changePassword(@Body() passwordChangeDto: PasswordChangeDto) {
    await this.authService.changePassword(passwordChangeDto);
    return 'changepassword success';
  }
}
