import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@root/product/entities/product.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Entity } from 'typeorm';

@Entity()
export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public contents: string;

  public product: Product;

  @ApiProperty()
  @IsNotEmpty()
  public productId: string;
}
