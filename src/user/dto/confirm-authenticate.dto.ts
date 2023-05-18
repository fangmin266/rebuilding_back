import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAuthenticate {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receipt_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}
