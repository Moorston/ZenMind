import { create } from 'zustand'
import { Audio } from 'expo-av'
import { useUserStore } from './useUserStore'
import { useAuthStore } from './useAuthStore'
import { CoursesAPI } from '@/api/courses'
import type { MeditationCourse, WhiteNoise } from './types'

let soundInstance: Audio.Sound | null = null
let noiseInstance: Audio.Sound | null = null
let progressInterval: ReturnType<typeof setInterval> | null = null
let sleepTimerId: ReturnType<typeof setTimeout> | null = null

function startProgressTracking() {
  if (progressInterval) clearInterval(progressInterval)
  progressInterval = setInterval(() => {
    const state = usePlayerStore.getState()
    if (state.isPlaying && state.duration > 0) {
      // currentTime is updated via onPlaybackStatusUpdate
    }
  }, 1000)
}

function stopProgressTracking() {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

async function saveProgress(courseId: string) {
  const { currentTime } = usePlayerStore.getState()
  const userId = useAuthStore.getState().userId
  if (!userId || !courseId) return
  try {
    await CoursesAPI.updateProgress(userId, courseId, {
      position: Math.floor(currentTime),
      completed: false,
    })
  } catch {}
}

async function markCompleted(courseId: string) {
  const userId = useAuthStore.getState().userId
  if (!userId) return
  try {
    await CoursesAPI.markCompleted(userId, courseId)
    const { addCheckIn } = useUserStore.getState()
    const duration = Math.floor(usePlayerStore.getState().duration / 60) || 1
    addCheckIn(courseId, duration)
  } catch {}
}

interface PlayerState {
  currentCourse: MeditationCourse | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLooping: boolean
  sleepTimerMinutes: number
  sleepTimerEnd: number | null
  whiteNoise: WhiteNoise | null
  whiteNoiseVolume: number
  isLoading: boolean
  hasError: boolean

  playCourse: (course: MeditationCourse) => Promise<void>
  playWhiteNoise: (noise: WhiteNoise) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  seek: (seconds: number) => Promise<void>
  setVolume: (vol: number) => Promise<void>
  toggleLoop: () => void
  setSleepTimer: (minutes: number) => void
  setWhiteNoiseVolume: (vol: number) => void
  stopWhiteNoise: () => void
  reset: () => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentCourse: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isLooping: false,
  sleepTimerMinutes: 0,
  sleepTimerEnd: null,
  whiteNoise: null,
  whiteNoiseVolume: 0.3,
  isLoading: false,
  hasError: false,

  playCourse: async (course) => {
    const state = get()
    if (soundInstance) {
      await soundInstance.unloadAsync()
      soundInstance = null
    }
    set({ isLoading: true, hasError: false })
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: course.audioUrl },
        { shouldPlay: true, isLooping: state.isLooping },
        (playbackStatus) => {
          if (playbackStatus.isLoaded) {
            const s = get()
            set({
              currentTime: (playbackStatus as any).positionMillis / 1000,
              duration: (playbackStatus as any).durationMillis
                ? (playbackStatus as any).durationMillis / 1000
                : s.duration,
              isPlaying: (playbackStatus as any).isPlaying,
            })
            if ((playbackStatus as any).didJustFinish && !s.isLooping) {
              set({ isPlaying: false, currentTime: 0 })
              if (course) {
                markCompleted(course.id)
                // 上报播放行为（用于协同过滤推荐）
                const duration = (playbackStatus as any).durationMillis
                  ? Math.floor((playbackStatus as any).durationMillis / 1000)
                  : Math.floor(s.currentTime)
                CoursesAPI.recordPlay(course.id, duration).catch(() => {})
              }
            }
          }
        }
      )
      soundInstance = sound
      sound.setVolumeAsync(state.volume)
      set({
        currentCourse: course,
        isPlaying: true,
        currentTime: 0,
        isLoading: false,
        duration: (status as any).durationMillis
          ? (status as any).durationMillis / 1000
          : course.duration,
      })
      startProgressTracking()
    } catch (e) {
      console.warn('Failed to play course:', e)
      set({ isLoading: false, hasError: true })
    }
  },

  playWhiteNoise: async (noise) => {
    if (noiseInstance) {
      await noiseInstance.unloadAsync()
      noiseInstance = null
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: noise.audioUrl },
        { shouldPlay: true, isLooping: true },
        (playbackStatus) => {}
      )
      noiseInstance = sound
      const state = get()
      noiseInstance.setVolumeAsync(state.whiteNoiseVolume)
      set({ whiteNoise: noise })
    } catch (e) {
      console.warn('Failed to play white noise:', e)
    }
  },

  pause: async () => {
    if (soundInstance) {
      await soundInstance.pauseAsync()
      set({ isPlaying: false })
      stopProgressTracking()
      const { currentCourse } = get()
      if (currentCourse) await saveProgress(currentCourse.id)
    }
  },

  resume: async () => {
    if (soundInstance) {
      await soundInstance.playAsync()
      set({ isPlaying: true })
      startProgressTracking()
    }
  },

  togglePlay: async () => {
    const { isPlaying } = get()
    if (isPlaying) {
      await get().pause()
    } else {
      await get().resume()
    }
  },

  seek: async (seconds) => {
    if (soundInstance) {
      await soundInstance.setPositionAsync(seconds * 1000)
      set({ currentTime: seconds })
    }
  },

  setVolume: async (vol) => {
    if (soundInstance) {
      await soundInstance.setVolumeAsync(vol)
    }
    set({ volume: vol })
  },

  toggleLoop: () => {
    const next = !get().isLooping
    if (soundInstance) {
      soundInstance.setIsLoopingAsync(next)
    }
    set({ isLooping: next })
  },

  setSleepTimer: (minutes) => {
    if (sleepTimerId) {
      clearTimeout(sleepTimerId)
      sleepTimerId = null
    }
    if (minutes > 0) {
      set({ sleepTimerMinutes: minutes, sleepTimerEnd: Date.now() + minutes * 60 * 1000 })
      const checkTimer = () => {
        const { sleepTimerEnd: end, isPlaying } = get()
        if (end && Date.now() >= end) {
          get().pause()
          set({ sleepTimerMinutes: 0, sleepTimerEnd: null })
          sleepTimerId = null
          return
        }
        if (isPlaying) {
          sleepTimerId = setTimeout(checkTimer, 1000)
        } else {
          sleepTimerId = null
        }
      }
      sleepTimerId = setTimeout(checkTimer, 1000)
    } else {
      set({ sleepTimerMinutes: 0, sleepTimerEnd: null })
    }
  },

  setWhiteNoiseVolume: async (vol) => {
    if (noiseInstance) {
      await noiseInstance.setVolumeAsync(vol)
    }
    set({ whiteNoiseVolume: vol })
  },

  stopWhiteNoise: async () => {
    if (noiseInstance) {
      await noiseInstance.unloadAsync()
      noiseInstance = null
    }
    set({ whiteNoise: null })
  },

  reset: async () => {
    stopProgressTracking()
    if (sleepTimerId) {
      clearTimeout(sleepTimerId)
      sleepTimerId = null
    }
    if (soundInstance) {
      await soundInstance.unloadAsync()
      soundInstance = null
    }
    if (noiseInstance) {
      await noiseInstance.unloadAsync()
      noiseInstance = null
    }
    const { currentCourse } = get()
    if (currentCourse) await saveProgress(currentCourse.id)
    set({
      currentCourse: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      whiteNoise: null,
      sleepTimerMinutes: 0,
      sleepTimerEnd: null,
      isLoading: false,
      hasError: false,
    })
  },
}))
