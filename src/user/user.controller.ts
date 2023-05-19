import {
  Controller,
  Get,
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @UseGuards(RoleGuard(Role.ADMIN))
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
}
