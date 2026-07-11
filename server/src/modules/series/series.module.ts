import { Module } from '@nestjs/common'
import { SeriesController } from './series.controller'
import { SeriesService } from './series.service'
import { SeriesRepository } from '@/repositories/series.repository'

@Module({
  controllers: [SeriesController],
  providers: [SeriesService, SeriesRepository],
  exports: [SeriesService],
})
export class SeriesModule {}
