import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { JwtAuthGuard } from './jwtAuth.guard';
import { Role } from '@user/entities/source.enum';
import { RequestWithUserInterface } from '@auth/interface/requestWithUser.interface';

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
// import { CanActivate, ExecutionContext } from '@nestjs/common';
// import { Role } from '@user/entities/source.enum';
// import { RequestWithUserInterface } from '@auth/interface/requestWithUser.interface';

// export class RoleGuard implements CanActivate {
//   constructor(private readonly role: Role) {}

//   canActivate(context: ExecutionContext): boolean {
//     const request = context
//       .switchToHttp()
//       .getRequest<RequestWithUserInterface>();
//     const user = request.user;
//     return user?.userrole.includes(this.role);
//   }
// }
