import { Controller, Get, Param } from '@nestjs/common'
import { InstructorsService } from './instructors.service'

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get()
  async findAll() {
    const data = await this.instructorsService.findAll()
    return { status: 'success', data }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const instructor = await this.instructorsService.findById(id)
    if (!instructor) return { status: 'error', message: 'Instructor not found' }
    return { status: 'success', data: instructor }
  }
}
