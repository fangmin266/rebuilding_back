import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateSocialUserDto, CreateUserDto } from '@user/dto/create-user.dto';
import { UserService } from '@user/user.service';
import * as bcrypt from 'bcryptjs';
import { TokenPayload } from './interface/tokenPayload.interface';
import { VerificationTokenPayloadInterface } from './interface/VerificationTokenPayload.interface';
import { EmailService } from '@email/email.service';
import Bootpay from '@bootpay/backend-js';
import { ConfirmAuthenticate } from '@user/dto/confirm-authenticate.dto';
import { PasswordChangeDto } from '@user/dto/password-change.dto';
import { Provider } from '@user/entities/source.enum';
import { RepoName } from '@user/entities/error.enum';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async signup(createUserDto: CreateUserDto) {
    await this.checkUserExists(createUserDto.email); //이메일중복체크
    if (createUserDto.provider === Provider.LOCAL || !createUserDto.provider) {
      this.userService.create(createUserDto);
    } else {
      throw new BadRequestException('이미 가입된 이메일 혹은 소셜이 있습니다.');
    }
  }

  public async socialSignup(createSocialUserDto: CreateSocialUserDto) {
    if (createSocialUserDto) this.userService.createSocial(createSocialUserDto);
  }

  public async checkUserExists(email: string): Promise<void> {
    const alreadyExist = await this.userService.getByEmail(email);
    if (alreadyExist) {
      throw new HttpException(
        `${RepoName.USER} already exists`,
        HttpStatus.CONFLICT,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    console.log(email, 'email');
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw new HttpException(
        `no ${RepoName.USER} here`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //디코딩
  public async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException('wrong password', HttpStatus.BAD_REQUEST);
    }
  }

  public generateJWT(id: string) {
    //userId로 jwt생성

    const payload: TokenPayload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });
    return token;
  }

  public generateRefreshToken(id: string) {
    const payload: TokenPayload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });
    const cookie = `Refresh=${token}; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_EXPIRATION_TIME',
    )}`;
    return { cookie, token };
  }

  public generateRefreshTokenCookieString(refreshToken: string) {
    const cookie = `Refresh=${refreshToken}; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_EXPIRATION_TIME',
    )}`;
    return cookie;
  }

  public getCookiesForLogout() {
    return [
      `Authentication=; Path=/; Max-Age=-1`,
      `Refresh=; Path=/; Max-Age=-1`,
    ];
  }

  public sendVerificationLink(email: string) {
    const payload: VerificationTokenPayloadInterface = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    const url = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;
    const text = `welcom ${url}`;
    return this.emailService.sendMail({
      to: email,
      subject: 'email confirm',
      text,
    });
  }

  public async sendRandomNumberwithEmail(email: string) {
    return await this.sendEmailRandomCode(email);
  }

  public async decodedConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });

      return payload.email;
    } catch (error) {
      //err
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('token expired error');
      } else {
        throw new BadRequestException('bad confirmation token');
      }
    }
  }

  public async decodedRefreshToken(refreshToken: string) {
    const userRefresh = await this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    const cacheuser = await this.cacheManager.get(userRefresh.userId);
    return cacheuser;
  }

  public async confirmEmail(email: string) {
    const user = await this.userService.getByEmail(email);
    if (user.isEmailConfirmed) {
      throw new BadRequestException('email is almost confirmed');
    }
    await this.userService.markEmailAsConfirmed(email);
    return 'success';
  }

  public async checkAuth() {
    Bootpay.setConfiguration({
      //실제적으로 받아야하는 key값//결제건수에 따라 금액 체계 다름
      application_id: this.configService.get('BOOTPAY_APPLICATION_ID'),
      private_key: this.configService.get('BOOTPAY_PRIVATE_KEY'),
    });
    try {
      await Bootpay.getAccessToken();
      const response = await Bootpay.requestAuthentication({
        //실제적 parameter
        pg: '다날',
        method: '본인인증',
        order_name: '테스트 인증',
        authentication_id: new Date().getTime().toString(),
        username: '황민지',
        identity_no: '9102262',
        phone: '01029693106',
        carrier: 'LGT',
        authenticate_type: 'sms',
      });
      console.log(response, 'response');
    } catch (error) {
      console.log(error);
    }
  }

  async authenticateConfirm(confirmAuthenticateDto: ConfirmAuthenticate) {
    Bootpay.setConfiguration({
      application_id: this.configService.get('BOOTPAY_APPLICATION_ID'),
      private_key: this.configService.get('BOOTPAY_PRIVATE_KEY'),
    });
    try {
      await Bootpay.getAccessToken();
      const response = await Bootpay.confirmAuthentication(
        confirmAuthenticateDto.receipt_id,
        confirmAuthenticateDto.otp,
      );
      console.log(response);
    } catch (e) {
      // 발급 실패시 오류
      console.log(e);
    }
  }

  public async socialLogin(
    email: string,
    username: string,
    application_id: string,
    profile_img: string,
    provider: Provider = Provider.GOOGLE,
    refreshToken: string,
  ) {
    const user = await this.userService.getByEmail(email);

    if (!user) {
      //없을 경우 회원가입
      await this.socialSignup({
        email,
        username,
        profile_img,
        application_id,
        provider,
        refreshToken,
      });
      return user;
    } else {
      if (provider === user.provider) {
        //소셜로그인 경로가 검색한 user의 가입경로와 같을때 //본인
        return user;
      } else {
        throw new BadRequestException(
          '이미 가입된 이메일 혹은 소셜이 있습니다.',
        );
      }
    }
  }

  public async checkProviderSocial() {}

  public async changePassword(passwordChangeDto: PasswordChangeDto) {
    console.log(passwordChangeDto.token);
    const email = await this.decodedConfirmationToken(passwordChangeDto.token);
    console.log(email);
    return await this.userService.changePassword(
      email,
      passwordChangeDto.password,
    );
  }

  public sendPasswordVerification(email: string) {
    const payload: VerificationTokenPayloadInterface = { email };
    const token = this.jwtService.sign(payload, {
      //생성
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET_PASSWORD'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME_PASSWORD',
      )}s`,
    });
    const url = `${this.configService.get(
      'PASSWORD_CONFIRMATION_URL',
    )}?token=${token}`;
    const text = `password change ${url}`;
    return this.emailService.sendMail({
      to: email,
      subject: 'password confirnation',
      text,
    });
  }

  public async sendEmailRandomCode(email: string) {
    const num = await this.generateRandomCode();
    const text = `
          <div style='width:100%; border:red 1px solid; padding:20px'>
            <h1 style='color:red'>rebuilding-back</h1>
            <div>인증번호:${num}</div>
          </div>
          `;
    await this.emailService.sendMail({
      to: email,
      subject: 'rebuildilng_back -이메일 인증번호',
      html: text,
    });
    return num;
  }
  public async generateRandomCode() {
    let str = '';
    for (let i = 0; i < 6; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  }
}
