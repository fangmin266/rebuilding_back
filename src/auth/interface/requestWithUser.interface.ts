import { ApiProperty } from '@nestjs/swagger';
import { User } from '@root/user/entities/user.entity';

export interface RequestWithUserInterface extends Request {
  user: User;
}
