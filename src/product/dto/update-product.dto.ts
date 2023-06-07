import { Entity } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AbstractEntity } from '@user/entities/abstract.entity';

@Entity()
export class UpdatedProductDto extends AbstractEntity {
  @IsString()
  public title?: string;

  @IsString()
  public content?: string;

  @IsString()
  @IsNotEmpty()
  public startFunding?: string;

  @IsString()
  public endFunding?: string;

  @IsString()
  @IsNotEmpty()
  public startDelivery?: string;

  @IsNumber()
  public deliveryFee?: number;

  @IsNumber()
  public productLimit?: number;

  @IsNumber()
  public price?: number;
}
