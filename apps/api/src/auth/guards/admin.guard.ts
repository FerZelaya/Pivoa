import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { User } from '@supabase/supabase-js';
import { ADMIN_ROUTE_KEY } from '../decorators/admin.decorator.js';
import { isAdminEmail } from '../../common/plans.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(ADMIN_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isAdminRoute) return true;

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const allowed = isAdminEmail(request.user?.email, this.config.get<string>('ADMIN_EMAILS'));
    if (!allowed) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
