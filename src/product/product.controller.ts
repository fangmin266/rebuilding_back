import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatedProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '@root/guard/role.guard';
import { Role } from '@root/user/entities/source.enum';
import { TransformInterceptor } from '@root/common/interceptor/transform.interceptor';
import { RepoName } from '@root/user/entities/error.enum';

export const repo = RepoName.PRODUCT;
@ApiTags(repo)
@Controller(repo)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: ` success create ${repo}` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: `${repo} 생성`, description: `${repo} 생성` })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get('all')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: `get ${repo} all` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: `${repo} all get`, description: `${repo} all get` })
  async getProductAll() {
    return await this.productService.getAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: `success get ${repo} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: `${repo} id get`, description: `${repo} id get` })
  async getProductById(@Param('id') id: string) {
    if (id !== undefined) {
      return this.productService.getById(id);
    } else {
      throw new HttpException(`no ${repo} id`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('edit/:id')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: `success edit ${repo} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'product id edit', description: `${repo} id edit` })
  async edit(
    @Body() updatedProductDto: UpdatedProductDto,
    @Param('id') id: string,
  ) {
    await this.productService.update(updatedProductDto, id);
  }

  @Get('delete/:id')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: `success delete ${repo} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `delete ${repo} id`,
    description: `delete ${repo} id`,
  })
  async deleteProduct(@Param('id') id: string) {
    if (id !== undefined) {
      return this.productService.deleteProduct(id);
    } else {
      throw new HttpException(`no ${repo} id`, HttpStatus.NOT_FOUND);
    }
  }
}
