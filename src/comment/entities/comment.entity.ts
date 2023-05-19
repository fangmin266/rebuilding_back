import { Product } from '@root/product/entities/product.entity';
import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Comment extends AbstractEntity {
  @Column()
  contents: string;

  @ManyToOne(() => Product, (product: Product) => product.comment)
  product: Product;
}
