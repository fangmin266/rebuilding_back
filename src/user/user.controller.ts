import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RoleGuard } from '@root/guard/role.guard';
import { Role } from './entities/source.enum';
import { PageOptionDto } from '@root/common/dto/page-option.dto';
import { User } from './entities/user.entity';
import { Page } from '@root/common/dto/page.dto';
import { TransformInterceptor } from '@root/common/interceptor/transform.interceptor';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @UseGuards(RoleGuard(Role.USER)) //test용으로 잠시 user로,,
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'get all users success' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'get all users 페이지네이션',
    description: '페이지네이션',
  })
  async getUsers(@Query() pageOptionDto: PageOptionDto): Promise<Page<User>> {
    return this.userService.getAllUsers(pageOptionDto);
  }

  @Get(':id')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'success get user id' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'user id get', description: 'user id get' })
  async getProductById(@Param('id') id: string) {
    if (id !== undefined) {
      return this.userService.getById(id);
    } else {
      throw new HttpException('product id가 없습니다', HttpStatus.NOT_FOUND);
    }
  }

  @Get('edit/:id')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'success edit user id' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'user id edit', description: 'user id edit' })
  async edit(
    @Body() updatedProductDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    await this.userService.update(updatedProductDto, id);
  }

  @Get('delete/:id')
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'success delete user id' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: 'delete product id',
    description: 'delete product id',
  })
  async deleteUser(@Param('id') id: string) {
    if (id !== undefined) {
      return this.userService.deleteUser(id);
    } else {
      throw new HttpException('product id가 없습니다', HttpStatus.NOT_FOUND);
    }
  }
}
