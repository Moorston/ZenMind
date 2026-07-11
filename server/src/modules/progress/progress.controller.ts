import { Controller, Get, Put, Post, Param, Body, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ProgressService } from './progress.service'
import { success, error } from '@/common/api-response'
import { ErrorCode } from '@/common/error-codes'

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    const data = await this.progressService.getAllProgress(userId)
    return success(data)
  }

  @Get(':userId/:courseId')
  async getOne(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    const data = await this.progressService.getProgress(userId, courseId)
    if (!data) return error(ErrorCode.PROGRESS_NOT_FOUND)
    return success(data)
  }

  @Put(':userId/:courseId')
  async update(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { position?: number; completed?: boolean },
  ) {
    const position = typeof body.position === 'number' ? Math.max(0, Math.floor(body.position)) : undefined
    const completed = typeof body.completed === 'boolean' ? body.completed : undefined
    const data = await this.progressService.updateProgress(userId, courseId, { position, completed })
    return success(data)
  }

  @Post(':userId/:courseId/complete')
  async complete(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    const data = await this.progressService.markCompleted(userId, courseId)
    return success(data)
  }
}
