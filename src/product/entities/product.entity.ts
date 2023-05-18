import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Product extends AbstractEntity {
  @Column()
  public name: string;

  @Column()
  public price: number;

  @Column()
  public description: string;
}
