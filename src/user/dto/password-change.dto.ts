import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
