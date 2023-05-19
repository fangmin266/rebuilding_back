import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserService } from '@user/user.service';
import * as bcrypt from 'bcryptjs';
import { TokenPayload } from './interface/tokenPayload.interface';
import { VerificationTokenPayloadInterface } from './interface/VerificationTokenPayload.interface';
import { EmailService } from '@root/email/email.service';
import Bootpay from '@bootpay/backend-js';
import { ConfirmAuthenticate } from '@root/user/dto/confirm-authenticate.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  public async signup(createUserDto: CreateUserDto) {
    let alreadyExist = await this.userService.getByEmail(createUserDto.email);
    try {
      if (!alreadyExist) {
        return await this.userService.create(createUserDto);
      } else {
        return 'already exist email';
      }
    } catch (error) {
      throw new HttpException(
        'something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw new HttpException('no user here', HttpStatus.BAD_REQUEST);
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

  public generateJWT(userId: string) {
    //userId로 jwt생성
    console.log(userId, 'userid');
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    console.log(token, 'token');
    return token;
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

  public async confirmEmail(email: string) {
    const user = await this.userService.getByEmail(email);
    if (user.isEmailConfirmed) {
      throw new BadRequestException('email is almost confirmed');
    }
    await this.userService.markEmailAsConfirmed(email);
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
    password: string,
    profile: string,
  ) {
    try {
      console.log(email, username, password, profile, 'this~~~~~~~~~~');
      const user = await this.userService.getByEmail(email);
      if (!user) {
        const signupuser = await this.signup({
          email,
          username,
          password,
          profile,
        });
        console.log(signupuser, 'signup');
        return { user: signupuser };
      } else {
        const token = this.generateJWT(user.id);
        return { user, token };
      }
    } catch (error) {
      throw new HttpException(
        'something went wring in social',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
