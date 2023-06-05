import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from './entities/source.enum';
import { User } from './entities/user.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { RepoName } from './entities/error.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoleGuard } from '@guard/role.guard';
import { PageOptionDto } from '@common/dto/page-option.dto';
import { Page } from '@common/dto/page.dto';

export const repo = RepoName.USER;
@ApiTags(repo)
@Controller(repo)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('all')
  @UseGuards(RoleGuard(Role.USER)) //test용으로 잠시 user로,,
  @ApiResponse({ status: 200, description: `get all ${repo}s success` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `get all ${repo}s 페이지네이션`,
    description: '페이지네이션',
  })
  async getUsers(@Query() pageOptionDto: PageOptionDto): Promise<Page<User>> {
    return this.userService.getAllUsers(pageOptionDto);
  }

  @Get(':id')
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `success get ${repo} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: `${repo} id get`, description: `${repo} id get` })
  async getProductById(@Param('id') id: string) {
    if (id !== undefined) {
      return this.userService.getById(id);
    } else {
      throw new HttpException(`no ${repo} id`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('edit/:id')
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `success edit ${repo} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: `${repo} id edit`, description: `${repo} id edit` })
  async edit(
    @Body() updatedProductDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    await this.userService.update(updatedProductDto, id);
  }

  @Get('delete/:id')
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: `success delete ${repo} id` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `delete ${repo} id`,
    description: `delete ${repo} id`,
  })
  async deleteUser(@Param('id') id: string) {
    if (id !== undefined) {
      return this.userService.deleteUser(id);
    } else {
      throw new HttpException(`no ${repo} id`, HttpStatus.NOT_FOUND);
    }
  }

  @Post('reset/password')
  @ApiResponse({ status: 200, description: `reset password` })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({
    summary: `reset password`,
    description: `reset password`,
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.userService.decodedResetPassToken(token, password);
    console.log(token, password, '여기찍혀야돼;;');
  }
}
