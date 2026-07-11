import { useCoursesStore } from '@/store/courses'

export const InstructorRepository = {
  getAll() {
    const state = useCoursesStore.getState()
    if (state.initialized && state.instructors.length > 0) {
      return state.instructors
    }
    if (!state.initialized && !state.loading) {
      state.initialize()
    }
    return []
  },

  getById(id: string) {
    const state = useCoursesStore.getState()
    if (state.initialized && state.instructors.length > 0) {
      return state.instructors.find(i => i.id === id) || null
    }
    return null
  },
}