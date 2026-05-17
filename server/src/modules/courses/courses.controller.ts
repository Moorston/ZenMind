import { Controller, Get, Param, Query } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { courseQuerySchema, type CourseQueryDto } from './dto/course-query.dto'

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Query() query: CourseQueryDto) {
    const parsed = courseQuerySchema.safeParse(query)
    if (!parsed.success) {
      return { status: 'error', message: 'Invalid query parameters', errors: parsed.error.issues }
    }
    const result = await this.coursesService.findAll(parsed.data)
    return { status: 'success', data: result }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const course = await this.coursesService.findById(id)
    if (!course) {
      return { status: 'error', message: 'Course not found' }
    }
    return { status: 'success', data: course }
  }

  @Get('series/:seriesId')
  async findBySeries(@Param('seriesId') seriesId: string) {
    const result = await this.coursesService.findBySeries(seriesId)
    return { status: 'success', data: result }
  }
}
