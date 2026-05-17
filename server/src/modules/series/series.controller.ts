import { Controller, Get, Param } from '@nestjs/common'
import { SeriesService } from './series.service'

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async findAll() {
    const data = await this.seriesService.findAll()
    return { status: 'success', data }
  }

  @Get('recommended')
  async findRecommended() {
    const data = await this.seriesService.findRecommended()
    return { status: 'success', data }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const item = await this.seriesService.findById(id)
    if (!item) return { status: 'error', message: 'Series not found' }
    return { status: 'success', data: item }
  }
}
