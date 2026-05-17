import { create } from 'zustand'
import i18n from '@/i18n'
import { CourseAPI, type CourseDTO, type SeriesDTO, type InstructorDTO } from '@/api/courses'
import { CATEGORY_MAP, LEVEL_LABELS } from './constants'

export function getDisplayCategory(category: string): string {
  const mapped = CATEGORY_MAP[category] || category
  try { return i18n.t(`common.category.${mapped}`, mapped) } catch { return mapped }
}

export function getLevelLabel(level: string): string {
  const label = LEVEL_LABELS[level] || level
  try { return i18n.t(`common.level.${level}`, label) } catch { return label }
}

interface CoursesState {
  courses: CourseDTO[]
  series: SeriesDTO[]
  instructors: InstructorDTO[]
  loading: boolean
  initialized: boolean

  fetchCourses: (query?: { category?: string; level?: string; search?: string }) => Promise<void>
  fetchSeries: () => Promise<void>
  fetchInstructors: () => Promise<void>
  initialize: () => Promise<void>

  getCourseById: (id: string) => CourseDTO | undefined
  getCoursesBySeries: (seriesId: string) => CourseDTO[]
  getRecommendedSeries: () => SeriesDTO[]
  getCourseProgress: (courseId: string) => any
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  series: [],
  instructors: [],
  loading: false,
  initialized: false,

  fetchCourses: async (query) => {
    set({ loading: true })
    try {
      const result = await CourseAPI.getCourses(query)
      set({ courses: result.data })
    } catch (err) {
      console.error('[CoursesStore] fetchCourses failed:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchSeries: async () => {
    try {
      const series = await CourseAPI.getSeries()
      set({ series })
    } catch (err) {
      console.error('[CoursesStore] fetchSeries failed:', err)
    }
  },

  fetchInstructors: async () => {
    try {
      const instructors = await CourseAPI.getInstructors()
      set({ instructors })
    } catch (err) {
      console.error('[CoursesStore] fetchInstructors failed:', err)
    }
  },

  initialize: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      const result = await Promise.allSettled([
        CourseAPI.getCourses({ pageSize: 50 }),
        CourseAPI.getSeries().catch(() => [] as SeriesDTO[]),
        CourseAPI.getInstructors().catch(() => [] as InstructorDTO[]),
      ])
      const courses = result[0].status === 'fulfilled' ? result[0].value.data : []
      const series = result[1].status === 'fulfilled' ? result[1].value : []
      const instructors = result[2].status === 'fulfilled' ? result[2].value : []
      set({ courses, series, instructors, initialized: true })
    } catch (err) {
      console.error('[CoursesStore] initialize failed:', err)
      set({ initialized: true })
    } finally {
      set({ loading: false })
    }
  },

  getCourseById: (id) => get().courses.find(c => c.id === id),
  getCoursesBySeries: (seriesId) => get().courses.filter(c => c.seriesId === seriesId),
  getRecommendedSeries: () => get().series.filter(s => s.isRecommended),
  getCourseProgress: () => null,
}))
