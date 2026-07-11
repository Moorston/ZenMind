import { Network } from '@/network'
import type { ApiResponse, PaginatedResponse } from './types'

export interface CourseDTO {
  id: string
  title: string
  description: string
  category: 'breathing' | 'body-scan' | 'visualization' | 'loving-kindness' | 'mindfulness'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  coverUrl: string
  audioUrl: string
  tags: string[]
  instructorId: string | null
  seriesId: string | null
  orderInSeries: number | null
  instructor?: InstructorDTO | null
  series?: SeriesDTO | null
}

export interface InstructorDTO {
  id: string
  name: string
  avatarUrl: string
  bio: string
  voiceType: string
}

export interface SeriesDTO {
  id: string
  title: string
  description: string
  coverUrl: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimatedDays: number
  courseIds: string[]
  isRecommended: boolean
  order: number
}

export interface ProgressDTO {
  userId: string
  courseId: string
  position: number
  completed: boolean
  completedAt: string | null
}

export interface CourseQuery {
  category?: string
  level?: string
  seriesId?: string
  instructorId?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface RecommendedCourseDTO extends CourseDTO {
  reason: string
  reasonType: 'collaborative' | 'time-based' | 'trending' | 'similar' | 'fallback'
}

export const CourseAPI = {
  async getCourses(query?: CourseQuery): Promise<PaginatedResponse<CourseDTO>> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)) })
    }
    const qs = params.toString()
    const res = await Network.request<{ status: string; data: PaginatedResponse<CourseDTO> }>({
      url: `/api/courses${qs ? `?${qs}` : ''}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getCourseById(id: string): Promise<CourseDTO | null> {
    const res = await Network.request<{ status: string; data: CourseDTO | null }>({
      url: `/api/courses/${id}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getCoursesBySeries(seriesId: string): Promise<CourseDTO[]> {
    const res = await Network.request<{ status: string; data: CourseDTO[] }>({
      url: `/api/courses/series/${seriesId}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getSeries(): Promise<SeriesDTO[]> {
    const res = await Network.request<{ status: string; data: SeriesDTO[] }>({
      url: '/api/series',
      timeout: 10000,
    })
    return res.data.data
  },

  async getRecommendedSeries(): Promise<SeriesDTO[]> {
    const res = await Network.request<{ status: string; data: SeriesDTO[] }>({
      url: '/api/series/recommended',
      timeout: 10000,
    })
    return res.data.data
  },

  async getSeriesById(id: string): Promise<SeriesDTO | null> {
    const res = await Network.request<{ status: string; data: SeriesDTO | null }>({
      url: `/api/series/${id}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getInstructors(): Promise<InstructorDTO[]> {
    const res = await Network.request<{ status: string; data: InstructorDTO[] }>({
      url: '/api/instructors',
      timeout: 10000,
    })
    return res.data.data
  },

  async getProgress(userId: string): Promise<ProgressDTO[]> {
    const res = await Network.request<{ status: string; data: ProgressDTO[] }>({
      url: `/api/progress/${userId}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getCourseProgress(userId: string, courseId: string): Promise<ProgressDTO | null> {
    const res = await Network.request<{ status: string; data: ProgressDTO | null }>({
      url: `/api/progress/${userId}/${courseId}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async updateProgress(userId: string, courseId: string, data: { position?: number; completed?: boolean }): Promise<ProgressDTO> {
    const res = await Network.request<{ status: string; data: ProgressDTO }>({
      url: `/api/progress/${userId}/${courseId}`,
      method: 'PUT',
      data,
      timeout: 10000,
    })
    return res.data.data
  },

  async completeCourse(userId: string, courseId: string): Promise<ProgressDTO> {
    const res = await Network.request<{ status: string; data: ProgressDTO }>({
      url: `/api/progress/${userId}/${courseId}/complete`,
      method: 'POST',
      timeout: 10000,
    })
    return res.data.data
  },

  async getPersonalizedRecommendations(preference?: string): Promise<RecommendedCourseDTO[]> {
    const qs = preference ? `?preference=${encodeURIComponent(preference)}` : ''
    const res = await Network.request<{ status: string; data: RecommendedCourseDTO[] }>({
      url: `/api/recommendations/personalized${qs}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getSimilarCourses(courseId: string): Promise<RecommendedCourseDTO[]> {
    const res = await Network.request<{ status: string; data: RecommendedCourseDTO[] }>({
      url: `/api/recommendations/similar/${courseId}`,
      timeout: 10000,
    })
    return res.data.data
  },

  async getTrendingCourses(): Promise<RecommendedCourseDTO[]> {
    const res = await Network.request<{ status: string; data: RecommendedCourseDTO[] }>({
      url: '/api/recommendations/trending',
      timeout: 10000,
    })
    return res.data.data
  },

  async recordPlay(courseId: string, playedSeconds: number): Promise<void> {
    await Network.request<{ status: string }>({
      url: '/api/recommendations/play',
      method: 'POST',
      data: { courseId, playedSeconds },
      timeout: 10000,
    })
  },
}
