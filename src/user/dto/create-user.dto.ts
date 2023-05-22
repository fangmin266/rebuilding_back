import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Source } from '../entities/source.enum';

export class createCommon {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  profile_img: string;
}

export class CreateUserDto extends createCommon {
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, {
    message: '영문과 숫자 특수문자 포함하여 7~20자여야 합니다.',
    each: true,
  })
  password: string;
}

export class CreateSocialUserDto extends createCommon {
  @IsString()
  application_id: string;

  @IsString()
  @IsOptional() // 선택적으로 전달될 수 있는 소스 값
  source?: Source;
}
