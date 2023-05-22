import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Library extends AbstractEntity {
  @Column({ nullable: true })
  public bookname: string;

  @Column({ nullable: true })
  public libraryname: string;

  @Column({ nullable: true })
  public writer: string;

  @Column({ nullable: true })
  public publisher: string;
}
