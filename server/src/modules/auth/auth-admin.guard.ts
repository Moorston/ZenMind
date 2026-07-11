import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const ADMIN_KEY = 'isAdmin'
export const Admin = () => SetMetadata(ADMIN_KEY, true)

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!isAdminRoute) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (!user) {
      throw new ForbiddenException('Authentication required')
    }
    if (!['admin', 'editor'].includes(user.role)) {
      throw new ForbiddenException('Admin access required')
    }
    return true
  }
}