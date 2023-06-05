import { AbstractEntity } from '../entities/abstract.entity';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../entities/source.enum';

export class UpdateUserDto extends AbstractEntity {
  @IsString()
  @IsNotEmpty()
  public username: string;

  @IsString()
  public profile_img: string;

  @IsArray()
  public userrole: Role[];

  @IsString()
  public currentHashedRefreshToken?: string;
}
