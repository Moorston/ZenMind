import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/ui/safe-image'
import Taro from '@tarojs/taro'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play, Moon, Sparkles, Flame,
  Clock
} from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  meditationCourses,
  whiteNoises,
  useUserStore,
  usePlayerStore,
  getNoiseEmoji,
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

export default function Index() {
  const { t } = useTranslation()
  const { userName, streak, totalMinutes, preference, hasCompletedQuiz, getTodayCheckIn, getWeeklyStats } = useUserStore()
  const { setCurrentCourse, setIsPlaying } = usePlayerStore()

  const [greeting, setGreeting] = useState('')
  const [recommendedCourse, setRecommendedCourse] = useState<MeditationCourse | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 6) setGreeting(t('home.greeting.lateNight'))
    else if (hour < 12) setGreeting(t('home.greeting.morning'))
    else if (hour < 18) setGreeting(t('home.greeting.afternoon'))
    else setGreeting(t('home.greeting.evening'))

    if (preference) {
      const recommended = meditationCourses.find(c => c.category === getCategoryFromPreference(preference))
      setRecommendedCourse(recommended || meditationCourses[0])
    } else {
      setRecommendedCourse(meditationCourses[0])
    }
  }, [preference])

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

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <ScrollView scrollY className="flex-1 px-4 pb-24" style={{ height: '100%' }}>
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

        {recommendedCourse && (
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

            <Card className="bg-card border-0 overflow-hidden">
              <View className="flex">
                <SafeImage
                  src={recommendedCourse.coverUrl}
                  className="w-32 h-32"
                  mode="aspectFill"
                />
                <CardContent className="flex-1 p-3 flex flex-col justify-between">
                  <View>
                    <Text className="block text-base font-medium text-foreground">
                      {recommendedCourse.title}
                    </Text>
                    <Text className="block text-sm text-muted-foreground mt-1 line-clamp-2">
                      {recommendedCourse.description}
                    </Text>
                  </View>
                  <View className="flex items-center gap-2 mt-2">
                    <Badge className="bg-primary-20 text-primary">
                      <Clock size={12} color="#7c6aef" className="mr-1" />
                      {t('common.duration', { duration: recommendedCourse.duration })}
                    </Badge>
                  </View>
                </CardContent>
              </View>
              <View
                className="p-3 border-t border-border"
                onClick={() => handleQuickStart(recommendedCourse)}
              >
                <Button className="w-full bg-primary text-white">
                  <Play size={18} color="#fff" className="mr-2" />
                  <Text className="block">{t('home.recommendation.start')}</Text>
                </Button>
              </View>
            </Card>
          </View>
        )}

        <View className="mb-6">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-lg font-semibold text-foreground">{t('home.backgroundSounds.title')}</Text>
            <Text className="block text-sm text-muted-foreground">{t('home.backgroundSounds.subtitle')}</Text>
          </View>
          <View className="grid grid-cols-4 gap-3">
            {whiteNoises.map(noise => (
              <View
                key={noise.id}
                onClick={() => handleWhiteNoise(noise.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl"
                style={{ backgroundColor: `${noise.color}15` }}
              >
                <View
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: noise.color + '30' }}
                >
                  <Text className="block text-xl">{getNoiseEmoji(noise.id)}</Text>
                </View>
                <Text className="block text-xs text-foreground">{t('whitenoise.' + noise.id, noise.name)}</Text>
              </View>
            ))}
          </View>
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
              {meditationCourses.slice(0, 5).map(course => (
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
