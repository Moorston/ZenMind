import { useEffect, useRef, useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { usePlayerStore, useUserStore, meditationCourses, whiteNoises, type WhiteNoise } from '@/store/meditation'
import { useAuthStore } from '@/store/auth'
import { CourseAPI } from '@/api/courses'

export function useAudioPlayer() {
  const {
    currentCourse, isPlaying, currentTime, duration,
    volume, isLooping, whiteNoise, whiteNoiseVolume,
    setCurrentCourse, setIsPlaying, setCurrentTime,
    setDuration, setVolume, setIsLooping, setWhiteNoise, setWhiteNoiseVolume,
  } = usePlayerStore()

  const { addCheckIn, setSleepTimer: setSleepTimerStore, sleepTimer } = useUserStore()
  const authToken = useAuthStore((s) => s.token)
  const authUser = useAuthStore((s) => s.user)

  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [courseNotFound, setCourseNotFound] = useState(false)

  const audioRef = useRef<Taro.InnerAudioContext | null>(null)
  const whiteNoiseRef = useRef<Taro.InnerAudioContext | null>(null)
  const hasCheckedInRef = useRef(false)
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep refs in sync for callbacks
  const isLoopingRef = useRef(isLooping)
  const currentCourseRef = useRef(currentCourse)
  const currentTimeRef = useRef(currentTime)
  const finalVolumeRef = useRef(volume)
  const finalWhiteNoiseVolumeRef = useRef(whiteNoiseVolume)
  const finalWhiteNoiseRef = useRef(whiteNoise)
  isLoopingRef.current = isLooping
  currentCourseRef.current = currentCourse
  currentTimeRef.current = currentTime
  finalVolumeRef.current = volume
  finalWhiteNoiseVolumeRef.current = whiteNoiseVolume
  finalWhiteNoiseRef.current = whiteNoise

  /** 获取真实的 userId，无登录时返回 null */
  const getUserId = useCallback((): string | null => {
    return authUser?.id || null
  }, [authUser])

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = Taro.createInnerAudioContext()

      audioRef.current.onTimeUpdate(() => {
        const audio = audioRef.current
        if (audio) setCurrentTime(audio.currentTime)
      })

      audioRef.current.onCanplay(() => {
        setIsLoading(false)
        const audio = audioRef.current
        if (audio && audio.duration && audio.duration > 0) {
          setDuration(audio.duration)
        }
      })

      audioRef.current.onWaiting(() => {
        setIsLoading(true)
      })

      audioRef.current.onError(() => {
        setIsLoading(false)
        setHasError(true)
      })

      audioRef.current.onEnded(() => {
        const course = currentCourseRef.current
        if (!isLoopingRef.current && course && !hasCheckedInRef.current) {
          addCheckIn(course.id, Math.floor(currentTimeRef.current))
          hasCheckedInRef.current = true
          setIsPlaying(false)
          const uid = getUserId()
          if (uid) {
            CourseAPI.completeCourse(uid, course.id).catch(() => {})
          }
          // 上报播放行为（用于协同过滤推荐）
          CourseAPI.recordPlay(course.id, Math.floor(currentTimeRef.current)).catch(() => {})
        }
      })
    }
    return audioRef.current
  }, [addCheckIn, getUserId, setIsLoading, setHasError, setIsPlaying, setCurrentTime, setDuration])

  const getNoise = useCallback(() => {
    if (!whiteNoiseRef.current) {
      whiteNoiseRef.current = Taro.createInnerAudioContext()
      whiteNoiseRef.current.loop = true
    }
    return whiteNoiseRef.current
  }, [])

  const playCourse = useCallback((course: typeof currentCourse, startTime = 0) => {
    if (!course) return
    setIsLoading(true)
    setHasError(false)
    hasCheckedInRef.current = false

    const audio = getAudio()
    audio.src = course.audioUrl
    audio.loop = isLoopingRef.current
    audio.volume = finalVolumeRef.current
    audio.startTime = startTime
    audio.play()
    setIsPlaying(true)
    setCurrentTime(startTime)

    // Use course metadata as fallback duration
    setDuration(course.duration * 60)
  }, [getAudio, setIsLoading, setHasError, setIsPlaying, setCurrentTime, setDuration])

  const playWhiteNoise = useCallback((noise: WhiteNoise | null) => {
    const audio = getNoise()
    if (!noise) {
      audio.stop()
      return
    }
    audio.src = noise.audioUrl
    audio.volume = finalWhiteNoiseVolumeRef.current
    audio.play()
  }, [getNoise])

  const togglePlay = useCallback(() => {
    const audio = getAudio()
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (!currentCourse) {
        const firstCourse = usePlayerStore.getState().currentCourse
        if (firstCourse) {
          playCourse(firstCourse)
          return
        }
      }
      audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying, currentCourse, getAudio, setIsPlaying, playCourse])

  const seek = useCallback((time: number) => {
    const audio = getAudio()
    audio.seek(time)
    setCurrentTime(time)
  }, [getAudio, setCurrentTime])

  const skip = useCallback((seconds: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + seconds))
    seek(target)
  }, [duration, currentTime, seek])

  const changeVolume = useCallback((v: number) => {
    getAudio().volume = v
    setVolume(v)
  }, [getAudio, setVolume])

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      finalVolumeRef.current = 0
      getAudio().volume = 0
      setVolume(0)
    } else {
      const restore = 0.8
      finalVolumeRef.current = restore
      getAudio().volume = restore
      setVolume(restore)
    }
  }, [volume, getAudio, setVolume])

  const toggleLoop = useCallback(() => {
    const next = !isLooping
    getAudio().loop = next
    setIsLooping(next)
  }, [isLooping, getAudio, setIsLooping])

  const changeWhiteNoise = useCallback((noise: WhiteNoise | null) => {
    setWhiteNoise(noise)
    if (!noise) {
      getNoise().stop()
      return
    }
    playWhiteNoise(noise)
  }, [setWhiteNoise, getNoise, playWhiteNoise])

  const changeWhiteNoiseVolume = useCallback((v: number) => {
    finalWhiteNoiseVolumeRef.current = v
    setWhiteNoiseVolume(v)
    getNoise().volume = v
  }, [setWhiteNoiseVolume, getNoise])

  const setSleepTimerMinutes = useCallback((minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }
    setSleepTimerStore(minutes)
    if (minutes > 0) {
      sleepTimerRef.current = setTimeout(() => {
        getAudio().stop()
        setIsPlaying(false)
        setSleepTimerStore(0)
        Taro.showToast({ title: 'Timer ended', icon: 'none' })
      }, minutes * 60 * 1000)
    }
  }, [getAudio, setIsPlaying, setSleepTimerStore])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleReset = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
      sleepTimerRef.current = null
    }
    // Save progress before reset
    const course = currentCourseRef.current
    const audio = audioRef.current
    if (course && audio && audio.currentTime > 0) {
      const uid = getUserId()
      if (uid) {
        CourseAPI.updateProgress(uid, course.id, {
          position: Math.floor(audio.currentTime),
        }).catch(() => {})
      }
    }
    try { getAudio().stop() } catch {}
    try { getNoise().stop() } catch {}
    getAudio().destroy()
    getNoise().destroy()
    audioRef.current = null
    whiteNoiseRef.current = null
    usePlayerStore.getState().reset()
    setSleepTimerStore(0)
  }, [getAudio, getNoise, setSleepTimerStore, getUserId])

  // 初始化：处理路由参数
  useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params || {}
    let cancelled = false

    if (params.courseId) {
      const course = meditationCourses.find((c: any) => c.id === params.courseId)
      if (course) {
        setCurrentCourse(course)
        currentCourseRef.current = course
        playCourse(course)
      } else {
        // 本地缓存未找到（可能被归档），尝试从 API 获取
        CourseAPI.getCourseById(params.courseId)
          .then((apiCourse) => {
            if (cancelled) return
            if (apiCourse) {
              const mapped: any = {
                ...apiCourse,
                tags: Array.isArray(apiCourse.tags) ? apiCourse.tags : (() => { try { return JSON.parse(apiCourse.tags as any) } catch { return [] } })(),
                instructor: apiCourse.instructor?.name || '静心',
                category: apiCourse.category,
              }
              setCurrentCourse(mapped)
              currentCourseRef.current = mapped
              playCourse(mapped)
            } else {
              setCourseNotFound(true)
            }
          })
          .catch(() => {
            if (!cancelled) setCourseNotFound(true)
          })
      }
    } else if (params.noiseId) {
      const noiseItem = whiteNoises.find(n => n.id === params.noiseId)
      if (noiseItem) {
        setWhiteNoise(noiseItem)
        playWhiteNoise(noiseItem)
      }
    }

    return () => {
      cancelled = true
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current)
      }
      // getAudio/getNoise already cleanup on unmount via handleReset
    }
  }, [])

  return {
    // State
    currentCourse, isPlaying, currentTime, duration,
    volume, isLooping, whiteNoise, whiteNoiseVolume, sleepTimer,
    isLoading, hasError, courseNotFound,

    // Actions
    playCourse, playWhiteNoise, togglePlay, seek, skip,
    changeVolume, toggleMute, toggleLoop,
    changeWhiteNoise, changeWhiteNoiseVolume,
    setSleepTimerMinutes, formatTime, handleReset,
  }
}