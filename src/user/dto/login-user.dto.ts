import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  email: string;
  password: string;
}
