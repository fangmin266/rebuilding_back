import { AbstractEntity } from '@user/entities/abstract.entity';
import { User } from '@user/entities/user.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class Profile extends AbstractEntity {
  @Column({ nullable: true })
  interest?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  school?: string;

  @Column({ nullable: true })
  note?: string;

  @OneToOne(() => User, (user: User) => user.profile)
  user: User;
}
