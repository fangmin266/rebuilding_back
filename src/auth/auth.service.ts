import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserService } from '@user/user.service';
import * as bcrypt from 'bcryptjs';
import { TokenPayload } from './interface/tokenPayload.interface';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return token;
  }
}
