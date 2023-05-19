import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Entity } from 'typeorm';
import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Entity()
export class UpdatedProductDto extends AbstractEntity {
  @ApiProperty()
  @IsString()
  public title?: string;

  @ApiProperty()
  @IsString()
  public content?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public startFunding?: string;

  @ApiProperty()
  @IsString()
  public endFunding?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public startDeleviery?: string;

  @ApiProperty()
  @IsNumber()
  public deliveryFee?: number;

  @ApiProperty()
  @IsNumber()
  public productLimit?: number;

  @ApiProperty()
  @IsNumber()
  public price?: number;
}
