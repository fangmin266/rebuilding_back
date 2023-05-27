import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '@auth/auth.service';
import { User } from '@user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    console.log(email, password);
    const user = await this.authService.getAuthenticatedUser(email, password);
    if (!user) {
      //unahthorize 401에러 해결
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
