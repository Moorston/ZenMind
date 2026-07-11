import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SeriesService } from './series.service'
import { createSeriesSchema, updateSeriesSchema, addCoursesSchema, type CreateSeriesDto, type UpdateSeriesDto, type AddCoursesDto } from './dto/create-series.dto'
import { AdminGuard, Admin } from '@/modules/auth/auth-admin.guard'
import { success, error } from '@/common/api-response'
import { ErrorCode } from '@/common/error-codes'

@ApiTags('series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async findAll() {
    const data = await this.seriesService.findAll()
    return success(data)
  }

  @Get('recommended')
  async findRecommended() {
    const data = await this.seriesService.findRecommended()
    return success(data)
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const item = await this.seriesService.findById(id)
    if (!item) return error(ErrorCode.SERIES_NOT_FOUND)
    return success(item)
  }

  @Post()
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async create(@Body() body: CreateSeriesDto) {
    const parsed = createSeriesSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid series data', parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })))
    }
    const item = await this.seriesService.create(parsed.data)
    return success(item)
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: UpdateSeriesDto) {
    const parsed = updateSeriesSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid series data', parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })))
    }
    const item = await this.seriesService.update(id, parsed.data)
    if (!item) return error(ErrorCode.SERIES_NOT_FOUND)
    return success(item)
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    const item = await this.seriesService.delete(id)
    if (!item) return error(ErrorCode.SERIES_NOT_FOUND)
    return success(item)
  }

  @Post(':id/courses')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async addCourses(@Param('id') id: string, @Body() body: AddCoursesDto) {
    const parsed = addCoursesSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid course IDs', parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })))
    }
    const item = await this.seriesService.addCourses(id, parsed.data.courseIds)
    if (!item) return error(ErrorCode.SERIES_NOT_FOUND)
    return success(item)
  }
}
