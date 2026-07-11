import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpCode, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import type { ZodIssue } from 'zod'
import { CoursesService } from './courses.service'
import { courseQuerySchema, type CourseQueryDto } from './dto/course-query.dto'
import { createCourseSchema, type CreateCourseDto } from './dto/create-course.dto'
import { updateCourseSchema, type UpdateCourseDto } from './dto/update-course.dto'
import { AdminGuard, Admin } from '@/modules/auth/auth-admin.guard'
import { success, error } from '@/common/api-response'
import { ErrorCode } from '@/common/error-codes'

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  private mapValidationErrors(issues: ZodIssue[]) {
    return issues.map(i => ({ field: i.path.join('.'), message: i.message }))
  }

  @Get()
  @ApiOperation({ summary: '获取课程列表', description: '支持分页、分类、级别、搜索筛选' })
  async findAll(@Query() query: CourseQueryDto) {
    const parsed = courseQuerySchema.safeParse(query)
    if (!parsed.success) {
      return error('Invalid query parameters', this.mapValidationErrors(parsed.error.issues))
    }
    const result = await this.coursesService.findAll(parsed.data)
    return success(result.data, { page: result.page, pageSize: result.pageSize, total: result.total })
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const course = await this.coursesService.findById(id)
    if (!course) {
      return error(ErrorCode.COURSE_NOT_FOUND)
    }
    return success(course)
  }

  @Get('series/:seriesId')
  async findBySeries(@Param('seriesId') seriesId: string) {
    const result = await this.coursesService.findBySeries(seriesId)
    return success(result)
  }

  @Post()
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async create(@Body() body: CreateCourseDto) {
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid course data', this.mapValidationErrors(parsed.error.issues))
    }
    const course = await this.coursesService.create(parsed.data)
    return success(course)
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    const parsed = updateCourseSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid course data', this.mapValidationErrors(parsed.error.issues))
    }
    const course = await this.coursesService.update(id, parsed.data)
    if (!course) {
      return error(ErrorCode.COURSE_NOT_FOUND)
    }
    return success(course)
  }

  @Post(':id/restore')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async restore(@Req() req: any, @Param('id') id: string) {
    const adminId = req.user?.id
    const course = await this.coursesService.restore(id, adminId)
    if (!course) {
      return error(ErrorCode.COURSE_NOT_FOUND)
    }
    return success(course)
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async delete(@Req() req: any, @Param('id') id: string) {
    const adminId = req.user?.id
    const course = await this.coursesService.delete(id, adminId)
    if (!course) {
      return error(ErrorCode.COURSE_NOT_FOUND)
    }
    return success(course)
  }
}
