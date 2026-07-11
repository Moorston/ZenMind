import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useUserStore } from '@/store/useUserStore'
import { useCoursesStore } from '@/store/useCoursesStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { CoursesAPI } from '@/api/courses'
import { whiteNoises, getNoiseEmoji, getNoiseColor } from '@/store/constants'
import type { MeditationCourse } from '@/store/types'
import { styles } from './HomeScreen.styles'

const CATEGORY_MAP: Record<string, string> = {
  sleep: 'sleep',
  anxiety: 'relax',
  focus: 'focus',
}

function getCategoryFromPreference(pref: string | null): string {
  if (!pref) return 'beginner'
  return CATEGORY_MAP[pref] || 'beginner'
}

function toMeditationCourse(c: any): MeditationCourse {
  const CATEGORY_DISPLAY: Record<string, string> = {
    breathing: 'beginner',
    'body-scan': 'sleep',
    visualization: 'focus',
    'loving-kindness': 'relax',
    mindfulness: 'beginner',
  }
  return {
    id: c.id,
    title: c.title || '',
    description: c.description || '',
    category: (CATEGORY_DISPLAY[c.category] || c.category || 'beginner') as any,
    duration: c.duration || 0,
    coverUrl: c.coverUrl || '',
    audioUrl: c.audioUrl || '',
    tags: (() => {
      if (typeof c.tags === 'string') {
        try { return JSON.parse(c.tags) } catch { return [] }
      }
      return c.tags || []
    })(),
    instructor: c.instructor?.name || '静心',
  }
}

interface RecommendedCourseWithReason extends CoursesAPI.Course {
  reason: string
  reasonType: string
}

