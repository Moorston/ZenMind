import { useMemo } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native'
import { useUserStore } from '@/store/useUserStore'

const ACHIEVEMENTS = [
  { id: 'first_course', label: '初次冥想', desc: '完成第一门课程', check: (s: any) => s.completedCourses >= 1 },
  { id: 'streak_3', label: '连续3天', desc: '连续打卡3天', check: (s: any) => s.streak >= 3 },
  { id: 'streak_7', label: '一周坚持', desc: '连续打卡7天', check: (s: any) => s.streak >= 7 },
  { id: 'minutes_100', label: '百分成就', desc: '累计冥想100分钟', check: (s: any) => s.totalMinutes >= 100 },
]

export function StatsScreen() {
  const {
    streak, totalMinutes, checkIns, completedCourses,
    getWeeklyStats,
  } = useUserStore()

  // Read store values directly (they trigger re-render via zustand)
  const weeklyStats = getWeeklyStats()
  const maxMinutes = Math.max(...weeklyStats.map(s => s.minutes), 1)

  const longestStreak = useMemo(() => {
    if (checkIns.length === 0) return 0
    // Sort unique check-in dates descending
    const dates = [...new Set(checkIns.map(c => c.date))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    if (dates.length === 0) return 0
    let max = 1
    let current = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
      if (diffDays === 1) {
        current++
        if (current > max) max = current
      } else {
        current = 1
      }
    }
    return max
  }, [checkIns])

  const avgMinutes = completedCourses > 0
    ? Math.round(totalMinutes / completedCourses)
    : 0

  const bestTime = useMemo(() => {
    if (checkIns.length === 0) return null
    const counts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 }
    for (const c of checkIns) {
      const hour = parseInt((c.time || '12:00').split(':')[0] || '12', 10)
      if (hour >= 5 && hour < 12) counts.morning++
      else if (hour >= 12 && hour < 17) counts.afternoon++
      else if (hour >= 17 && hour < 21) counts.evening++
      else counts.night++
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const labels: Record<string, string> = {
      morning: '清晨',
      afternoon: '午后',
      evening: '傍晚',
      night: '夜间',
    }
    return labels[sorted[0][0]]
  }, [checkIns])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>数据统计</Text>

      {/* 4 stat cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>总分钟</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2dd4bf' }]}>{streak}</Text>
          <Text style={styles.statLabel}>当前连胜</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#fbbf24' }]}>{avgMinutes}</Text>
          <Text style={styles.statLabel}>平均分钟</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f97316' }]}>{longestStreak}</Text>
          <Text style={styles.statLabel}>最长连胜</Text>
        </View>
      </View>

      {/* Weekly bar chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>过去7天</Text>
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

      {/* Best time */}
      {bestTime && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>最佳时段</Text>
          <View style={styles.bestTimeRow}>
            <Text style={styles.bestTimeEmoji}>⏰</Text>
            <Text style={styles.bestTimeText}>你最常{bestTime}冥想</Text>
          </View>
        </View>
      )}

      {/* Achievements */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>成就</Text>
        <View style={styles.achievementsList}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = a.check({ streak, totalMinutes, completedCourses })
            return (
              <View key={a.id} style={styles.achievementItem}>
                <View style={[styles.achievementIcon, !unlocked && styles.achievementLocked]}>
                  <Text style={styles.achievementIconText}>
                    {unlocked ? '🏆' : '🔒'}
                  </Text>
                </View>
                <View style={styles.achievementText}>
                  <Text style={[styles.achievementLabel, !unlocked && styles.achievementLabelLocked]}>
                    {a.label}
                  </Text>
                  <Text style={styles.achievementDesc}>{a.desc}</Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c6aef',
  },
  statLabel: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 64,
    gap: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barFill: {
    width: '60%',
    backgroundColor: '#7c6aef',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 4,
  },
  bestTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bestTimeEmoji: {
    fontSize: 24,
  },
  bestTimeText: {
    fontSize: 15,
    color: '#ffffff',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c6aef20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementLocked: {
    backgroundColor: '#1a1a3e',
  },
  achievementIconText: {
    fontSize: 18,
  },
  achievementText: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  achievementLabelLocked: {
    color: '#9090a0',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 2,
  },
})
