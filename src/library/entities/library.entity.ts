import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '@root/user/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Library extends AbstractEntity {
  @ApiProperty()
  @Column({ nullable: true })
  public bookname: string;

  @ApiProperty()
  @Column({ nullable: true })
  public libraryname: string;

  @ApiProperty()
  @Column({ nullable: true })
  public writer: string;

  @ApiProperty()
  @Column({ nullable: true })
  public publisher: string;
}
