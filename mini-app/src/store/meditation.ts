import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n'
import type { CourseDTO, SeriesDTO, InstructorDTO } from '@/api/courses'
import { CATEGORY_MAP } from './constants'
import { useCoursesStore, getDisplayCategory, getLevelLabel } from './courses'

export { useCoursesStore, getDisplayCategory, getLevelLabel }
export type { CourseDTO, SeriesDTO, InstructorDTO }

export interface MeditationCourse {
  id: string
  title: string
  description: string
  category: 'beginner' | 'sleep' | 'relax' | 'focus'
  duration: number
  coverUrl: string
  audioUrl: string
  tags: string[]
  instructor: string
}

export interface WhiteNoise {
  id: string
  name: string
  icon: string
  audioUrl: string
  color: string
}

/**
 * WARNING: 以下为前端占位数据，使用 Unsplash / SoundHelix 仅用于开发调试。
 *
 * 生产环境流程：
 *   1. 上传真实文件: npx ts-node server/src/seed-media.ts ./media
 *      (脚本自动上传到 TOS 并更新数据库 URL)
 *   2. 确保后端 API 返回正确的 audioUrl / coverUrl
 *   3. 前端通过 getCourses() → toMeditationCourse() 读取 TOS URL
 *
 * 何时删除占位数据：
 *   - 所有课程的 audioUrl 和 coverUrl 在数据库中已有 TOS URL 后
 *   - 删除此数组或留空数组，getCourses() / getCourseById() 会自动 fallback
 */
export const meditationCourses: MeditationCourse[] = [
  {
    id: 'breathing-basics',
    title: '呼吸基础练习',
    description: '学习腹式呼吸，让身心放松',
    category: 'beginner',
    duration: 5,
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tags: ['呼吸', '入门'],
    instructor: '静心'
  },
  {
    id: 'body-scan',
    title: '身体扫描冥想',
    description: '从头到脚扫描身体，释放紧张',
    category: 'beginner',
    duration: 10,
    coverUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    tags: ['身体扫描', '放松'],
    instructor: '静心'
  },
  {
    id: 'sleep-journey',
    title: '深度睡眠引导',
    description: '帮助您快速进入深度睡眠',
    category: 'sleep',
    duration: 20,
    coverUrl: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    tags: ['睡眠', '晚安'],
    instructor: '梦溪'
  },
  {
    id: 'sleep-breathing',
    title: '睡前呼吸练习',
    description: '4-7-8 呼吸法，帮助入眠',
    category: 'sleep',
    duration: 5,
    coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    tags: ['呼吸', '睡眠'],
    instructor: '梦溪'
  },
  {
    id: 'anxiety-relief',
    title: '焦虑缓解冥想',
    description: '释放焦虑，找回内心平静',
    category: 'relax',
    duration: 10,
    coverUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27abb37f?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    tags: ['焦虑', '减压'],
    instructor: '清风'
  },
  {
    id: 'stress-release',
    title: '压力释放练习',
    description: '缓解工作和生活中的压力',
    category: 'relax',
    duration: 15,
    coverUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    tags: ['压力', '放松'],
    instructor: '清风'
  },
  {
    id: 'morning-focus',
    title: '清晨专注力',
    description: '开启一天的正确方式',
    category: 'focus',
    duration: 5,
    coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    tags: ['专注', '清晨'],
    instructor: '明月'
  },
  {
    id: 'deep-focus',
    title: '深度专注训练',
    description: '提升注意力和工作效率',
    category: 'focus',
    duration: 20,
    coverUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    tags: ['专注', '深度'],
    instructor: '明月'
  }
]

export const whiteNoises: WhiteNoise[] = [
  {
    id: 'rain',
    name: '雨声',
    icon: 'CloudRain',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    color: '#3b82f6'
  },
  {
    id: 'waves',
    name: '海浪',
    icon: 'Waves',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    color: '#06b6d4'
  },
  {
    id: 'forest',
    name: '森林',
    icon: 'TreePine',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    color: '#22c55e'
  },
  {
    id: 'fire',
    name: '篝火',
    icon: 'Flame',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    color: '#f97316'
  }
]

export interface CheckIn {
  date: string
  time: string
  duration: number
  courseId: string
}

interface UserState {
  userName: string
  streak: number
  totalMinutes: number
  checkIns: CheckIn[]
  completedCourses: string[]
  preference: 'sleep' | 'anxiety' | 'focus' | null
  hasCompletedQuiz: boolean
  sleepTimer: number
  isDarkMode: boolean

  setIsDarkMode: (dark: boolean) => void
  setUserName: (name: string) => void
  setPreference: (pref: 'sleep' | 'anxiety' | 'focus') => void
  completeQuiz: () => void
  addCheckIn: (courseId: string, duration: number) => void
  setSleepTimer: (minutes: number) => void
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
      completedCourses: [],
      preference: null,
      hasCompletedQuiz: false,
      sleepTimer: 0,
      isDarkMode: true,

