import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import { AdminGuard } from './auth-admin.guard'
import { TokenService } from './token.service'
import { EmailService } from './email.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminGuard, TokenService, EmailService],
  exports: [AuthService, AuthGuard, AdminGuard, TokenService],
})
export class AuthModule {}
