import { Injectable } from '@nestjs/common'
import { SeriesRepository } from '@/repositories/series.repository'
import type { CreateSeriesDto, UpdateSeriesDto } from './dto/create-series.dto'

@Injectable()
export class SeriesService {
  constructor(private readonly seriesRepo: SeriesRepository) {}

  async findAll() {
    const seriesList = await this.seriesRepo.findAll()
    return this.populateCourses(seriesList)
  }

  async findById(id: string) {
    const item = await this.seriesRepo.findById(id)
    if (!item) return null
    const [populated] = await this.populateCourses([item])
    return populated
  }

  async findRecommended() {
    const seriesList = await this.seriesRepo.findRecommended()
    return this.populateCourses(seriesList)
  }

  async create(data: CreateSeriesDto) {
    return this.seriesRepo.create(data as any)
  }

  async update(id: string, data: UpdateSeriesDto) {
    return this.seriesRepo.update(id, data as any)
  }

  async delete(id: string) {
    const deleted = await this.seriesRepo.delete(id)
    return deleted
  }

  async addCourses(seriesId: string, courseIds: string[]) {
    return this.seriesRepo.addCourses(seriesId, courseIds)
  }

  private async populateCourses(seriesList: any[]) {
    if (seriesList.length === 0) return []
    return seriesList.map(s => ({ ...s, courseList: [], courseIds: [] }))
  }
}