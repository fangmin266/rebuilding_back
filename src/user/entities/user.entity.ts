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
import { Provider, Role } from './source.enum';
import * as grabatar from 'gravatar';
import { Profile } from '@root/profile/entities/profile.entity';
import { Product } from '@product/entities/product.entity';

@Entity()
export class User extends AbstractEntity {
  @Column({ nullable: true })
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  @Exclude() // password 출력되지 않음
  public password?: string;

  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @Column({ nullable: true })
  profile_img: string;

  @Column({ nullable: true })
  application_id: string;

  @OneToOne(() => Profile, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  public profile: Profile;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.LOCAL,
  })
  public provider: Provider;

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

  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column({ default: false })
  isMarketing: boolean;

  @Column({ default: false })
  isPersonalInfo: boolean;

  // @BeforeUpdate() //typeorm 이슈 사용할수 x , userRepository.update 대신 .save 사용
  @BeforeInsert()
  async generateSomething() {
    this.profile_img = await grabatar.url(this.email, {
      // generate profile image
      s: '100',
      protocol: 'https',
    });

    //password가 있을때만
    if (this.password) {
      const saltValue = await bcrypt.genSalt(10); // generate hashed password
      this.password = await bcrypt.hash(this.password, saltValue);
    }
  }
}
