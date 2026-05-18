import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body('email') email: string) {
    if (!email) {
      return { status: 'error', message: 'Email is required' }
    }
    const result = await this.authService.sendVerificationCode(email)
    return { status: 'success', data: result }
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('nickname') nickname: string,
    @Body('code') code: string,
  ) {
    if (!email || !password || !nickname || !code) {
      return { status: 'error', message: 'Email, password, nickname and code are required' }
    }
    const result = await this.authService.register(email, password, nickname, code)
    if (!result) {
      return { status: 'error', message: 'Invalid or expired verification code' }
    }
    return { status: 'success', data: result }
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      return { status: 'error', message: 'Email and password are required' }
    }
    const result = await this.authService.login(email, password)
    if (!result) {
      return { status: 'error', message: 'Invalid email or password' }
    }
    return { status: 'success', data: result }
  }
}
