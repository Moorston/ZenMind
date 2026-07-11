import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { AuthGuard } from '@/modules/auth/auth.guard'
import { AdminGuard, Admin } from '@/modules/auth/auth-admin.guard'
import { success } from '@/common/api-response'

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(AuthGuard, AdminGuard)
@Admin()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('users')
  getUserGrowth() {
    return success(this.analyticsService.getUserGrowth())
  }

  @Get('courses')
  getCourseStats() {
    return success(this.analyticsService.getCourseStats())
  }

  @Get('retention')
  getRetention() {
    return success(this.analyticsService.getRetentionRate())
  }
}