import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from '@tarojs/components'
import { SafeImage } from '@/components/ui/safe-image'
import Taro from '@tarojs/taro'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Clock,
  X
} from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  meditationCourses,
  whiteNoises,
  usePlayerStore,
  useUserStore,
  getNoiseEmoji,
  getNoiseColor,
  type MeditationCourse,
  type WhiteNoise
} from '@/store/meditation'
import { CourseAPI } from '@/api/courses'

export default function Player() {
  const {
    currentCourse, isPlaying, currentTime, duration,
    volume, isLooping, whiteNoise, whiteNoiseVolume,
    setCurrentCourse, setIsPlaying, setCurrentTime,
    setDuration, setVolume, setIsLooping, setWhiteNoise, reset
  } = usePlayerStore()

  const { addCheckIn, setSleepTimer, sleepTimer } = useUserStore()
  const { t } = useTranslation()

  const audioRef = useRef<Taro.InnerAudioContext | null>(null)
  const whiteNoiseRef = useRef<Taro.InnerAudioContext | null>(null)
  const hasCheckedInRef = useRef(false)
  const isLoopingRef = useRef(isLooping)
  const currentCourseRef = useRef(currentCourse)
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  isLoopingRef.current = isLooping
  currentCourseRef.current = currentCourse

  const [showTimer, setShowTimer] = useState(false)
  const [timerValue, setTimerValue] = useState(15)

  useEffect(() => {
    const audio = Taro.createInnerAudioContext()
    const noise = Taro.createInnerAudioContext()
    audioRef.current = audio
    whiteNoiseRef.current = noise

    const params = Taro.getCurrentInstance()?.router?.params || {}

    if (params.courseId) {
      const course = meditationCourses.find(c => c.id === params.courseId)
      if (course) {
        setCurrentCourse(course)
        currentCourseRef.current = course
        playCourse(course, audio, noise, volume)
      }
    } else if (params.noiseId) {
      const noiseItem = whiteNoises.find(n => n.id === params.noiseId)
      if (noiseItem) {
        setWhiteNoise(noiseItem)
        playWhiteNoise(noiseItem, noise, whiteNoiseVolume)
      }
    }

    audio.onTimeUpdate(() => {
      setCurrentTime(audio.currentTime)
    })

    audio.onEnded(() => {
      const course = currentCourseRef.current
      if (!isLoopingRef.current && course && !hasCheckedInRef.current) {
        addCheckIn(course.id, Math.floor(currentTimeRef.current))
        hasCheckedInRef.current = true
        setIsPlaying(false)
        CourseAPI.completeCourse('local', course.id).catch(() => {})
      }
    })

    return () => {
      const course = currentCourseRef.current
      if (course && audio.currentTime > 0) {
        CourseAPI.updateProgress('local', course.id, {
          position: Math.floor(audio.currentTime),
        }).catch(() => {})
      }
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current)
        sleepTimerRef.current = null
      }
      audio.stop()
      audio.destroy()
      noise.stop()
      noise.destroy()
    }
  }, [])

  const currentTimeRef = useRef(currentTime)
  currentTimeRef.current = currentTime
  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const whiteNoiseVolumeRef = useRef(whiteNoiseVolume)
  whiteNoiseVolumeRef.current = whiteNoiseVolume
  const whiteNoiseRefVal = useRef(whiteNoise)
  whiteNoiseRefVal.current = whiteNoise

  const getAudio = () => {
    if (!audioRef.current) {
      audioRef.current = Taro.createInnerAudioContext()
    }
    return audioRef.current
  }

  const getNoise = () => {
    if (!whiteNoiseRef.current) {
      whiteNoiseRef.current = Taro.createInnerAudioContext()
    }
    return whiteNoiseRef.current
  }

  const playCourse = useCallback((course: MeditationCourse, audio?: Taro.InnerAudioContext, noise?: Taro.InnerAudioContext, vol?: number) => {
    const a = audio || getAudio()
    a.src = course.audioUrl
    a.volume = vol ?? volumeRef.current
    a.loop = isLoopingRef.current
    a.play()
    setIsPlaying(true)
    setDuration(course.duration * 60)

    if (whiteNoiseRefVal.current) {
      setWhiteNoise(null)
      const n = noise || getNoise()
      n.stop()
    }
  }, [])

  const playWhiteNoise = useCallback((noiseItem: WhiteNoise, noise?: Taro.InnerAudioContext, vol?: number) => {
    const n = noise || getNoise()
    n.src = noiseItem.audioUrl
    n.volume = vol ?? whiteNoiseVolumeRef.current
    n.loop = true
    n.play()
  }, [])

  const togglePlay = () => {
    const audio = getAudio()
    const noise = getNoise()
    if (isPlaying) {
      audio.pause()
      noise.pause()
    } else {
      audio.play()
      if (whiteNoise) noise.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number) => {
    getAudio().seek(value)
    setCurrentTime(value)
  }

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    getAudio().seek(newTime)
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    getAudio().volume = value
  }

  const startSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }
    const ms = timerValue * 60 * 1000
    sleepTimerRef.current = setTimeout(() => {
      getAudio().stop()
      getNoise().stop()
      setIsPlaying(false)
      Taro.showToast({ title: t('player.sleepTimer.toastTitle'), icon: 'none' })
    }, ms)
    setSleepTimer(timerValue)
    setShowTimer(false)
    Taro.showToast({ title: t('player.sleepTimer.scheduled', { value: timerValue }), icon: 'none' })
  }

  const handleToggleLoop = () => {
    const next = !isLooping
    setIsLooping(next)
    isLoopingRef.current = next
    getAudio().loop = next
  }

  const handleClose = () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
      sleepTimerRef.current = null
    }
    getAudio().stop()
    getNoise().stop()
    reset()
    Taro.navigateBack()
  }

  const courseDescription = currentCourse?.description || (whiteNoise ? t('player.subtitle.whiteNoise', { name: whiteNoise.name }) : t('player.subtitle.selectMusic'))

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-muted-foreground"
        >
          <X size={24} color="#9090a0" />
        </Button>
        <Text className="block text-muted-foreground text-sm">
          {whiteNoise ? t('player.header.whiteNoise') : t('player.header.meditationCourse')}
        </Text>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowTimer(!showTimer)}
          className="text-muted-foreground"
        >
          <Clock size={24} color="#9090a0" />
        </Button>
      </View>

      {showTimer && (
        <View className="mx-4 mb-4 bg-card rounded-2xl p-4">
          <Text className="block text-foreground text-sm mb-3">{t('player.sleepTimer.title')}</Text>
          <View className="flex items-center gap-4">
            <Slider
              className="flex-1"
              min={5}
              max={60}
              step={5}
              value={[timerValue]}
              onValueChange={(value) => setTimerValue(value[0])}
            />
            <Text className="block text-primary w-12 text-center">{t('player.sleepTimer.minutes', { value: timerValue })}</Text>
          </View>
          <View className="flex gap-2 mt-3">
            {[15, 30, 45, 60].map(m => (
              <View
                key={m}
                onClick={() => setTimerValue(m)}
                className={`px-3 py-2 rounded-full text-xs ${
                  timerValue === m
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Text className="block">{t('player.sleepTimer.minuteOption', { m })}</Text>
              </View>
            ))}
          </View>
          <Button
            className="w-full mt-3 bg-primary text-white"
            onClick={startSleepTimer}
          >
            <Text className="block">{t('player.sleepTimer.confirm')}</Text>
          </Button>
        </View>
      )}

      <View className="flex-1 flex flex-col items-center justify-center px-8">
        {currentCourse ? (
          <View className="relative mb-8">
            <View className="w-64 h-64 rounded-full overflow-hidden shadow-lg shadow-primary">
              <SafeImage
                src={currentCourse.coverUrl}
                className="w-full h-full"
                mode="aspectFill"
              />
            </View>
            <View className="absolute inset-0 rounded-full border-2 border-primary-50 animate-pulse -m-2" />
          </View>
        ) : whiteNoise ? (
          <View className="relative mb-8">
            <View
              className="w-64 h-64 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${getNoiseColor(whiteNoise.id)}30` }}
            >
              <Text className="block text-8xl">{getNoiseEmoji(whiteNoise.id)}</Text>
            </View>
            <View className="absolute inset-0 rounded-full border-2 border-secondary-30 animate-pulse -m-2" />
          </View>
        ) : (
          <View className="mb-8">
            <Text className="block text-6xl">🎵</Text>
          </View>
        )}

        <Text className="block text-2xl font-semibold text-foreground text-center mb-2">
          {currentCourse?.title || whiteNoise?.name || t('player.title.selectMusic')}
        </Text>
        <Text className="block text-sm text-muted-foreground text-center">
          {courseDescription}
        </Text>

        {currentCourse && (
          <View className="w-full mt-8">
            <Slider
              className="w-full"
              min={0}
              max={duration}
              value={[currentTime]}
              onValueChange={(value) => handleSeek(value[0])}
            />
            <View className="flex justify-between mt-2">
              <Text className="block text-xs text-muted-foreground">{formatTime(currentTime)}</Text>
              <Text className="block text-xs text-muted-foreground">{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>

      <View className="px-8 pb-12">
        <View className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            {volume === 0 ? <VolumeX size={20} color="#9090a0" /> : <Volume2 size={20} color="#9090a0" />}
          </Button>
          <Slider
            className="flex-1"
            min={0}
            max={100}
            step={1}
            value={[volume * 100]}
            onValueChange={(value) => handleVolumeChange(value[0] / 100)}
          />
        </View>

        <View className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(-15)}
            className="text-muted-foreground"
          >
            <SkipBack size={28} color="#9090a0" />
          </Button>

          <View
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-primary-40 flex items-center justify-center shadow-lg shadow-primary"
          >
            {isPlaying ? (
              <Pause size={36} color="#fff" />
            ) : (
              <Play size={36} color="#fff" className="ml-1" />
            )}
          </View>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(15)}
            className="text-muted-foreground"
          >
            <SkipForward size={28} color="#9090a0" />
          </Button>
        </View>

        <View className="flex items-center justify-center mt-6 gap-4">
          <Button
            variant="ghost"
            onClick={handleToggleLoop}
            className={`${isLooping ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Repeat size={20} color={isLooping ? '#7c6aef' : '#9090a0'} />
            <Text className="block text-xs ml-1">{t('player.loop')}</Text>
          </Button>

          {sleepTimer > 0 && (
            <View className="flex items-center text-primary text-xs">
              <Clock size={14} color="#7c6aef" />
              <Text className="block ml-1">{t('player.sleepTimer.active', { sleepTimer })}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
