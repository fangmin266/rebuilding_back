import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from './abstract.entity';
import { Role, Source } from './source.enum';
import { ApiProperty } from '@nestjs/swagger';
import * as grabatar from 'gravatar';
import { Profile } from '@root/profile/entities/profile.entity';
import { Product } from '@root/product/entities/product.entity';
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
  profile_img: string;

  @OneToOne(() => Profile, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  public profile: Profile;

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
    default: [Role.USER],
    array: true,
  })
  public userrole: Role[]; //ex) user이면서 admin인

  @ManyToMany(() => Product, (product: Product) => product.fundingList)
  @JoinTable()
  public fundingProducts: Product[];

  @ApiProperty()
  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  // @BeforeUpdate() //typeorm 이슈 사용할수 x , userRepository.update 대신 .save 사용
  @BeforeInsert()
  async generateSomething() {
    this.profile_img = await grabatar.url(this.email, {
      // generate profile image
      s: '100',
      protocol: 'https',
    });

    const saltValue = await bcrypt.genSalt(10); //generate hash password
    this.password = await bcrypt.hash(this.password, saltValue);
  }
}
