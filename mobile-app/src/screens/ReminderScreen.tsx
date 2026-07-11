import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, Alert, StyleSheet, Linking,
} from 'react-native'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

const REMINDER_KEY = 'zenmind_reminder'
const PRESET_TIMES = [
  { label: '早晨', time: '07:00', value: '07:00' },
  { label: '中午', time: '12:00', value: '12:00' },
  { label: '下午', time: '15:00', value: '15:00' },
  { label: '傍晚', time: '18:00', value: '18:00' },
  { label: '夜晚', time: '22:00', value: '22:00' },
]

interface ReminderSettings {
  enabled: boolean
  time: string
  message: string
}

async function loadSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { enabled: false, time: '21:00', message: '该冥想了～' }
}

async function saveSettings(settings: ReminderSettings) {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings))
}

// Request notification permissions (call on mount)
async function requestNotificationPermission(): Promise<boolean> {
  try {
    const existing: any = await Notifications.getPermissionsAsync()
    if (existing.granted) return true
    const requested: any = await Notifications.requestPermissionsAsync()
    return !!requested.granted
  } catch {
    return false
  }
}

// Schedule a daily notification at the given time (HH:MM)
async function scheduleReminder(time: string) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    const [hour, minute] = time.split(':').map(Number)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '冥想提醒',
        body: '该冥想了～',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true,
      } as any,
    })
  } catch (e) {
    console.warn('Failed to schedule notification:', e)
  }
}

export function ReminderScreen() {
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState('21:00')
  const [showPresets, setShowPresets] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null)

  useEffect(() => {
    loadSettings().then(s => {
      setEnabled(s.enabled)
      setTime(s.time)
    })
    requestNotificationPermission().then(setPermissionsGranted)
  }, [])

  const handleToggle = async (value: boolean) => {
    if (value && permissionsGranted === false) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        Alert.alert('权限不足', '请前往系统设置开启通知权限', [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => Linking.openSettings() },
        ])
        return
      }
    }
    setEnabled(value)
    const newSettings = { enabled: value, time, message: '该冥想了～' }
    await saveSettings(newSettings)
    if (value) {
      await scheduleReminder(time)
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync()
    }
  }

  const handleTimeChange = async (newTime: string) => {
    setTime(newTime)
    setShowPresets(false)
    const newSettings = { enabled, time: newTime, message: '该冥想了～' }
    await saveSettings(newSettings)
    if (enabled) {
      await scheduleReminder(newTime)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>每日提醒</Text>

      {/* Enable toggle */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>每日提醒</Text>
            <Text style={styles.toggleSubtitle}>在设定时间收到冥想提醒</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#1a1a3e', true: '#7c6aef' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Time selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>提醒时间</Text>
        <TouchableOpacity
          style={styles.timeDisplay}
          onPress={() => setShowPresets(!showPresets)}
        >
          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {showPresets && (
          <View style={styles.presetGrid}>
            {PRESET_TIMES.map(pt => (
              <TouchableOpacity
                key={pt.value}
                style={[
                  styles.presetBtn,
                  time === pt.value && styles.presetBtnActive,
                ]}
                onPress={() => handleTimeChange(pt.value)}
              >
                <Text
                  style={[
                    styles.presetLabel,
                    time === pt.value && styles.presetLabelActive,
                  ]}
                >
                  {pt.label}
                </Text>
                <Text
                  style={[
                    styles.presetTime,
                    time === pt.value && styles.presetTimeActive,
                  ]}
                >
                  {pt.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Custom time input hint */}
        <TouchableOpacity
          style={styles.customTimeBtn}
          onPress={() => {
            Alert.prompt('自定义时间', '请输入时间 (HH:MM)', [
              { text: '取消', style: 'cancel' },
              {
                text: '确认',
                onPress: (text) => {
                  if (text && /^\d{2}:\d{2}$/.test(text)) {
                    handleTimeChange(text)
                  } else {
                    Alert.alert('格式错误', '请使用 HH:MM 格式')
                  }
                },
              },
            ])
          }}
        >
          <Text style={styles.customTimeText}>⌚ 自定义时间</Text>
        </TouchableOpacity>
      </View>

      {/* Permission status */}
      {permissionsGranted === false && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>⚠️ 通知权限未开启，提醒将无法送达</Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={async () => {
              const granted = await requestNotificationPermission()
              setPermissionsGranted(granted)
            }}
          >
            <Text style={styles.permissionBtnText}>重新请求权限</Text>
          </TouchableOpacity>
        </View>
      )}
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
  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#9090a0',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c6aef',
  },
  arrow: {
    fontSize: 18,
    color: '#9090a0',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  presetBtn: {
    width: '47%',
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#7c6aef20',
    borderWidth: 1,
    borderColor: '#7c6aef',
  },
  presetLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  presetLabelActive: {
    color: '#7c6aef',
  },
  presetTime: {
    fontSize: 12,
    color: '#9090a0',
    marginTop: 4,
  },
  presetTimeActive: {
    color: '#7c6aef',
  },
  customTimeBtn: {
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  customTimeText: {
    fontSize: 14,
    color: '#7c6aef',
  },
  warningCard: {
    backgroundColor: '#f9731620',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#f97316',
    marginBottom: 12,
  },
  permissionBtn: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})
