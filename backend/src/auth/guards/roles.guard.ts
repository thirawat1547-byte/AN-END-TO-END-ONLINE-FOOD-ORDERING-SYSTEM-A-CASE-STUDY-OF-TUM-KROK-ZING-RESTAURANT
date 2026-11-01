import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
    }

    const userRole = (user.role || '').toString().trim().toUpperCase();
    const hasRole = requiredRoles.some((role) => {
      const r = role.trim().toUpperCase();
      if (r === userRole) return true;
      if (r === 'STAFF' && userRole === 'KITCHEN') return true;
      if (r === 'KITCHEN' && userRole === 'STAFF') return true;
      return false;
    });

    if (!hasRole) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์เข้าถึงข้อมูลหรือคำสั่งนี้');
    }

    return true;
  }
}