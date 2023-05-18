import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RoleGuard } from '@root/guard/role.guard';
import { Role } from './entities/source.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RoleGuard(Role.USER))
  @Get('all')
  async getUsers() {
    return this.userService.getAllUsers();
  }
}