      setIsDarkMode: (dark) => set({ isDarkMode: dark }),
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
            duration: newCheckIns[existingIndex].duration + duration
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

        set({
          checkIns: newCheckIns,
          totalMinutes: state.totalMinutes + duration,
          streak,
          completedCourses: state.completedCourses.includes(courseId)
            ? state.completedCourses
            : [...state.completedCourses, courseId]
        })
      },

      setSleepTimer: (minutes) => set({ sleepTimer: minutes }),

      getTodayCheckIn: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().checkIns.find(c => c.date === today)
      },

      getWeeklyStats: () => {
        const result: { day: string; minutes: number }[] = []
        const days = i18n.t('common.weekdays', { returnObjects: true }) as string[] || ['日', '一', '二', '三', '四', '五', '六']

        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const checkIn = get().checkIns.find(c => c.date === dateStr)

          result.push({
            day: days[date.getDay()],
            minutes: checkIn?.duration || 0
          })
        }

        return result
      }
    }),
    {
      name: 'meditation-user'
    }
  )
)

interface PlayerState {
  currentCourse: MeditationCourse | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLooping: boolean
  whiteNoise: WhiteNoise | null
  whiteNoiseVolume: number

  setCurrentCourse: (course: MeditationCourse | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setIsLooping: (looping: boolean) => void
  setWhiteNoise: (noise: WhiteNoise | null) => void
  setWhiteNoiseVolume: (volume: number) => void
  reset: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentCourse: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isLooping: false,
  whiteNoise: null,
  whiteNoiseVolume: 0.3,

  setCurrentCourse: (course) => set({ currentCourse: course, currentTime: 0, duration: 0 }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setVolume: (volume) => set({ volume: volume }),
  setIsLooping: (looping) => set({ isLooping: looping }),
  setWhiteNoise: (noise) => set({ whiteNoise: noise }),
  setWhiteNoiseVolume: (volume) => set({ whiteNoiseVolume: volume }),
  reset: () => set({
    currentCourse: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    whiteNoise: null,
  })
}))

export function getNoiseEmoji(id: string): string {
  const emojis: Record<string, string> = {
    rain: '🌧',
    waves: '🌊',
    forest: '🌲',
    fire: '🔥'
  }
  return emojis[id] || '🎵'
}

export function getNoiseColor(id: string): string {
  const colors: Record<string, string> = {
    rain: '#3b82f6',
    waves: '#06b6d4',
    forest: '#22c55e',
    fire: '#f97316'
  }
  return colors[id] || '#7c6aef'
}

const FALLBACK_COVER = meditationCourses[0]?.coverUrl || ''

export function toMeditationCourse(c: CourseDTO): MeditationCourse {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: (CATEGORY_MAP[c.category] || c.category) as MeditationCourse['category'],
    duration: c.duration,
    coverUrl: c.coverUrl || FALLBACK_COVER,
    audioUrl: c.audioUrl || '',
    tags: c.tags,
    instructor: c.instructor?.name || '静心',
  }
}

export function getCourses(): MeditationCourse[] {
  const state = useCoursesStore.getState()
  if (state.initialized && state.courses.length > 0) {
    return state.courses.map(toMeditationCourse)
  }
  return meditationCourses
}

export function getCourseById(id: string): MeditationCourse | undefined {
  const state = useCoursesStore.getState()
  if (state.initialized && state.courses.length > 0) {
    const found = state.courses.find(c => c.id === id)
    if (found) return toMeditationCourse(found)
  }
  return meditationCourses.find(c => c.id === id)
}

export function getBestTime(checkIns: CheckIn[]): { type: string; label: string } | null {
  if (checkIns.length === 0) return null

  let morning = 0
  let afternoon = 0
  let evening = 0
  let night = 0

  for (const c of checkIns) {
    const hour = parseInt(c.time?.split(':')[0] || '12', 10)
    if (hour >= 5 && hour < 12) morning++
    else if (hour >= 12 && hour < 17) afternoon++
    else if (hour >= 17 && hour < 21) evening++
    else night++
  }

  const timeLabels: Record<string, string> = {
    morning: '清晨',
    afternoon: '午后',
    evening: '傍晚',
    night: '夜间',
  }

  const max = Math.max(morning, afternoon, evening, night)
  if (max === 0) {
    const label = timeLabels.morning
    try { return { type: 'morning', label: i18n.t('common.timeOfDay.morning', label) } } catch { return { type: 'morning', label } }
  }

  let bestType = 'morning'
  if (afternoon === max) bestType = 'afternoon'
  else if (evening === max) bestType = 'evening'
  else if (night === max) bestType = 'night'

  const label = timeLabels[bestType]
  try { return { type: bestType, label: i18n.t(`common.timeOfDay.${bestType}`, label) } } catch { return { type: bestType, label } }
}
