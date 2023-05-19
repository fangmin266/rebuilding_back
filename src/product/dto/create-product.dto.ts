import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Entity } from 'typeorm';

@Entity()
export class CreateProductDto extends AbstractEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public startFunding: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public endFunding: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public startDeleviery: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public deliveryFee: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public productLimit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public price: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public productNum: string;
}
