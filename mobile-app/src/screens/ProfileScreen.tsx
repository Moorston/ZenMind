import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useUserStore } from '@/store/useUserStore'
import { useAuthStore } from '@/store/useAuthStore'
import { styles } from './ProfileScreen.style'

export function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const {
    nickname, streak, totalMinutes, checkIns,
    completedCourses, hasCompletedQuiz, preference,
  } = useUserStore()
  const { isLoggedIn, logout } = useAuthStore()

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
    if (day > calendarData.today) return 'future'
    return calendarData.checkInDates.includes(day) ? 'checked' : 'empty'
  }

  const handleLogout = () => {
    logout()
  }

  const handleStartQuiz = () => {
    navigation.navigate('Quiz')
  }

  const handleViewStats = () => {
    navigation.navigate('Stats')
  }

  const handleReminder = () => {
    navigation.navigate('Reminder')
  }

  const handleSettings = () => {
    navigation.navigate('Settings')
  }

  const preferenceLabel = preference
    ? { sleep: '睡眠辅助', anxiety: '焦虑缓解', focus: '专注力' }[preference] || preference
    : '未设置'

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      contentContainerStyle={styles.content}
    >
      {/* User info card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>🧘</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{nickname}</Text>
          <Text style={styles.userPreference}>{preferenceLabel}</Text>
        </View>
        {isLoggedIn && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak}天</Text>
          </View>
        )}
      </View>

      {/* Stats cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>总分钟</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2dd4bf' }]}>{completedCourses}</Text>
          <Text style={styles.statLabel}>完成课程</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>本月打卡</Text>
          <Text style={styles.sectionSubtitle}>已打卡 {checkIns.length} 天</Text>
        </View>
        <View style={styles.calendar}>
          <View style={styles.weekDaysRow}>
            {weekDays.map(d => (
              <Text key={d} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
              const day = i + 1
              const status = getDayStatus(day)
              return (
                <View
                  key={day}
                  style={[
                    styles.dayCell,
                    status === 'checked' && styles.dayChecked,
                    day === calendarData.today && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      status === 'checked' && styles.dayTextChecked,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>

      {/* Menu list */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleViewStats}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#7c6aef30' }]}>
              <Text style={{ fontSize: 18 }}>📊</Text>
            </View>
            <Text style={styles.menuLabel}>数据统计</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {!hasCompletedQuiz && (
          <TouchableOpacity style={styles.menuItem} onPress={handleStartQuiz}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#2dd4bf30' }]}>
                <Text style={{ fontSize: 18 }}>🌙</Text>
              </View>
              <View>
                <Text style={styles.menuLabel}>偏好测试</Text>
                <Text style={styles.menuSubtitle}>帮助我们为你推荐合适的内容</Text>
              </View>
            </View>
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>NEW</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={handleReminder}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#fbbf2430' }]}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View>
              <Text style={styles.menuLabel}>每日提醒</Text>
              <Text style={styles.menuSubtitle}>设置每日冥想提醒时间</Text>
            </View>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#9090a030' }]}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </View>
            <Text style={styles.menuLabel}>设置</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      {isLoggedIn && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.versionText}>ZenMind v1.0.0</Text>
    </ScrollView>
  )
}
