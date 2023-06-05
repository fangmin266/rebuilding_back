import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleGuard } from '@guard/role.guard';
import { Role } from '@user/entities/source.enum';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: 'success get all library' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'get library all', description: 'get library all' })
  async getAllLibrary() {
    return this.libraryService.getAll();
  }

  @Post()
  @UseGuards(RoleGuard(Role.USER))
  @ApiResponse({ status: 200, description: 'success post library' })
  @ApiResponse({ status: 401, description: 'forbidden' })
  @ApiOperation({ summary: 'post library', description: 'post library' })
  async postLibrary() {
    await this.libraryService.create();
  }
}
