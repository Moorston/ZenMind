import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/ui/safe-image'
import Taro from '@tarojs/taro'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play, Moon, Sparkles, Flame,
  Clock, TrendingUp
} from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WhiteNoiseGrid } from '@/components/white-noise-grid'
import { CourseRepository } from '@/repositories/CourseRepository'
import { CourseAPI, type RecommendedCourseDTO } from '@/api/courses'
import {
  useUserStore,
  usePlayerStore,
  type MeditationCourse
} from '@/store/meditation'

const CATEGORY_MAP: Record<string, string> = {
  sleep: 'sleep',
  anxiety: 'relax',
  focus: 'focus'
}

function getCategoryFromPreference(pref: string): string {
  return CATEGORY_MAP[pref] || 'beginner'
}

/** 将后端推荐课程转为前端 MeditationCourse 格式 */
function toMeditationCourse(c: RecommendedCourseDTO): MeditationCourse {
  const CATEGORY_DISPLAY: Record<string, string> = {
    breathing: 'beginner',
    'body-scan': 'sleep',
    visualization: 'focus',
    'loving-kindness': 'relax',
    mindfulness: 'beginner',
  }
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: (CATEGORY_DISPLAY[c.category] || c.category || 'beginner') as any,
    duration: c.duration,
    coverUrl: c.coverUrl,
    audioUrl: c.audioUrl,
    tags: Array.isArray(c.tags) ? c.tags : (() => { try { return JSON.parse(c.tags) } catch { return [] } })(),
    instructor: c.instructor?.name || '静心',
  }
}

