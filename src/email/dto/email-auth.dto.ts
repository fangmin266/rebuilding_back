import { IsNumber } from 'class-validator';

export class EmailAuthDto {
  @IsNumber()
  confirmNumber: number;
}
