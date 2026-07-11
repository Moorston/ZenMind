import { Controller, Get, Post, Param, Body, Req, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { RecommendationsService } from './recommendations.service'
import { AuthGuard, Public } from '@/modules/auth/auth.guard'
import { success, error } from '@/common/api-response'

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('personalized')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 req/min
  @ApiOperation({ summary: '获取个性化推荐课程（需登录）' })
  async getPersonalized(@Req() req: any, @Query('preference') preference?: string) {
    const userId = req.user?.id
    if (!userId) return error('Unauthorized')
    const courses = await this.recommendationsService.getPersonalized(userId, preference)
    return success(courses)
  }

  @Get('similar/:courseId')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: '获取相似课程推荐' })
  async getSimilar(@Param('courseId') courseId: string) {
    if (!courseId) return error('courseId is required')
    const courses = await this.recommendationsService.getSimilar(courseId)
    return success(courses)
  }

  @Get('trending')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: '获取热门课程' })
  async getTrending() {
    const courses = await this.recommendationsService.getTrending()
    return success(courses)
  }

  @Post('play')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min (播放上报频率更高)
  @ApiOperation({ summary: '记录用户播放行为' })
  async recordPlay(@Req() req: any, @Body() body: { courseId: string; playedSeconds: number }) {
    const userId = req.user?.id
    if (!userId) return error('Unauthorized')
    if (!body.courseId) return error('courseId is required')
    await this.recommendationsService.recordPlay(userId, body.courseId, body.playedSeconds || 0)
    return success({ recorded: true })
  }
}