import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from './abstract.entity';
import { Source } from './source.enum';
@Entity()
export class User extends AbstractEntity {
  @Column()
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  @Exclude() //password 출력되지 x
  public password?: string;

  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: Source,
    default: Source.LOCAL,
  })
  public source: Source;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
