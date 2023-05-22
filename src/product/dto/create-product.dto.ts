import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Entity } from 'typeorm';

@Entity()
export class CreateProductDto extends AbstractEntity {
  @IsNumber()
  @IsNotEmpty()
  public productNum: string;

  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsString()
  @IsNotEmpty()
  public startFunding: string;

  @IsString()
  @IsNotEmpty()
  public endFunding: string;

  @IsString()
  @IsNotEmpty()
  public startDeleviery: string;

  @IsNumber()
  @IsNotEmpty()
  public deliveryFee: number;

  @IsNumber()
  @IsNotEmpty()
  public productLimit: number;

  @IsNumber()
  @IsNotEmpty()
  public price: number;
}
