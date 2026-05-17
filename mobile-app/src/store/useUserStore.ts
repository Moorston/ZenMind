import { create } from 'zustand'

interface UserState {
  userId: string
  nickname: string
  avatarUrl: string
  isDarkMode: boolean
  isNotificationEnabled: boolean
  soundEffectsEnabled: boolean
  autoPlayEnabled: boolean
  language: 'zh' | 'en'
  streakDays: number
  totalMinutes: number
  completedCourses: number
  checkInDates: string[]
  setNickname: (name: string) => void
  toggleDarkMode: () => void
  toggleNotification: () => void
  toggleSoundEffects: () => void
  toggleAutoPlay: () => void
  setLanguage: (lang: 'zh' | 'en') => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: 'local',
  nickname: '冥想者',
  avatarUrl: '',
  isDarkMode: true,
  isNotificationEnabled: true,
  soundEffectsEnabled: true,
  autoPlayEnabled: true,
  language: 'zh',
  streakDays: 0,
  totalMinutes: 0,
  completedCourses: 0,
  checkInDates: [],
  setNickname: (name) => set({ nickname: name }),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  toggleNotification: () => set((s) => ({ isNotificationEnabled: !s.isNotificationEnabled })),
  toggleSoundEffects: () => set((s) => ({ soundEffectsEnabled: !s.soundEffectsEnabled })),
  toggleAutoPlay: () => set((s) => ({ autoPlayEnabled: !s.autoPlayEnabled })),
  setLanguage: (lang) => set({ language: lang }),
}))
