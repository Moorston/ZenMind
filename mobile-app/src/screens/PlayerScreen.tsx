import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Audio } from 'expo-av'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUserStore } from '@/store/useUserStore'
import { useCoursesStore } from '@/store/useCoursesStore'
import { whiteNoises, getNoiseEmoji, getNoiseColor } from '@/store/constants'
import type { MeditationCourse } from '@/store/types'
import { CoursesAPI } from '@/api/courses'
import { useRoom } from '@/hooks/useRoom'
import { useAuthStore } from '@/store/useAuthStore'
import { styles } from './PlayerScreen.styles'

export function PlayerScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const params = route.params || {}

  const {
    currentCourse, isPlaying, currentTime, duration,
    volume, isLooping, whiteNoise, sleepTimerEnd,
    isLoading, hasError,
    playCourse, playWhiteNoise, pause, resume, togglePlay,
    seek, setVolume, toggleLoop, setSleepTimer, reset,
  } = usePlayerStore()

  const [showTimer, setShowTimer] = useState(false)
  const [timerValue, setTimerValue] = useState(15)
  const [courseNotFound, setCourseNotFound] = useState(false)

  // Room mode
  const roomId = params.roomId as string | undefined
  const { user } = useAuthStore()
  const room = useRoom(roomId || null)
  const lastSyncTimeRef = useRef(0)

  // Connect to room if roomId is present
  useEffect(() => {
    if (roomId && user?.id) {
      room.connect(user.id)
    }
    return () => { room.disconnect() }
  }, [roomId, user?.id])

  // Sync playback state to room (throttled to every 3 seconds)
  useEffect(() => {
    if (!roomId) return
    const now = Date.now()
    if (now - lastSyncTimeRef.current >= 3000) {
      room.sendPlaybackSync(currentTime, isPlaying)
      lastSyncTimeRef.current = now
    }
  }, [isPlaying, currentTime])

  // Load course or noise from params
  useEffect(() => {
    const { courseId, noiseId } = params
    let cancelled = false

    if (courseId) {
      const course = useCoursesStore.getState().getCourseById?.(courseId)
        || useCoursesStore.getState().courses.find(c => c.id === courseId)
      if (course) {
        const mc: MeditationCourse = {
          id: course.id,
          title: course.title,
          description: course.description,
          category: (course.category === 'breathing' ? 'beginner'
            : course.category === 'body-scan' ? 'beginner'
            : course.category === 'visualization' ? 'focus'
            : course.category === 'loving-kindness' ? 'relax'
            : course.category) as any,
          duration: course.duration,
          coverUrl: course.coverUrl,
          audioUrl: course.audioUrl,
          tags: (() => {
            if (typeof course.tags === 'string') {
              try { return JSON.parse(course.tags) } catch { return [] }
            }
            return course.tags || []
          })(),
          instructor: course.instructor?.name || '静心',
        }
        playCourse(mc)
      } else {
        // 本地缓存未找到，尝试从 API 获取
        CoursesAPI.getCourseById(courseId)
          .then((res) => {
            if (cancelled) return
            const apiCourse = res.data
            if (apiCourse) {
              const mc: MeditationCourse = {
                id: apiCourse.id,
                title: apiCourse.title,
                description: apiCourse.description,
                category: (apiCourse.category === 'breathing' ? 'beginner'
                  : apiCourse.category === 'body-scan' ? 'beginner'
                  : apiCourse.category === 'visualization' ? 'focus'
                  : apiCourse.category === 'loving-kindness' ? 'relax'
                  : apiCourse.category) as any,
                duration: apiCourse.duration,
                coverUrl: apiCourse.coverUrl,
                audioUrl: apiCourse.audioUrl,
                tags: (() => {
                  if (typeof apiCourse.tags === 'string') {
                    try { return JSON.parse(apiCourse.tags) } catch { return [] }
                  }
                  return apiCourse.tags || []
                })(),
                instructor: apiCourse.instructor?.name || '静心',
              }
              playCourse(mc)
            } else {
              setCourseNotFound(true)
            }
          })
          .catch(() => {
            if (!cancelled) setCourseNotFound(true)
          })
      }
    }
    if (noiseId && !courseId) {
      const noise = whiteNoises.find(n => n.id === noiseId)
      if (noise) playWhiteNoise(noise)
    }
    // Cleanup on unmount — stop audio and clear timers
    return () => {
      cancelled = true
      reset()
    }
  }, [params.courseId, params.noiseId])

  const handleClose = useCallback(() => {
    reset()
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Discover')
    }
  }, [reset, navigation])

  const handleSeek = (value: number) => {
    seek(value)
  }

  const handleTimerConfirm = () => {
    setSleepTimer(timerValue)
    setShowTimer(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const courseDescription = currentCourse?.description
    || (whiteNoise ? `白噪音 - ${whiteNoise.name}` : '选择音频开始冥想')

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {whiteNoise ? '白噪音' : '冥想课程'}
        </Text>
        {roomId ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 4 }}>👥</Text>
            <Text style={{ fontSize: 13, color: '#7c6aef', fontWeight: '600' }}>
              {room.participants.length + 1}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowTimer(!showTimer)}
            style={styles.timerBtn}
          >
            <Text style={styles.timerIcon}>⏱</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sleep timer panel */}
      {showTimer && (
        <View style={styles.timerPanel}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerTitle}>睡眠定时器</Text>
            <TouchableOpacity onPress={() => setShowTimer(false)}>
              <Text style={styles.timerClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timerSliderRow}>
            <Slider
              style={styles.timerSlider}
              minimumValue={5}
              maximumValue={60}
              step={5}
              value={timerValue}
              onValueChange={setTimerValue}
              minimumTrackTintColor="#7c6aef"
              maximumTrackTintColor="#1a1a3e"
              thumbTintColor="#7c6aef"
            />
            <Text style={styles.timerValue}>{timerValue}分钟</Text>
          </View>
          <View style={styles.timerPresets}>
            {[15, 30, 45, 60].map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.timerPresetBtn,
                  timerValue === m && styles.timerPresetActive,
                ]}
                onPress={() => setTimerValue(m)}
              >
                <Text
                  style={[
                    styles.timerPresetText,
                    timerValue === m && styles.timerPresetTextActive,
                  ]}
                >{m}分钟</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.timerConfirm} onPress={handleTimerConfirm}>
            <Text style={styles.timerConfirmText}>确认</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cover / Visual */}
      <View style={styles.visualContainer}>
        {isLoading && !currentCourse ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c6aef" />
          </View>
        ) : courseNotFound ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>📭</Text>
            <Text style={[styles.errorText, { fontSize: 16, fontWeight: '600' }]}>课程已下架</Text>
            <Text style={[styles.errorText, { fontSize: 13, marginTop: 8 }]}>该课程已不再可用，请浏览其他课程</Text>
            <TouchableOpacity
              style={[styles.playButton, { marginTop: 24, paddingHorizontal: 24 }]}
              onPress={() => navigation.navigate('Discover')}
            >
              <Text style={styles.playButtonText}>浏览课程</Text>
            </TouchableOpacity>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>加载失败</Text>
          </View>
        ) : currentCourse ? (
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: currentCourse.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            {isPlaying && <View style={styles.coverPulse} />}
          </View>
        ) : whiteNoise ? (
          <View style={[styles.noiseContainer, { backgroundColor: getNoiseColor(whiteNoise.id) + '30' }]}>
            <Text style={styles.noiseEmoji}>{getNoiseEmoji(whiteNoise.id)}</Text>
            {isPlaying && <View style={styles.coverPulse} />}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>🎵</Text>
          </View>
        )}

        <Text style={styles.courseTitle}>
          {currentCourse?.title || whiteNoise?.name || '选择音频'}
        </Text>
        <Text style={styles.courseDesc}>{courseDescription}</Text>

        {/* Progress slider */}
        {currentCourse && (
          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressSlider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onValueChange={handleSeek}
              minimumTrackTintColor="#7c6aef"
              maximumTrackTintColor="#1a1a3e"
              thumbTintColor="#7c6aef"
            />
            <View style={styles.progressTimeRow}>
              <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>
              <Text style={styles.progressTime}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Volume */}
        <View style={styles.volumeRow}>
          <TouchableOpacity onPress={() => setVolume(volume === 0 ? 0.8 : 0)}>
            <Text style={styles.volumeIcon}>{volume === 0 ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor="#9090a0"
            maximumTrackTintColor="#1a1a3e"
            thumbTintColor="#9090a0"
          />
        </View>

        {/* Playback controls */}
        <View style={styles.playbackRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => {
              const newTime = Math.max(0, currentTime - 15)
              seek(newTime)
            }}
          >
            <Text style={styles.controlIcon}>⏮ 15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlay}
          >
            <Text style={styles.playButtonIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => {
              const newTime = Math.min(duration, currentTime + 15)
              seek(newTime)
            }}
          >
            <Text style={styles.controlIcon}>15s ⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Loop + sleep timer status */}
        <View style={styles.extraRow}>
          <TouchableOpacity onPress={toggleLoop} style={styles.loopBtn}>
            <Text style={[styles.loopText, isLooping && styles.loopTextActive]}>
              {isLooping ? '🔁 循环开启' : '🔁 循环'}
            </Text>
          </TouchableOpacity>
          {sleepTimerEnd && sleepTimerEnd > Date.now() && (
            <Text style={styles.sleepTimerText}>
              ⏱ {Math.ceil((sleepTimerEnd - Date.now()) / 60000)}分钟剩余
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}
