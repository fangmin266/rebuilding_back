import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatedProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '@guard/role.guard';
import { Role } from '@user/entities/source.enum';

// import { 'product'Name } from '@root/user/entities/error.enum';

// export const 'product' = 'product'Name.PRODUCT;
@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: ` success create ${'product'}` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `${'product'} 생성`,
    description: `${'product'} 생성`,
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get('all')
  // @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `get ${'product'} all` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `${'product'} all get`,
    description: `${'product'} all get`,
  })
  async getProductAll() {
    return await this.productService.getAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `success get ${'product'} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `${'product'} id get`,
    description: `${'product'} id get`,
  })
  async getProductById(@Param('id') id: string) {
    if (id !== undefined) {
      return this.productService.getById(id);
    } else {
      throw new HttpException(`no ${'product'} id`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('edit/:id')
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `success edit ${'product'} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'product id edit',
    description: `${'product'} id edit`,
  })
  async edit(
    @Body() updatedProductDto: UpdatedProductDto,
    @Param('id') id: string,
  ) {
    await this.productService.update(updatedProductDto, id);
  }

  @Get('delete/:id')
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `success delete ${'product'} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `delete ${'product'} id`,
    description: `delete ${'product'} id`,
  })
  async deleteProduct(@Param('id') id: string) {
    if (id !== undefined) {
      return this.productService.deleteProduct(id);
    } else {
      throw new HttpException(`no ${'product'} id`, HttpStatus.NOT_FOUND);
    }
  }
}
