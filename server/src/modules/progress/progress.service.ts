import { Injectable } from '@nestjs/common'
import { ProgressRepository } from '@/repositories/progress.repository'

@Injectable()
export class ProgressService {
  constructor(private readonly progressRepo: ProgressRepository) {}

  async getProgress(userId: string, courseId: string) {
    return this.progressRepo.findByUserAndCourse(userId, courseId)
  }

  async getAllProgress(userId: string) {
    return this.progressRepo.findByUser(userId)
  }

  async updateProgress(userId: string, courseId: string, data: { position?: number; completed?: boolean }) {
    return this.progressRepo.upsert(userId, courseId, data)
  }

  async markCompleted(userId: string, courseId: string) {
    return this.progressRepo.markCompleted(userId, courseId)
  }
}