import { useCoursesStore } from '@/store/courses'
import {
  meditationCourses,
  whiteNoises,
  toMeditationCourse,
  type MeditationCourse,
  type WhiteNoise,
} from '@/store/meditation'
import type { SeriesDTO, InstructorDTO } from '@/api/courses'

/**
 * CourseRepository
 *
 * 策略: 后端优先，本地回落
 * - 后端已初始化且有数据 → 返回后端 API 数据 (映射为 MeditationCourse)
 * - 后端未初始化 → 触发异步初始化，同时返回本地占位数据
 * - 后端初始化但无数据 → 返回本地占位数据
 */
export const CourseRepository = {
  getAll(): MeditationCourse[] {
    const state = useCoursesStore.getState()
    if (state.initialized && state.courses.length > 0) {
      return state.courses.map(toMeditationCourse)
    }
    // Trigger background initialization
    if (!state.initialized && !state.loading) {
      state.initialize()
    }
    return meditationCourses
  },

  getById(id: string): MeditationCourse | undefined {
    const state = useCoursesStore.getState()
    if (state.initialized && state.courses.length > 0) {
      const found = state.courses.find(c => c.id === id)
      if (found) return toMeditationCourse(found)
    }
    return meditationCourses.find(c => c.id === id)
  },

  getBySeries(seriesId: string): MeditationCourse[] {
    const state = useCoursesStore.getState()
    if (state.initialized && state.courses.length > 0) {
      return state.courses
        .filter(c => c.seriesId === seriesId)
        .map(toMeditationCourse)
    }
    return meditationCourses.filter(c => 'seriesId' in c)
  },

  search(query: string, category?: string): MeditationCourse[] {
    const courses = this.getAll()
    return courses.filter(c => {
      const matchCategory = !category || category === 'all' || c.category === category
      const matchSearch = !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      return matchCategory && matchSearch
    })
  },

  /** 白噪音为静态数据，始终从本地获取 */
  getWhiteNoises(): WhiteNoise[] {
    return whiteNoises
  },
}