export function HomeScreen() {
  const navigation = useNavigation<any>()
  const {
    nickname, streak, totalMinutes, preference,
    hasCompletedQuiz, getTodayCheckIn, getWeeklyStats,
  } = useUserStore()
  const { courses, initialized, initialize } = useCoursesStore()
  const { playCourse, playWhiteNoise, reset } = usePlayerStore()

  const [greeting, setGreeting] = useState('')
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourseWithReason[]>([])
  const [recommendLoading, setRecommendLoading] = useState(true)

  const meditationCourses: MeditationCourse[] = useMemo(
    () => courses.map(toMeditationCourse),
    [courses],
  )

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 6) setGreeting('深夜好')
    else if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  }, [])

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  // 加载个性化推荐
  useEffect(() => {
    let cancelled = false
    const loadRecommendations = async () => {
      try {
        const res = await CoursesAPI.getPersonalizedRecommendations(preference || undefined)
        if (!cancelled && res.data) {
          setRecommendedCourses(res.data)
        }
      } catch (err) {
        console.warn('[Home] Failed to fetch recommendations, using local fallback:', err)
        // 降级到本地推荐
        if (!cancelled && meditationCourses.length > 0) {
          const cat = getCategoryFromPreference(preference)
          const found = meditationCourses.filter(c => c.category === cat)
          const fallback = found.length > 0 ? found : meditationCourses
          setRecommendedCourses(fallback.slice(0, 3).map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            level: 'beginner',
            duration: c.duration,
            coverUrl: c.coverUrl,
            audioUrl: c.audioUrl,
            tags: JSON.stringify(c.tags),
            instructorId: null,
            seriesId: null,
            orderInSeries: 0,
            createdAt: '',
            reason: '为你推荐',
            reasonType: 'fallback',
          })))
        }
      } finally {
        if (!cancelled) setRecommendLoading(false)
      }
    }
    loadRecommendations()
    return () => { cancelled = true }
  }, [preference, meditationCourses])

  const todayCheckIn = getTodayCheckIn()
  const weeklyStats = getWeeklyStats()
  const maxMinutes = Math.max(...weeklyStats.map(s => s.minutes), 1)

  const handleQuickStart = async (course: MeditationCourse) => {
    try {
      await reset()
      playCourse(course)
      navigation.navigate('Player', { courseId: course.id })
    } catch (error) {
      console.error('Failed to start course:', error)
    }
  }

  const handleWhiteNoise = (noiseId: string) => {
    const noise = whiteNoises.find(n => n.id === noiseId)
    if (noise) {
      playWhiteNoise(noise)
      navigation.navigate('Player', { noiseId })
    }
  }

  const handleStartQuiz = () => {
    navigation.navigate('Quiz')
  }

  const handleViewAll = () => {
    navigation.navigate('Discover')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header greeting */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>
          {greeting}，{nickname}
        </Text>
        <Text style={styles.subtitleText}>今日宜静心</Text>
      </View>

      {/* Check-in card */}
      <View style={styles.card}>
        <View style={styles.checkinRow}>
          <View style={styles.checkinLeft}>
            <View style={styles.checkinIcon}>
              {todayCheckIn ? (
                <Text style={styles.checkinIconText}>✓</Text>
              ) : (
                <Text style={styles.checkinIconText}>✨</Text>
              )}
            </View>
            <View>
              <Text style={styles.checkinTitle}>
                {todayCheckIn ? '今日已打卡' : '开始打卡'}
              </Text>
              <Text style={styles.checkinSubtitle}>
                {todayCheckIn
                  ? `今日已冥想 ${todayCheckIn.duration} 分钟`
                  : '开始今天的冥想之旅'}
              </Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak}天</Text>
          </View>
        </View>
      </View>

      {/* Quiz banner */}
      {!hasCompletedQuiz && (
        <TouchableOpacity style={styles.card} onPress={handleStartQuiz}>
          <View style={styles.quizBanner}>
            <View style={styles.quizIcon}>
              <Text style={{ fontSize: 24 }}>🌙</Text>
            </View>
            <View style={styles.quizText}>
              <Text style={styles.quizTitle}>完成偏好测试</Text>
              <Text style={styles.quizSubtitle}>帮助我们为你推荐合适的内容</Text>
            </View>
            <View style={styles.quizBadge}>
              <Text style={styles.quizBadgeText}>开始</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Recommended courses - 个性化推荐列表 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>为你推荐</Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        {recommendLoading ? (
          <View style={[styles.card, { alignItems: 'center', padding: 20 }]}>
            <ActivityIndicator size="small" color="#7c6aef" />
            <Text style={{ color: '#9090a0', marginTop: 8 }}>加载推荐中...</Text>
          </View>
        ) : recommendedCourses.length > 0 ? (
          recommendedCourses.map((course) => {
            const meditationCourse = toMeditationCourse(course)
            return (
              <TouchableOpacity
                key={course.id}
                style={[styles.recommendCard, { marginBottom: 12 }]}
                onPress={() => handleQuickStart(meditationCourse)}
              >
                <Image
                  source={{ uri: course.coverUrl }}
                  style={styles.recommendImage}
                  resizeMode="cover"
                />
                <View style={styles.recommendInfo}>
                  <Text style={styles.recommendTitle}>{course.title}</Text>
                  <Text style={styles.recommendDesc} numberOfLines={2}>
                    {course.description}
                  </Text>
                  <View style={[styles.recommendMeta, { marginTop: 4 }]}>
                    <Text style={[styles.durationText, { backgroundColor: '#2dd4bf20', color: '#2dd4bf', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontSize: 11 }]}>
                      {course.reason}
                    </Text>
                    <Text style={styles.durationText}>⏱ {course.duration}分钟</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <TouchableOpacity style={[styles.card, { alignItems: 'center', padding: 24 }]} onPress={handleViewAll}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🧘</Text>
            <Text style={{ color: '#f0e6ff', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>暂无推荐</Text>
            <Text style={{ color: '#9090a0', fontSize: 13, textAlign: 'center' }}>去发现页探索更多冥想课程</Text>
            <View style={{ marginTop: 16, backgroundColor: '#7c6aef', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: '#fff', fontSize: 13 }}>查看全部</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* White noise grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>背景声音</Text>
        <Text style={styles.sectionSubtitle}>选择你喜欢的环境音</Text>
        <View style={styles.noiseGrid}>
          {whiteNoises.map(noise => (
            <TouchableOpacity
              key={noise.id}
              style={[styles.noiseCard, { backgroundColor: noise.color + '30' }]}
              onPress={() => handleWhiteNoise(noise.id)}
            >
              <Text style={styles.noiseEmoji}>{getNoiseEmoji(noise.id)}</Text>
              <Text style={styles.noiseName}>{noise.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weekly stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>本周统计</Text>
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>总分钟</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#2dd4bf' }]}>{streak}</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>
                {weeklyStats.filter(s => s.minutes > 0).length}
              </Text>
              <Text style={styles.statLabel}>冥想天数</Text>
            </View>
          </View>
          {/* Bar chart */}
          <View style={styles.barChart}>
            {weeklyStats.map((stat, i) => (
              <View key={i} style={styles.barColumn}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: Math.max((stat.minutes / maxMinutes) * 48, stat.minutes > 0 ? 4 : 0),
                      opacity: stat.minutes > 0 ? 1 : 0.2,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Quick start course list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快速开始</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
          <View style={styles.courseRow}>
            {meditationCourses.slice(0, 5).map(course => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => handleQuickStart(course)}
              >
                <Image
                  source={{ uri: course.coverUrl }}
                  style={styles.courseImage}
                  resizeMode="cover"
                />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                  <Text style={styles.courseDuration}>{course.duration}分钟</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Group meditation rooms */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
          onPress={() => navigation.navigate('RoomsList')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>👥</Text>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>多人冥想</Text>
              <Text style={{ fontSize: 12, color: '#9090a0', marginTop: 2 }}>与朋友一起静心</Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, color: '#9090a0' }}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
