import { Comment } from '@comment/entities/comment.entity';
import { AbstractEntity } from '@user/entities/abstract.entity';
import { User } from '@user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';

@Entity()
export class Product extends AbstractEntity {
  @Column({ nullable: true })
  public title: string;

  @Column()
  public content: string;

  @Column()
  public startFunding: string;

  @Column()
  public endFunding: string;

  @Column()
  public startDeleviery: string;

  @Column()
  public deliveryFee: number;

  @Column()
  public productLimit: number;

  @Column()
  public price: number;

  @Column()
  public productNum: string;

  @ManyToMany(() => User, (user: User) => user.fundingProducts)
  @JoinTable()
  public fundingList: User[];

  @OneToMany(() => Comment, (comment: Comment) => comment.product)
  public comment: Comment[];

  @BeforeInsert()
  async generateProductNum() {
    const randomNum = Math.floor(Math.random() * 10000) + 1;
    var today = new Date();

    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);

    var dateString = year + month + day;
    this.productNum = dateString + randomNum;
  }
}
