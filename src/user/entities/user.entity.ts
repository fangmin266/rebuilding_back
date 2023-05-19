import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from './abstract.entity';
import { Role, Source } from './source.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
@Entity()
export class User extends AbstractEntity {
  @ApiProperty()
  @Column({ nullable: true })
  public username: string;

  @ApiProperty()
  @Column({ unique: true })
  public email: string;

  @ApiProperty()
  @Column({ nullable: true })
  @Exclude() //password 출력되지 x
  public password?: string;

  @ApiProperty()
  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  profile: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: Source,
    default: Source.LOCAL,
  })
  public source: Source;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  public userrole: Role;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
