import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@root/guard/jwtAuth.guard';
import { TransformInterceptor } from '@root/common/interceptor/transform.interceptor';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'success edit product id' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'product comment', description: 'product comment' })
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }
}
