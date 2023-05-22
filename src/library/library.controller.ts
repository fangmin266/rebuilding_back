import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { RoleGuard } from '@root/guard/role.guard';
import { Role } from '@root/user/entities/source.enum';
import { TransformInterceptor } from '@root/common/interceptor/transform.interceptor';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'success get all library' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'get library all', description: 'get library all' })
  async getAllLibrary() {
    return this.libraryService.getAll();
  }

  @Post()
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  @ApiResponse({ status: 200, description: 'success post library' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'post library', description: 'post library' })
  async postLibrary() {
    await this.libraryService.create();
  }
}
