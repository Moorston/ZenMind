import { Controller, Get, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { MetricsService } from './metrics.service'
import { Public } from '@/modules/auth/auth.guard'

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics()
    res.set('Content-Type', 'text/plain')
    res.send(metrics)
  }
}