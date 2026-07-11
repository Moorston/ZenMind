import { create } from 'zustand'
import { CoursesAPI } from '@/api/courses'

interface CoursesState {
  courses: CoursesAPI.Course[]
  series: CoursesAPI.Series[]
  instructors: CoursesAPI.Instructor[]
  loading: boolean
  error: string | null
  initialized: boolean
  fetchCourses: () => Promise<void>
  fetchSeries: () => Promise<void>
  fetchInstructors: () => Promise<void>
  initialize: () => Promise<void>
  getCourseById: (id: string) => CoursesAPI.Course | undefined
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  series: [],
  instructors: [],
  loading: false,
  error: null,
  initialized: false,

  fetchCourses: async () => {
    set({ loading: true, error: null })
    try {
      const res = await CoursesAPI.getCourses()
      set({ courses: res.data || [], loading: false, initialized: true })
    } catch (e: any) {
      set({ error: e.message || '获取课程失败', loading: false })
    }
  },

  fetchSeries: async () => {
    try {
      const res = await CoursesAPI.getSeries()
      set({ series: res.data || [] })
    } catch {}
  },

  fetchInstructors: async () => {
    try {
      const res = await CoursesAPI.getInstructors()
      set({ instructors: res.data || [] })
    } catch {}
  },

  initialize: async () => {
    const state = get()
    if (state.initialized) return
    set({ loading: true, error: null })
    try {
      const [coursesRes, seriesRes, instructorsRes] = await Promise.all([
        CoursesAPI.getCourses(),
        CoursesAPI.getSeries(),
        CoursesAPI.getInstructors(),
      ])
      set({
        courses: coursesRes.data || [],
        series: seriesRes.data || [],
        instructors: instructorsRes.data || [],
        loading: false,
        initialized: true,
      })
    } catch (e: any) {
      set({ error: e.message || '初始化数据失败', loading: false })
    }
  },

  getCourseById: (id: string) => {
    return get().courses.find(c => c.id === id)
  },
}))
