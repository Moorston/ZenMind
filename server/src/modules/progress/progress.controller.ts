import { Controller, Get, Put, Post, Param, Body, HttpCode } from '@nestjs/common'
import { ProgressService } from './progress.service'

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    const data = await this.progressService.getAllProgress(userId)
    return { status: 'success', data }
  }

  @Get(':userId/:courseId')
  async getOne(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    const data = await this.progressService.getProgress(userId, courseId)
    return { status: 'success', data }
  }

  @Put(':userId/:courseId')
  @HttpCode(200)
  async update(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { position?: number; completed?: boolean },
  ) {
    const position = typeof body.position === 'number' ? Math.max(0, Math.floor(body.position)) : undefined
    const completed = typeof body.completed === 'boolean' ? body.completed : undefined
    const data = await this.progressService.updateProgress(userId, courseId, { position, completed })
    return { status: 'success', data }
  }

  @Post(':userId/:courseId/complete')
  @HttpCode(200)
  async complete(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    const data = await this.progressService.markCompleted(userId, courseId)
    return { status: 'success', data }
  }
}
