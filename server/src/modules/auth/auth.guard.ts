import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { TokenService } from './token.service'

export const PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(PUBLIC_KEY, true)

@Injectable()
export class AuthGuard implements CanActivate {
  private reflector = new Reflector()

  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization'] || request.headers['Authorization']

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header')
    }

    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) {
      throw new UnauthorizedException('Missing token')
    }

    // 检查黑名单
    if (this.tokenService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked')
    }

    // JWT 验证
    const payload = this.tokenService.verifyAccessToken(token)
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    request.user = {
      id: payload.userId,
      email: payload.email,
      nickname: payload.nickname,
      role: payload.role,
    }
    return true
  }
}
