import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParam } from './page-meta.dto-parameter';

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemcount: number;

  @ApiProperty()
  readonly pagecount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionDto, itemCount }: PageMetaDtoParam) {
    this.page = pageOptionDto.page;
    this.take = pageOptionDto.take;
    this.itemcount = itemCount;
    this.pagecount = Math.ceil(this.itemcount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pagecount;
  }
}
