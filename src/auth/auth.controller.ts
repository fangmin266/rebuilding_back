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
import { Response, Request, response } from 'express';
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
import { PasswordChangeDto } from '@root/user/dto/password-change.dto';
import { Cache } from 'cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Provider } from '@root/user/entities/source.enum';

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
      throw new HttpException(
        'something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      response.setHeader('Set-Cookie', cookies);
      response.send({
        user: {
          ...user,
          password: undefined, //프론트 백 둘다 http환경인 localhost로 진행하여 쿠키 옵션을 읽을수 있는 조건(javascript)로 제한하여 exclude 가 적용이 되지 않는 이슈같음, 일단 undefined로 처리
          currentHashedRefreshToken: undefined,
        },
      });
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
  @UseGuards(ThrottlerGuard)
  @ApiResponse({ status: 200, description: 'autologin success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: '자동 로그인',
    description: '자동 로그인',
  })
  async autoLogin(
    @Body('refreshToken') refreshToken: string,
    @Res() response: Response,
  ) {
    try {
      const user = await this.authService.decodedRefreshToken(refreshToken);
      const accessTokenCookie = await this.authService.generateJWT(user.id);
      const refreshTokenCookie =
        await this.authService.generateRefreshTokenCookieString(refreshToken);
      const newCookies = [
        `Authentication=${accessTokenCookie}; Path=/; `,
        refreshTokenCookie,
      ];
      const removecookies = await this.authService.getCookiesForLogout();
      response.setHeader('Set-Cookie', [...removecookies, ...newCookies]);
      response.send({
        user: {
          ...user,
          password: undefined, //프론트 백 둘다 http환경인 localhost로 진행하여 쿠키 옵션을 읽을수 있는 조건(javascript)로 제한하여 exclude 가 적용이 되지 않는 이슈같음, 일단 undefined로 처리
          currentHashedRefreshToken: undefined,
        },
      });
    } catch (error) {
      //user undefined일 경우 리프레시만료
      if (error?.name === 'TokenExpiredError') {
        console.log('리프레시 만료');
        throw new HttpException(`refresh expired`, HttpStatus.BAD_REQUEST);
      }
    }
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
    const user = req.user;
    const email = user.email;
    const username = user.displayName;
    const photo = user.picture;
    const application_id = user.id;

    const loginRes = await this.authService.socialLogin(
      email,
      username,
      application_id,
      photo,
      Provider.GOOGLE,
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
      Provider.FACEBOOK,
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
  async naverCallback(@Req() req, @Res() res) {
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
      Provider.NAVER,
    );
    console.log(loginRes);
    const mainPageUrl = 'http://localhost:3000';
    res.redirect(mainPageUrl);
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
  async kakaoCallback(@Req() req, @Res() res) {
    const user = JSON.parse(req.user._raw);
    const email = user.kakao_account.email;
    const username = user.properties.nickName;
    const application_id = user.id;
    const photo = user.kakao_account.profile.profile_image_url;
    const loginRes = await this.authService.socialLogin(
      email,
      username,
      application_id,
      photo,
      Provider.KAKAO,
    );
    console.log(loginRes);
    const mainPageUrl = 'http://localhost:3000';
    res.redirect(mainPageUrl);
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
