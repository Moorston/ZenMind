import { Module } from '@nestjs/common'
import { InstructorsController } from './instructors.controller'
import { InstructorsService } from './instructors.service'
import { InstructorsRepository } from '@/repositories/instructors.repository'

@Module({
  controllers: [InstructorsController],
  providers: [InstructorsService, InstructorsRepository],
  exports: [InstructorsService],
})
export class InstructorsModule {}
