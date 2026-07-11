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

export interface CheckIn {
  date: string
  time: string
  duration: number
  courseId: string
}
