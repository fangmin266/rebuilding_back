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

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  async getAllLibrary() {
    return this.libraryService.getAll();
  }

  @Post()
  @UseGuards(RoleGuard(Role.USER))
  @UseInterceptors(TransformInterceptor)
  async postLibrary() {
    await this.libraryService.create();
  }
}