export default function Index() {
  const { t } = useTranslation()
  const { userName, streak, totalMinutes, preference, hasCompletedQuiz, getTodayCheckIn, getWeeklyStats } = useUserStore()
  const { setCurrentCourse, setIsPlaying } = usePlayerStore()

  const [greeting, setGreeting] = useState('')
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourseDTO[]>([])
  const [recommendLoading, setRecommendLoading] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 6) setGreeting(t('home.greeting.lateNight'))
    else if (hour < 12) setGreeting(t('home.greeting.morning'))
    else if (hour < 18) setGreeting(t('home.greeting.afternoon'))
    else setGreeting(t('home.greeting.evening'))
  }, [t])

  // 加载个性化推荐
  useEffect(() => {
    let cancelled = false
    const loadRecommendations = async () => {
      try {
        const courses = await CourseAPI.getPersonalizedRecommendations(preference || undefined)
        if (!cancelled) {
          setRecommendedCourses(courses)
        }
      } catch (err) {
        console.warn('[Index] Failed to fetch recommendations, using local fallback:', err)
        // 降级到本地推荐
        if (!cancelled) {
          const allCourses = CourseRepository.getAll()
          const fallback = preference
            ? allCourses.filter(c => c.category === getCategoryFromPreference(preference))
            : allCourses
          setRecommendedCourses(fallback.slice(0, 3).map(c => ({
            ...c,
            tags: Array.isArray(c.tags) ? JSON.stringify(c.tags) : c.tags,
            instructorId: null,
            seriesId: null,
            reason: t('home.recommendation.fallbackReason', '为你推荐'),
            reasonType: 'fallback' as const,
          })))
        }
      } finally {
        if (!cancelled) setRecommendLoading(false)
      }
    }
    loadRecommendations()
    return () => { cancelled = true }
  }, [preference, t])

  const todayCheckIn = getTodayCheckIn()
  const weeklyStats = useMemo(() => getWeeklyStats(), [getWeeklyStats])
  const maxMinutes = Math.max(...weeklyStats.map(s => s.minutes), 1)

  const handleQuickStart = (course: MeditationCourse) => {
    setCurrentCourse(course)
    Taro.navigateTo({ url: '/pages/player/index' })
    setTimeout(() => setIsPlaying(true), 500)
  }

  const handleWhiteNoise = (noiseId: string) => {
    Taro.navigateTo({ url: `/pages/player/index?noiseId=${noiseId}` })
  }

  const handleStartQuiz = () => {
    Taro.navigateTo({ url: '/pages/quiz/index' })
  }

  const handleViewAll = () => {
    Taro.switchTab({ url: '/pages/discover/index' })
  }

  const allCourses = useMemo(() => CourseRepository.getAll(), [])
  const whiteNoises = useMemo(() => CourseRepository.getWhiteNoises(), [])

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <ScrollView scrollY className="flex-1 px-4 pb-24">
        <View className="pt-6 mb-6">
          <Text className="block text-2xl font-bold text-foreground">
            {greeting}，{userName}
          </Text>
          <Text className="block text-sm text-muted-foreground mt-1">
            {t('home.subtitle')}
          </Text>
        </View>

        <Card className="bg-card border-0 mb-6">
          <CardContent className="p-4">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  {todayCheckIn ? (
                    <Text className="block text-xl">✓</Text>
                  ) : (
                    <Sparkles size={24} color="#fff" />
                  )}
                </View>
                <View>
                  <Text className="block text-foreground font-medium">
                    {todayCheckIn ? t('home.checkin.completed') : t('home.checkin.title')}
                  </Text>
                  <Text className="block text-sm text-muted-foreground">
                    {todayCheckIn
                      ? t('home.checkin.duration', { duration: todayCheckIn.duration })
                      : t('home.checkin.startPrompt')}
                  </Text>
                </View>
              </View>
              <Badge className="bg-warning-20 text-warning">
                <Flame size={14} color="#fff" className="mr-1" />
                {t('home.streak.days', { streak })}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {!hasCompletedQuiz && (
          <Card className="bg-card border-0 mb-6" onClick={handleStartQuiz}>
            <CardContent className="p-4">
              <View className="flex items-center gap-4">
                <View className="w-14 h-14 rounded-full bg-secondary-20 flex items-center justify-center">
                  <Moon size={28} color="#2dd4bf" />
                </View>
                <View className="flex-1">
                  <Text className="block text-foreground font-medium">{t('home.quizBanner.title')}</Text>
                  <Text className="block text-sm text-muted-foreground">{t('home.quizBanner.subtitle')}</Text>
                </View>
                <Badge className="bg-destructive text-white">{t('home.quizBanner.cta')}</Badge>
              </View>
            </CardContent>
          </Card>
        )}

        {/* 为你推荐 - 个性化推荐列表 */}
        {recommendedCourses.length > 0 && (
          <View className="mb-6">
            <View className="flex items-center justify-between mb-3">
              <Text className="block text-lg font-semibold text-foreground">{t('home.recommendation.title')}</Text>
              <Text
                className="block text-sm text-primary"
                onClick={handleViewAll}
              >
                {t('home.recommendation.viewAll')}
              </Text>
            </View>

            {recommendedCourses.map((course, index) => {
              const meditationCourse = toMeditationCourse(course)
              return (
                <Card key={course.id} className="bg-card border-0 overflow-hidden mb-3">
                  <View className="flex">
                    <SafeImage
                      src={course.coverUrl}
                      className="w-28 h-28"
                      mode="aspectFill"
                    />
                    <CardContent className="flex-1 p-3 flex flex-col justify-between">
                      <View>
                        <View className="flex items-center gap-2 mb-1">
                          <Text className="block text-base font-medium text-foreground">
                            {course.title}
                          </Text>
                        </View>
                        <Text className="block text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </Text>
                        <Badge className="bg-secondary-20 text-secondary text-xs mt-1 self-start">
                          {course.reason}
                        </Badge>
                      </View>
                      <View className="flex items-center gap-2 mt-2">
                        <Badge className="bg-primary-20 text-primary">
                          <Clock size={12} color="#7c6aef" className="mr-1" />
                          {t('common.duration', { duration: course.duration })}
                        </Badge>
                      </View>
                    </CardContent>
                  </View>
                  <View
                    className="p-3 border-t border-border"
                    onClick={() => handleQuickStart(meditationCourse)}
                  >
                    <Button className="w-full bg-primary text-white">
                      <Play size={18} color="#fff" className="mr-2" />
                      <Text className="block">{t('home.recommendation.start')}</Text>
                    </Button>
                  </View>
                </Card>
              )
            })}
          </View>
        )}

        {recommendLoading && (
          <View className="mb-6">
            <View className="flex items-center justify-between mb-3">
              <Text className="block text-lg font-semibold text-foreground">{t('home.recommendation.title')}</Text>
            </View>
            <Card className="bg-card border-0">
              <CardContent className="p-6 flex items-center justify-center">
                <Text className="block text-muted-foreground">{t('common.loading', '加载中...')}</Text>
              </CardContent>
            </Card>
          </View>
        )}

        {!recommendLoading && recommendedCourses.length === 0 && (
          <View className="mb-6">
            <View className="flex items-center justify-between mb-3">
              <Text className="block text-lg font-semibold text-foreground">{t('home.recommendation.title')}</Text>
            </View>
            <Card
              className="bg-card border-0"
              onClick={handleViewAll}
            >
              <CardContent className="p-6 flex flex-col items-center">
                <Text className="block text-4xl mb-3">🧘</Text>
                <Text className="block text-foreground font-medium mb-1">{t('home.recommendation.emptyTitle', '暂无推荐')}</Text>
                <Text className="block text-sm text-muted-foreground text-center">{t('home.recommendation.emptySubtitle', '去发现页探索更多冥想课程')}</Text>
                <View className="mt-4 px-6 py-2 bg-primary rounded-full">
                  <Text className="block text-white text-sm">{t('home.recommendation.viewAll')}</Text>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        <View className="mb-6">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-lg font-semibold text-foreground">{t('home.backgroundSounds.title')}</Text>
            <Text className="block text-sm text-muted-foreground">{t('home.backgroundSounds.subtitle')}</Text>
          </View>
          <WhiteNoiseGrid whiteNoises={whiteNoises} onSelect={(noise) => handleWhiteNoise(noise.id)} />
        </View>

        <View className="mb-6">
          <Text className="block text-lg font-semibold text-foreground mb-3">{t('home.weeklyStats.title')}</Text>
          <Card className="bg-card border-0">
            <CardContent className="p-4">
              <View className="flex items-center justify-between mb-4">
                <View className="text-center">
                  <Text className="block text-2xl font-bold text-primary">{totalMinutes}</Text>
                  <Text className="block text-xs text-muted-foreground">{t('home.weeklyStats.totalMinutes')}</Text>
                </View>
                <View className="text-center">
                  <Text className="block text-2xl font-bold text-secondary">{streak}</Text>
                  <Text className="block text-xs text-muted-foreground">{t('home.weeklyStats.streak')}</Text>
                </View>
                <View className="text-center">
                  <Text className="block text-2xl font-bold text-warning">
                    {weeklyStats.reduce((sum, s) => sum + (s.minutes > 0 ? 1 : 0), 0)}
                  </Text>
                  <Text className="block text-xs text-muted-foreground">{t('home.weeklyStats.meditationDays')}</Text>
                </View>
              </View>

              <View className="flex items-end justify-between h-16 gap-1">
                {weeklyStats.map((stat, i) => (
                  <View key={i} className="flex-1 flex flex-col items-center">
                    <View
                      className="w-full rounded-t-sm bg-primary"
                      style={{
                        height: `${Math.max((stat.minutes / maxMinutes) * 48, stat.minutes > 0 ? 4 : 0)}px`,
                        opacity: stat.minutes > 0 ? 1 : 0.2
                      }}
                    />
                    <Text className="block text-xs text-muted-foreground mt-1">{stat.day}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>

        <View>
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-lg font-semibold text-foreground">{t('home.quickStart.title')}</Text>
          </View>
          <ScrollView scrollX className="-mx-4 px-4">
            <View className="flex gap-3">
              {allCourses.slice(0, 5).map(course => (
                <View
                  key={course.id}
                  onClick={() => handleQuickStart(course)}
                  className="w-36 flex-shrink-0"
                >
                  <Card className="bg-card border-0 overflow-hidden">
                    <SafeImage
                      src={course.coverUrl}
                      className="w-full h-24"
                      mode="aspectFill"
                    />
                    <CardContent className="p-2">
                      <Text className="block text-sm text-foreground truncate">
                        {course.title}
                      </Text>
                      <Text className="block text-xs text-muted-foreground">
                        {t('common.duration', { duration: course.duration })}
                      </Text>
                    </CardContent>
                  </Card>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}
