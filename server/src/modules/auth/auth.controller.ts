import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { Public } from './auth.guard'
import { success, error } from '@/common/api-response'
import { ErrorCode } from '@/common/error-codes'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-code')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendCode(@Body('email') email: string) {
    if (!email) return error(ErrorCode.AUTH_EMAIL_REQUIRED)
    const result = this.authService.sendVerificationCode(email)
    if (!result.success) return error(ErrorCode.VALIDATION_FAILED, [{ field: 'email', message: result.message }])
    return success(result)
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body('email') email: string, @Body('password') password: string, @Body('nickname') nickname: string, @Body('code') code: string) {
    if (!email || !password || !nickname || !code) {
      return error(ErrorCode.VALIDATION_FAILED, [
        ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
        ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
        ...(!nickname ? [{ field: 'nickname', message: 'Nickname is required' }] : []),
        ...(!code ? [{ field: 'code', message: 'Verification code is required' }] : []),
      ])
    }
    const result = await this.authService.register(email, password, nickname, code)
    if (!result) return error(ErrorCode.AUTH_VERIFICATION_CODE_INVALID)
    if (result.error) return error(ErrorCode.VALIDATION_FAILED, [{ field: 'password', message: result.error }])
    return success(result)
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      return error(ErrorCode.VALIDATION_FAILED, [
        ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
        ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
      ])
    }
    const result = await this.authService.login(email, password)
    if (!result) return error(ErrorCode.AUTH_INVALID_CREDENTIALS)
    return success(result)
  }

  @Public()
  @Post('wechat-login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async wechatLogin(@Body('code') code: string) {
    if (!code) return error(ErrorCode.AUTH_WECHAT_CODE_REQUIRED)
    const result = await this.authService.wechatLogin(code)
    if (!result) return error(ErrorCode.AUTH_WECHAT_LOGIN_FAILED)
    return success(result)
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) return error(ErrorCode.AUTH_TOKEN_INVALID)
    const result = this.authService.refreshToken(refreshToken)
    if (!result) return error(ErrorCode.AUTH_TOKEN_EXPIRED)
    return success(result)
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization']
    const token = authHeader?.replace(/^Bearer\s+/i, '')
    if (!token) return error(ErrorCode.AUTH_TOKEN_MISSING)
    const result = this.authService.logout(token)
    return success({ loggedOut: result })
  }

  @Post('logout-all')
  @HttpCode(200)
  async logoutAll(@Req() req: any) {
    const userId = req.user?.id
    if (!userId) return error(ErrorCode.AUTH_TOKEN_INVALID)
    const count = this.authService.logoutAll(userId)
    return success({ loggedOut: count })
  }
}
