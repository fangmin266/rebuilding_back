import { User } from '@root/user/entities/user.entity';

export class CreateProfileDto {
  interest?: string;

  company?: string;

  school?: string;

  note?: string;

  user: User;
}
