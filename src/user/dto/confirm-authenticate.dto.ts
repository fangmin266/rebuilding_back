import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAuthenticate {
  @IsString()
  @IsNotEmpty()
  receipt_id: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
