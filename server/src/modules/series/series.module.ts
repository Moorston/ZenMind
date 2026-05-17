import { Module } from '@nestjs/common'
import { SeriesController } from './series.controller'
import { SeriesService } from './series.service'
import { CoursesModule } from '@/modules/courses/courses.module'

@Module({
  imports: [CoursesModule],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
