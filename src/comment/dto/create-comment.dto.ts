import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@product/entities/product.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Entity } from 'typeorm';

@Entity()
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  public contents: string;

  public product: Product;

  @IsNotEmpty()
  public productId: string;
}
