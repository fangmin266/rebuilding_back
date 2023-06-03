import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Product } from '@product/entities/product.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Product]),
    JwtModule.register({}),
  ],
  controllers: [CommentController],
  providers: [CommentService, JwtService],
})
export class CommentModule {}
