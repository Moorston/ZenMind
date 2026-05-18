import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo } from 'react'
import {
  Calendar, Flame, ChevronRight, LogIn, LogOut,
  Settings, Bell, Moon, FileText, Info
} from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MenuItem } from '@/components/menu-item'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/store/meditation'
import { useAuthStore } from '@/store/auth'

function getPreferenceLabel(pref: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    sleep: t('profile.preference.sleep'),
    anxiety: t('profile.preference.anxiety'),
    focus: t('profile.preference.focus'),
  }
  return labels[pref] || pref
}

export default function Profile() {
  const { t } = useTranslation()
  const {
    userName, streak, totalMinutes, checkIns,
    completedCourses, hasCompletedQuiz, preference
  } = useUserStore()
  const { isLoggedIn, user, logout } = useAuthStore()

  const calendarData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = now.getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const checkInDates = checkIns.map(c => new Date(c.date).getDate())

    return { daysInMonth, today, firstDayOfWeek, checkInDates }
  }, [checkIns])

  const getDayStatus = (day: number) => {
    const { checkInDates, today } = calendarData
    if (day > today) return 'future'
    return checkInDates.includes(day) ? 'checked' : 'empty'
  }

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/auth/index' })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: t('common.confirm'),
      content: t('auth.logoutConfirm'),
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.showToast({ title: t('auth.logoutSuccess'), icon: 'success' })
        }
      }
    })
  }

  const handleStartQuiz = () => {
    Taro.navigateTo({ url: '/pages/quiz/index' })
  }

  const handleViewStats = () => {
    Taro.navigateTo({ url: '/pages/stats/index' })
  }

  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' })
  }

  const handleReminder = () => {
    Taro.navigateTo({ url: '/pages/reminder/index' })
  }

  const weekDays = t('common.weekdays', { returnObjects: true }) as string[]

  return (
    <ScrollView scrollY className="h-screen px-4 pb-8 bg-background">
      <View className="pt-4 mb-6">
        <Card className="bg-card border-0">
          <CardContent className="p-4">
            {isLoggedIn ? (
              <View className="flex items-center gap-4">
                <View className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Text className="block text-2xl">{user?.avatar || '🧘'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="block text-xl font-semibold text-foreground">
                    {user?.nickname || userName}
                  </Text>
                  <Text className="block text-sm text-muted-foreground">
                    {preference ? getPreferenceLabel(preference, t) : t('profile.preference.placeholder')}
                  </Text>
                </View>
                <Badge className="bg-primary-20 text-primary">
                  <Flame size={14} color="#7c6aef" className="mr-1" />
                  {t('profile.streak', { streak })}
                </Badge>
              </View>
            ) : (
              <View onClick={handleLogin} className="flex items-center gap-4">
                <View className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <LogIn size={28} color="#9090a0" />
                </View>
                <View className="flex-1">
                  <Text className="block text-lg font-semibold text-foreground">
                    {t('auth.login')}
                  </Text>
                  <Text className="block text-sm text-muted-foreground">
                    {t('auth.subtitle')}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9090a0" />
              </View>
            )}
          </CardContent>
        </Card>
      </View>

      <View className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-card border-0">
          <CardContent className="p-4 text-center">
            <Text className="block text-3xl font-bold text-primary">{totalMinutes}</Text>
            <Text className="block text-sm text-muted-foreground">{t('profile.stats.totalMinutes')}</Text>
          </CardContent>
        </Card>
        <Card className="bg-card border-0">
          <CardContent className="p-4 text-center">
            <Text className="block text-3xl font-bold text-secondary">{completedCourses.length}</Text>
            <Text className="block text-sm text-muted-foreground">{t('profile.stats.completedCourses')}</Text>
          </CardContent>
        </Card>
      </View>

      <Card className="bg-card border-0 mb-6">
        <CardContent className="p-4">
          <View className="flex items-center justify-between mb-4">
            <Text className="block text-base font-semibold text-foreground">{t('profile.calendar.title')}</Text>
            <View className="flex items-center text-muted-foreground text-xs">
              <Calendar size={14} color="#9090a0" />
              <Text className="block ml-1">{t('profile.calendar.daysCount', { count: checkIns.length })}</Text>
            </View>
          </View>

          <View className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <View key={day} className="text-center py-1">
                <Text className="block text-xs text-muted-foreground">{day}</Text>
              </View>
            ))}
          </View>

          <View className="grid grid-cols-7 gap-1">
            {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
              const day = i + 1
              const status = getDayStatus(day)
              return (
                <View
                  key={day}
                  className={`aspect-square rounded-full flex items-center justify-center text-xs ${
                    day === calendarData.today ? 'ring-2 ring-primary' : ''
                  } ${
                    status === 'checked'
                      ? 'bg-primary text-white'
                      : status === 'empty'
                      ? 'bg-muted text-muted-foreground'
                      : 'text-muted'
                  }`}
                >
                  <Text className="block">{day}</Text>
                </View>
              )
            })}
          </View>
        </CardContent>
      </Card>

      <Card className="bg-card border-0 mb-6">
        <CardContent className="p-0 divide-y divide-border">
          <MenuItem
            icon={<FileText size={20} color="#7c6aef" />}
            label={t('profile.menu.stats')}
            onClick={handleViewStats}
          />

          {!hasCompletedQuiz && (
            <MenuItem
              icon={<Moon size={20} color="#2dd4bf" />}
              label={t('profile.menu.setPreferences')}
              subtitle={t('profile.menu.preferencesSubtitle')}
              iconBgClass="bg-secondary-20"
              badge={<Badge className="bg-destructive text-white text-xs">{t('profile.menu.newBadge')}</Badge>}
              onClick={handleStartQuiz}
            />
          )}

          <MenuItem
            icon={<Bell size={20} color="#fbbf24" />}
            label={t('profile.menu.reminder')}
            subtitle={t('profile.menu.reminderSubtitle')}
            iconBgClass="bg-warning-20"
            onClick={handleReminder}
          />

          <MenuItem
            icon={<Settings size={20} color="#9090a0" />}
            label={t('profile.menu.settings')}
            iconBgClass="bg-muted-foreground-20"
            onClick={handleSettings}
          />

          <MenuItem
            icon={<Info size={20} color="#9090a0" />}
            label={t('profile.menu.help')}
            iconBgClass="bg-muted-foreground-20"
          />
        </CardContent>
      </Card>

      {isLoggedIn && (
        <Button variant="destructive" className="w-full mb-4" onClick={handleLogout}>
          <LogOut size={16} color="#fff" className="mr-1" />
          <Text className="block">{t('auth.logout')}</Text>
        </Button>
      )}

      <Text className="block text-center text-xs text-muted-foreground">
        {t('profile.version')}
      </Text>
    </ScrollView>
  )
}
