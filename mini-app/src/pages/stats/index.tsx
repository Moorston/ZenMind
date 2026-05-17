import { View, Text, ScrollView } from '@tarojs/components'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Clock, Flame, TrendingUp,
  Target, Award, Sunrise, Moon
} from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserStore, getBestTime } from '@/store/meditation'

function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const sortedDates = [...new Set(dates)].sort()
  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diff === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else if (diff > 1) {
      currentStreak = 1
    }
  }

  return maxStreak
}

export default function Stats() {
  const { totalMinutes, streak, checkIns, completedCourses, getWeeklyStats } = useUserStore()
  const { t } = useTranslation()

  const weeklyStats = useMemo(() => getWeeklyStats(), [getWeeklyStats])
  const maxMinutes = Math.max(...weeklyStats.map(s => s.minutes), 1)
  const weeklyMinutes = weeklyStats.reduce((sum, s) => sum + s.minutes, 0)
  const avgMinutes = checkIns.length > 0
    ? Math.round(totalMinutes / checkIns.length)
    : 0
  const longestStreak = useMemo(() => calculateLongestStreak(checkIns.map(c => c.date)), [checkIns])
  const bestTime = getBestTime(checkIns)

  return (
    <View className="min-h-screen bg-background px-4 pb-8">
      <ScrollView scrollY className="h-screen pb-8">
        <View className="pt-4 pb-6">
          <Text className="block text-2xl font-bold text-foreground">{t('stats.title')}</Text>
          <Text className="block text-sm text-muted-foreground mt-1">
            {t('stats.subtitle')}
          </Text>
        </View>

        <View className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <View className="w-12 h-12 rounded-full bg-primary-20 flex items-center justify-center mx-auto mb-2">
                <Clock size={24} color="#7c6aef" />
              </View>
              <Text className="block text-3xl font-bold text-foreground">{totalMinutes}</Text>
              <Text className="block text-sm text-muted-foreground">{t('stats.totalMinutes')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <View className="w-12 h-12 rounded-full bg-warning-20 flex items-center justify-center mx-auto mb-2">
                <Flame size={24} color="#fbbf24" />
              </View>
              <Text className="block text-3xl font-bold text-foreground">{streak}</Text>
              <Text className="block text-sm text-muted-foreground">{t('stats.currentStreak')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <View className="w-12 h-12 rounded-full bg-secondary-20 flex items-center justify-center mx-auto mb-2">
                <Target size={24} color="#2dd4bf" />
              </View>
              <Text className="block text-3xl font-bold text-foreground">{avgMinutes}</Text>
              <Text className="block text-sm text-muted-foreground">{t('stats.avgMinutes')}</Text>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardContent className="p-4 text-center">
              <View className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'rgba(244, 114, 182, 0.2)' }}>
                <Award size={24} color="#f472b6" />
              </View>
              <Text className="block text-3xl font-bold text-foreground">{longestStreak}</Text>
              <Text className="block text-sm text-muted-foreground">{t('stats.longestStreak')}</Text>
            </CardContent>
          </Card>
        </View>

        <Card className="bg-card border-0 mb-6">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-4">
              <Text className="block text-base font-semibold text-foreground">{t('stats.weeklyTrend.title')}</Text>
              <Badge className="bg-primary-20 text-primary">
                <TrendingUp size={12} color="#7c6aef" className="mr-1" />
                {t('stats.weeklyTrend.total', { minutes: weeklyMinutes })}
              </Badge>
            </View>

            <View className="flex items-end justify-between h-32 gap-2">
              {weeklyStats.map((stat, i) => {
                const height = (stat.minutes / maxMinutes) * 96
                const isToday = i === weeklyStats.length - 1

                return (
                  <View key={i} className="flex-1 flex flex-col items-center">
                    <View
                      className="w-full flex items-end justify-center"
                      style={{ height: '96px' }}
                    >
                      <View
                        className={`w-8 rounded-t-md transition-all ${
                          stat.minutes > 0
                            ? isToday
                              ? 'bg-primary'
                              : 'bg-primary-60'
                            : 'bg-muted'
                        }`}
                        style={{
                          height: stat.minutes > 0 ? `${height}px` : '4px',
                          minHeight: '4px'
                        }}
                      />
                    </View>
                    <Text className={`block text-xs mt-2 ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {stat.day}
                    </Text>
                    {stat.minutes > 0 && (
                      <Text className="block text-xs text-muted-foreground">{stat.minutes}m</Text>
                    )}
                  </View>
                )
              })}
            </View>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 mb-6">
          <CardContent className="p-4">
            <Text className="block text-base font-semibold text-foreground mb-4">{t('stats.achievements.title')}</Text>

            <View className="grid grid-cols-4 gap-4">
              <View className="flex flex-col items-center">
                <View
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                    completedCourses.length >= 1 ? 'bg-warning-20' : 'bg-muted'
                  }`}
                >
                  <Text className="text-2xl">{completedCourses.length >= 1 ? '🌱' : '🌰'}</Text>
                </View>
                <Text className="block text-xs text-muted-foreground text-center">{t('stats.achievements.beginner')}</Text>
              </View>

              <View className="flex flex-col items-center">
                <View
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                    streak >= 3 ? 'bg-warning-20' : 'bg-muted'
                  }`}
                >
                  <Text className="text-2xl">{streak >= 3 ? '🔥' : '💧'}</Text>
                </View>
                <Text className="block text-xs text-muted-foreground text-center">{t('stats.achievements.streak3')}</Text>
              </View>

              <View className="flex flex-col items-center">
                <View
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                    streak >= 7 ? 'bg-destructive-20' : 'bg-muted'
                  }`}
                >
                  <Text className="text-2xl">{streak >= 7 ? '⭐' : '🌙'}</Text>
                </View>
                <Text className="block text-xs text-muted-foreground text-center">{t('stats.achievements.streak7')}</Text>
              </View>

              <View className="flex flex-col items-center">
                <View
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                    totalMinutes >= 100 ? 'bg-primary-20' : 'bg-muted'
                  }`}
                >
                  <Text className="text-2xl">{totalMinutes >= 100 ? '🏆' : '🎯'}</Text>
                </View>
                <Text className="block text-xs text-muted-foreground text-center">{t('stats.achievements.minutes100')}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {bestTime && (
          <Card className="bg-card border-0">
            <CardContent className="p-4">
              <View className="flex items-center gap-4">
                <View className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
                  {bestTime.type === 'morning' ? (
                    <Sunrise size={24} color="#f59e0b" />
                  ) : bestTime.type === 'afternoon' ? (
                    <Sunrise size={24} color="#f59e0b" />
                  ) : (
                    <Moon size={24} color="#6366f1" />
                  )}
                </View>
                <View>
                  <Text className="block text-foreground font-medium">{t('stats.bestTime.title')}</Text>
                  <Text className="block text-sm text-muted-foreground">
                    {t('stats.bestTime.description', { time: t('common.timeOfDay.' + bestTime.type) })}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </View>
  )
}
