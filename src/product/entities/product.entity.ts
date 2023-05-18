import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column()
  public name: string;

  @Column()
  public price: number;

  @Column()
  public description: string;
}
