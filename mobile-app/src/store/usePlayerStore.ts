import { create } from 'zustand'

interface PlayerState {
  isPlaying: boolean
  currentCourseId: string | null
  duration: number
  currentTime: number
  volume: number
  isLooping: boolean
  sleepTimerMinutes: number
  activeWhiteNoise: string | null
  play: (courseId: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleLoop: () => void
  setSleepTimer: (minutes: number) => void
  setWhiteNoise: (id: string | null) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentCourseId: null,
  duration: 0,
  currentTime: 0,
  volume: 1,
  isLooping: false,
  sleepTimerMinutes: 0,
  activeWhiteNoise: null,
  play: (courseId) => set({ currentCourseId: courseId, isPlaying: true, currentTime: 0 }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false, currentCourseId: null, currentTime: 0 }),
  seek: (time) => set({ currentTime: time }),
  setVolume: (vol) => set({ volume: vol }),
  toggleLoop: () => set((s) => ({ isLooping: !s.isLooping })),
  setSleepTimer: (minutes) => set({ sleepTimerMinutes: minutes }),
  setWhiteNoise: (id) => set({ activeWhiteNoise: id }),
}))
