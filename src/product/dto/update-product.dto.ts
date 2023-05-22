import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Entity } from 'typeorm';
import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  public startDeleviery?: string;

  @IsNumber()
  public deliveryFee?: number;

  @IsNumber()
  public productLimit?: number;

  @IsNumber()
  public price?: number;
}
