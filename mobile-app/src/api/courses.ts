import { Network } from './network'

export namespace CoursesAPI {
  export interface Course {
    id: string
    title: string
    description: string
    category: string
    level: string
    duration: number
    coverUrl: string
    audioUrl: string
    tags: string
    instructorId: string | null
    seriesId: string | null
    orderInSeries: number
    createdAt: string
    instructor?: { id: string; name: string; avatarUrl: string }
    series?: { id: string; title: string }
  }

  export interface Series {
    id: string
    title: string
    description: string
    coverUrl: string
    level: string
    estimatedDays: number
    isRecommended: boolean
    order: number
    createdAt: string
    courses?: Course[]
  }

  export interface Instructor {
    id: string
    name: string
    avatarUrl: string
    bio: string
    voiceType: string
    createdAt: string
  }

  export type CourseCategory = 'breathing' | 'body-scan' | 'visualization' | 'loving-kindness' | 'mindfulness'
  export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

  export interface CourseQuery {
    category?: CourseCategory
    level?: CourseLevel
    seriesId?: string
    instructorId?: string
    search?: string
    page?: number
    pageSize?: number
  }

  export async function getCourses(params?: CourseQuery) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const qs = searchParams.toString()
    return Network.request<{ data: Course[]; total: number }>({
      url: `/api/courses${qs ? `?${qs}` : ''}`,
    })
  }

  export async function getCourseById(id: string) {
    return Network.request<{ data: Course }>({ url: `/api/courses/${id}` })
  }

  export async function getCoursesBySeries(seriesId: string) {
    return Network.request<{ data: Course[] }>({ url: `/api/courses/series/${seriesId}` })
  }

  export async function getSeries() {
    return Network.request<{ data: Series[] }>({ url: '/api/series' })
  }

  export async function getRecommendedSeries() {
    return Network.request<{ data: Series[] }>({ url: '/api/series/recommended' })
  }

  export async function getInstructors() {
    return Network.request<{ data: Instructor[] }>({ url: '/api/instructors' })
  }

  export async function updateProgress(
    userId: string,
    courseId: string,
    data: { position: number; completed: boolean }
  ) {
    return Network.request<{ data: any }>({
      url: `/api/progress/${userId}/${courseId}`,
      method: 'PUT',
      data,
    })
  }

  export async function markCompleted(userId: string, courseId: string) {
    return Network.request<{ data: any }>({
      url: `/api/progress/${userId}/${courseId}/complete`,
      method: 'POST',
    })
  }

  export interface RecommendedCourse extends Course {
    reason: string
    reasonType: 'collaborative' | 'time-based' | 'trending' | 'similar' | 'fallback'
  }

  export async function getPersonalizedRecommendations(preference?: string) {
    const qs = preference ? `?preference=${encodeURIComponent(preference)}` : ''
    return Network.request<{ data: RecommendedCourse[] }>({
      url: `/api/recommendations/personalized${qs}`,
    })
  }

  export async function getSimilarCourses(courseId: string) {
    return Network.request<{ data: RecommendedCourse[] }>({
      url: `/api/recommendations/similar/${courseId}`,
    })
  }

  export async function getTrendingCourses() {
    return Network.request<{ data: RecommendedCourse[] }>({
      url: '/api/recommendations/trending',
    })
  }

  export async function recordPlay(courseId: string, playedSeconds: number) {
    return Network.request<{ data: any }>({
      url: '/api/recommendations/play',
      method: 'POST',
      data: { courseId, playedSeconds },
    })
  }
}
