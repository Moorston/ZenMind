import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { InstructorsService } from './instructors.service'
import { createInstructorSchema, updateInstructorSchema, type CreateInstructorDto, type UpdateInstructorDto } from './dto/create-instructor.dto'
import { AdminGuard, Admin } from '@/modules/auth/auth-admin.guard'
import { success, error } from '@/common/api-response'
import { ErrorCode } from '@/common/error-codes'

@ApiTags('instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get()
  async findAll() {
    const data = await this.instructorsService.findAll()
    return success(data)
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const instructor = await this.instructorsService.findById(id)
    if (!instructor) return error(ErrorCode.INSTRUCTOR_NOT_FOUND)
    return success(instructor)
  }

  @Post()
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async create(@Body() body: CreateInstructorDto) {
    const parsed = createInstructorSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid instructor data', parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })))
    }
    const instructor = await this.instructorsService.create(parsed.data)
    return success(instructor)
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: UpdateInstructorDto) {
    const parsed = updateInstructorSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid instructor data', parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })))
    }
    const instructor = await this.instructorsService.update(id, parsed.data)
    if (!instructor) return error(ErrorCode.INSTRUCTOR_NOT_FOUND)
    return success(instructor)
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    const instructor = await this.instructorsService.delete(id)
    if (!instructor) return error(ErrorCode.INSTRUCTOR_NOT_FOUND)
    return success(instructor)
  }
}
