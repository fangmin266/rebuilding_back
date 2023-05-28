import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Product } from '@product/entities/product.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    public readonly commentRepo: Repository<Comment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const product = await this.productRepository.findOneBy({
      id: createCommentDto.productId,
    });

    const comment = new Comment();
    comment.contents = createCommentDto.contents;
    comment.product = product;

    return await this.commentRepo.save(comment);
  }
}
