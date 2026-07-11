import type { MeditationCourse, WhiteNoise } from './types'

export const whiteNoises: WhiteNoise[] = [
  {
    id: 'rain',
    name: '雨声',
    icon: '🌧',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/01/20/audio_d1718ab41b.mp3',
    color: '#3b82f6',
  },
  {
    id: 'waves',
    name: '海浪',
    icon: '🌊',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/11/22/audio_42a045aa18.mp3',
    color: '#06b6d4',
  },
  {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    audioUrl: 'https://cdn.pixabay.com/audio/2023/01/17/audio_2eb7d34e14.mp3',
    color: '#22c55e',
  },
  {
    id: 'fire',
    name: '篝火',
    icon: '🔥',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3',
    color: '#f97316',
  },
]

export function getNoiseEmoji(id: string): string {
  const emojis: Record<string, string> = {
    rain: '🌧',
    waves: '🌊',
    forest: '🌲',
    fire: '🔥',
  }
  return emojis[id] || '🎵'
}

export function getNoiseColor(id: string): string {
  const colors: Record<string, string> = {
    rain: '#3b82f6',
    waves: '#06b6d4',
    forest: '#22c55e',
    fire: '#f97316',
  }
  return colors[id] || '#7c6aef'
}
