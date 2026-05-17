import { create } from 'zustand'
import { CoursesAPI } from '@/api/courses'

interface CoursesState {
  courses: CoursesAPI.Course[]
  series: CoursesAPI.Series[]
  instructors: CoursesAPI.Instructor[]
  loading: boolean
  error: string | null
  fetchCourses: () => Promise<void>
  fetchSeries: () => Promise<void>
  fetchInstructors: () => Promise<void>
}

export const useCoursesStore = create<CoursesState>((set) => ({
  courses: [],
  series: [],
  instructors: [],
  loading: false,
  error: null,
  fetchCourses: async () => {
    set({ loading: true, error: null })
    try {
      const res = await CoursesAPI.getCourses()
      set({ courses: res.data || [], loading: false })
    } catch (e) {
      set({ error: '获取课程失败', loading: false })
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
}))
