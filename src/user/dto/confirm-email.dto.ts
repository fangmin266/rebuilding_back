import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({ type: String, description: 'email token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
