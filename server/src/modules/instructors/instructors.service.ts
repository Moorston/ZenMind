import { Injectable } from '@nestjs/common'
import { InstructorsRepository } from '@/repositories/instructors.repository'
import type { CreateInstructorDto, UpdateInstructorDto } from './dto/create-instructor.dto'

@Injectable()
export class InstructorsService {
  constructor(private readonly instructorsRepo: InstructorsRepository) {}

  async findAll() {
    return this.instructorsRepo.findAll()
  }

  async findById(id: string) {
    return this.instructorsRepo.findById(id)
  }

  async create(data: CreateInstructorDto) {
    return this.instructorsRepo.create(data as any)
  }

  async update(id: string, data: UpdateInstructorDto) {
    return this.instructorsRepo.update(id, data as any)
  }

  async delete(id: string) {
    const deleted = await this.instructorsRepo.delete(id)
    return deleted
  }
}