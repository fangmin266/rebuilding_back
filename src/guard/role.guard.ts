import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from '@root/user/entities/source.enum';
import { JwtAuthGuard } from './jwtAuth.guard';
import { RequestWithUserInterface } from '@root/auth/interface/requestWithUser.interface';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
      const request = context
        .switchToHttp()
        .getRequest<RequestWithUserInterface>();
      const user = request.user;
      return user?.userrole.includes(role);
    }
  }
  return mixin(RoleGuardMixin);
};
