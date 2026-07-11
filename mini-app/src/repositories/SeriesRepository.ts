import { useCoursesStore } from '@/store/courses'

export const SeriesRepository = {
  getAll() {
    const state = useCoursesStore.getState()
    if (state.initialized && state.series.length > 0) {
      return state.series
    }
    if (!state.initialized && !state.loading) {
      state.initialize()
    }
    return []
  },

  getRecommended() {
    const state = useCoursesStore.getState()
    if (state.initialized && state.series.length > 0) {
      return state.series.filter(s => s.isRecommended)
    }
    if (!state.initialized && !state.loading) {
      state.initialize()
    }
    return []
  },

  getById(id: string) {
    const state = useCoursesStore.getState()
    if (state.initialized && state.series.length > 0) {
      return state.series.find(s => s.id === id) || null
    }
    return null
  },
}