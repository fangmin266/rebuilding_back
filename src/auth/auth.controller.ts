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
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { LocalAuthGuard } from '@root/guard/localAuth.gaurd';
import { RequestWithUserInterface } from './interface/requestWithUser.interface';
import { Response, Request, response } from 'express';
import { JwtAuthGuard } from '@guard/jwtAuth.guard';
import { ConfirmEmailDto } from '@user/dto/confirm-email.dto';
import { ConfirmAuthenticate } from '@user/dto/confirm-authenticate.dto';
import { SmsService } from '@sms/sms.service';
import { GoogleOathGuard } from '@guard/googleAuth.guard';
import { FacebookGuard } from '@guard/facebookAuth.guard';
import { HttpStatusCode } from 'axios';
import { NaverGuard } from '@guard/naverAuth.guard';
import { KakaoGuard } from '@guard/kakaoAuth.guard';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';
import { PasswordChangeDto } from '@user/dto/password-change.dto';
import { Cache } from 'cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Provider } from '@user/entities/source.enum';
import { handleSocialLoginError } from '@common/util/error';

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
      if (
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiResponse({ status: 200, description: 'login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '로그인',
    description: '로그인',
  })
  async login(
    @Req() request: RequestWithUserInterface,
    @Res() response: Response,
  ) {
    try {
      const user = request.user;

      const accessTokenCookie = await this.authService.generateJWT(user.id);
      const { cookie: refreshTokenCookie, token: refreshToken } =
        await this.authService.generateRefreshToken(user.id);
      await this.userService.setCurrnetsRefreshToken(refreshToken, user.id);
      await this.cacheManager.set(user.id, user);

      const cookies = [
        `Authentication=${accessTokenCookie}; Path=/; `,
        refreshTokenCookie,
      ];
      console.log(cookies, 'cookies email');
      response.setHeader('Set-Cookie', cookies);

      response.send({});
    } catch (error) {
      console.log(error, 'error');
    }
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

  @Post('autologin')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiResponse({ status: 200, description: 'autologin success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '자동 로그인',
    description: '자동 로그인',
  })
  async autoLogin(@Res() response: Response, @Res() request: Request) {
    console.log('autologin');
    const body = request.body;
    console.log(body, 'body');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
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
  @ApiResponse({ status: 200, description: 'confirmation email' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '회원가입시 전송된 이메일로 인증',
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
  @ApiResponse({ status: 200, description: 'google login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'google login callback',
    description: 'google login callback',
  })
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user.profile;
    const email = user.email;
    const username = user.displayName;
    const profile_img = user.picture;
    const application_id = user.id;

    await this.authService.socialLogin(
      email,
      username,
      application_id,
      profile_img,
      Provider.GOOGLE,

      user.refreshToken,
    );
    const mainPageUrl = 'http://localhost:3000';
    res.redirect(mainPageUrl);
  }

  @Get('facebook')
  @UseGuards(FacebookGuard)
  @ApiResponse({ status: 200, description: 'facebook login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  loginWithFacebook() {
    return HttpStatusCode.Ok;
  }

  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  @ApiResponse({ status: 200, description: 'facebook login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async facebookCallback(@Req() req, @Res() res) {
    const user = req.user.proflie;
    const email = user._json.email;
    const username = user.name.familyName + user.name.givenName;
    const password_before = user.id + email;
    const profile_img = null;
    const loginRes = await this.authService.socialLogin(
      email,
      username,
      password_before,
      profile_img,
      Provider.FACEBOOK,

      user.refreshToken,
    );
    const mainPageUrl = 'http://localhost:3000';
    res.redirect(mainPageUrl);
  }

  @Get('naver')
  @UseGuards(NaverGuard)
  @ApiResponse({ status: 200, description: 'naver login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  loginWithNaver() {
    return HttpStatusCode.Ok;
  }

  @Get('naver/callback')
  @UseGuards(NaverGuard)
  @ApiResponse({ status: 200, description: 'naver login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async naverCallback(@Req() req, @Res() response: Response) {
    const reqUser = req.user;
    const userj = reqUser.profile._json;
    const email = userj.email ? userj.email : null;
    const username = userj.nickName ? userj.nickName : null;
    const password_before = reqUser.id + email;
    const profile_img = userj.profile ? userj.profile : null;
    const refreshToken = reqUser.refreshToken;
    const mainPageUrl = 'http://localhost:3000';

    try {
      const user = await this.authService.socialLogin(
        email,
        username,
        password_before,
        profile_img,
        Provider.NAVER,
        refreshToken,
      );

      const accessTokenCookie = await this.authService.generateJWT(user.id);
      const refreshTokenCookie =
        await this.authService.generateRefreshTokenCookieString(refreshToken);
      await this.userService.setCurrnetsRefreshToken(refreshToken, user.id);
      await this.cacheManager.set(user.id, user);
      const cookies = [
        `Authentication=${accessTokenCookie}; Path=/; `,
        refreshTokenCookie,
      ];

      response.setHeader('Set-Cookie', cookies);

      response.redirect(mainPageUrl);
    } catch (error) {
      handleSocialLoginError(response, mainPageUrl, error);
    }
  }

  @Get('kakao')
  @UseGuards(KakaoGuard)
  @ApiResponse({ status: 200, description: 'kakao login success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  loginWithKakao() {
    return HttpStatusCode.Ok;
  }

  @Get('kakao/callback')
  @UseGuards(KakaoGuard)
  @ApiResponse({ status: 200, description: 'kakao login callback success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async kakaoCallback(@Req() req, @Res() response: Response) {
    const profile = req.user.profile;
    const raw = profile._raw;
    const kakaoaccount = JSON.parse(raw).kakao_account;

    const email = kakaoaccount.email;
    const refreshToken = req.user.refreshToken;
    const username = profile.username;
    const application_id = profile.id;
    const profile_img = kakaoaccount.profile.profile_image_url;
    const mainPageUrl = 'http://localhost:3000';

    try {
      const user = await this.authService.socialLogin(
        email,
        username,
        application_id,
        profile_img,
        Provider.KAKAO,
        refreshToken,
      );
      const accessTokenCookie = await this.authService.generateJWT(user.id);
      const refreshTokenCookie =
        await this.authService.generateRefreshTokenCookieString(refreshToken);
      await this.userService.setCurrnetsRefreshToken(refreshToken, user.id);
      await this.cacheManager.set(user.id, user);
      const cookies = [
        `Authentication=${accessTokenCookie}; Path=/; `,
        refreshTokenCookie,
      ];
      response.setHeader('Set-Cookie', cookies);
      response.redirect(mainPageUrl);
    } catch (error) {
      handleSocialLoginError(response, mainPageUrl, error);
    }
  }

  @Post('email/search')
  @ApiCreatedResponse({ description: '결과' })
  @ApiResponse({ status: 201, description: ' 이메일 찾기' })
  @ApiOperation({ summary: ' 이메일 찾기', description: ' 이메일 찾기' })
  async findEmail(@Body('email') email: string) {
    const findEmail = await this.userService.getByEmail(email);
    if (!findEmail) throw new HttpException(`no email`, HttpStatus.BAD_REQUEST);
  }

  @Post('email/randomnum')
  @ApiCreatedResponse({ description: '결과' })
  @ApiResponse({ status: 201, description: ' 이메일 랜덤넘버 전송 성공' })
  @ApiOperation({
    summary: '이메일로 랜덤넘버 전송',
    description: '이메일로 랜덤넘버 전송',
  })
  async sendRandomLink(@Body('email') email: string) {
    const RandomNum = await this.authService.sendRandomNumberwithEmail(email);
    await this.cacheManager.del(email);
    await this.cacheManager.set(email, RandomNum);
  }

  @Post('randomnum/incache')
  @ApiCreatedResponse({ description: '결과' })
  @ApiResponse({ status: 201, description: '랜덤넘버 가져오기' })
  @ApiOperation({
    summary: '랜덤넘버 가져오기',
    description: '랜덤넘버 가져오기',
  })
  async getRandomNumInCache(
    @Body('email') email: string,
    @Body('random') random: string,
  ) {
    console.log(email, random, '??');
    // console.log(email + random, 'key');
    const getRandomNumberinCache = await this.cacheManager.get(email);
    console.log(getRandomNumberinCache);
    return getRandomNumberinCache;
  }

  @Post('email/password')
  @ApiCreatedResponse({ description: '결과' })
  @ApiResponse({ status: 201, description: 'password reset link success' })
  @ApiOperation({
    summary: 'password reset link success',
    description: 'password reset link success',
  })
  async passwordReset(@Body('email') email: string) {
    await this.authService.sendVerificationLink(email);
  }

  @Put('password/change')
  @ApiOperation({
    summary: '발행된 토큰 + 변경비밀번호',
    description: 'password changeby email',
  })
  @ApiResponse({ status: 200, description: 'passwordchange by token success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  async changePassword(@Body() passwordChangeDto: PasswordChangeDto) {
    await this.authService.changePassword(passwordChangeDto);
    return 'changepassword success';
  }
}
