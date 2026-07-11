import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { CheckIn } from './types'

interface UserState {
  userName: string
  streak: number
  totalMinutes: number
  checkIns: CheckIn[]
  completedCourses: number
  completedCourseIds: string[]
  preference: 'sleep' | 'anxiety' | 'focus' | null
  hasCompletedQuiz: boolean
  sleepTimer: number
  isDarkMode: boolean
  userId: string
  nickname: string
  avatarUrl: string
  isNotificationEnabled: boolean
  soundEffectsEnabled: boolean
  autoPlayEnabled: boolean
  language: string

  setUserName: (name: string) => void
  setPreference: (pref: 'sleep' | 'anxiety' | 'focus') => void
  completeQuiz: () => void
  addCheckIn: (courseId: string, duration: number) => void
  setSleepTimer: (minutes: number) => void
  setIsDarkMode: (dark: boolean) => void
  setNickname: (name: string) => void
  toggleNotification: () => void
  toggleSoundEffects: () => void
  toggleAutoPlay: () => void
  setLanguage: (lang: string) => void
  getTodayCheckIn: () => CheckIn | undefined
  getWeeklyStats: () => { day: string; minutes: number }[]
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userName: '冥想者',
      streak: 0,
      totalMinutes: 0,
      checkIns: [],
      completedCourses: 0,
      completedCourseIds: [],
      preference: null,
      hasCompletedQuiz: false,
      sleepTimer: 0,
      isDarkMode: true,
      userId: 'local',
      nickname: '冥想者',
      avatarUrl: '',
      isNotificationEnabled: true,
      soundEffectsEnabled: true,
      autoPlayEnabled: true,
      language: 'zh',

      setUserName: (name) => set({ userName: name }),
      setPreference: (pref) => set({ preference: pref }),
      completeQuiz: () => set({ hasCompletedQuiz: true }),

      addCheckIn: (courseId, duration) => {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        const state = get()
        const existingIndex = state.checkIns.findIndex(c => c.date === today)
        let newCheckIns: CheckIn[]

        if (existingIndex >= 0) {
          newCheckIns = [...state.checkIns]
          newCheckIns[existingIndex] = {
            ...newCheckIns[existingIndex],
            time,
            duration: newCheckIns[existingIndex].duration + duration,
          }
        } else {
          newCheckIns = [...state.checkIns, { date: today, time, duration, courseId }]
        }

        let streak = 1
        const checkDates = [...new Set(newCheckIns.map(c => c.date))]
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        for (let i = 1; i < checkDates.length; i++) {
          const current = new Date(checkDates[i - 1])
          const prev = new Date(checkDates[i])
          const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
          if (diff === 1) {
            streak++
          } else {
            break
          }
        }

        const alreadyCompleted = state.completedCourseIds.includes(courseId)
        set({
          checkIns: newCheckIns,
          totalMinutes: state.totalMinutes + duration,
          streak,
          completedCourses: alreadyCompleted ? state.completedCourses : state.completedCourses + 1,
          completedCourseIds: alreadyCompleted ? state.completedCourseIds : [...state.completedCourseIds, courseId],
        })
      },

      setSleepTimer: (minutes) => set({ sleepTimer: minutes }),
      setIsDarkMode: (dark) => set({ isDarkMode: dark }),
      setNickname: (name) => set({ nickname: name, userName: name }),
      toggleNotification: () => set((s) => ({ isNotificationEnabled: !s.isNotificationEnabled })),
      toggleSoundEffects: () => set((s) => ({ soundEffectsEnabled: !s.soundEffectsEnabled })),
      toggleAutoPlay: () => set((s) => ({ autoPlayEnabled: !s.autoPlayEnabled })),
      setLanguage: (lang) => set({ language: lang }),

      getTodayCheckIn: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().checkIns.find(c => c.date === today)
      },

      getWeeklyStats: () => {
        const result: { day: string; minutes: number }[] = []
        const days = ['日', '一', '二', '三', '四', '五', '六']
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const checkIn = get().checkIns.find(c => c.date === dateStr)
          result.push({
            day: days[date.getDay()],
            minutes: checkIn?.duration || 0,
          })
        }
        return result
      },
    }),
    {
      name: 'zenmind-user',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name)
        },
      },
    }
  )
)
