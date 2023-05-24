import { IsEmail } from 'class-validator';

export class EmailVerifiateDto {
  @IsEmail()
  email: string;
}
