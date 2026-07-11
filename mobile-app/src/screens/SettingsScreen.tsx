import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  Alert, StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { useUserStore } from '@/store/useUserStore'
import { useAuthStore } from '@/store/useAuthStore'

type Nav = NativeStackNavigationProp<RootStackParamList>

const LANGUAGES = [
  { code: 'zh', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
]

export function SettingsScreen() {
  const navigation = useNavigation<Nav>()
  const {
    nickname, isNotificationEnabled, soundEffectsEnabled,
    autoPlayEnabled, isDarkMode, language,
    setNickname, toggleNotification, toggleSoundEffects,
    toggleAutoPlay, setIsDarkMode, setLanguage,
  } = useUserStore()
  const { logout } = useAuthStore()
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)

  const handleSetNickname = () => {
    Alert.prompt('编辑昵称', '请输入新的昵称', [
      { text: '取消', style: 'cancel' },
      {
        text: '保存',
        onPress: (text) => {
          if (text && text.trim()) setNickname(text.trim())
        },
      },
    ])
  }

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: logout },
    ])
  }

  const currentLang = LANGUAGES.find(l => l.code === language)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>设置</Text>

      {/* User nickname */}
      <TouchableOpacity style={styles.settingItem} onPress={handleSetNickname}>
        <Text style={styles.settingLabel}>昵称</Text>
        <View style={styles.settingRight}>
          <Text style={styles.settingValue}>{nickname}</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Toggle settings */}
      <View style={styles.card}>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>消息通知</Text>
          <Switch
            value={isNotificationEnabled}
            onValueChange={toggleNotification}
            trackColor={{ false: '#1a1a3e', true: '#7c6aef' }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>音效</Text>
          <Switch
            value={soundEffectsEnabled}
            onValueChange={toggleSoundEffects}
            trackColor={{ false: '#1a1a3e', true: '#7c6aef' }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleLabel}>自动播放</Text>
          <Switch
            value={autoPlayEnabled}
            onValueChange={toggleAutoPlay}
            trackColor={{ false: '#1a1a3e', true: '#7c6aef' }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={[styles.toggleItem, { borderBottomWidth: 0 }]}>
          <Text style={styles.toggleLabel}>深色模式</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#1a1a3e', true: '#7c6aef' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Language */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setShowLanguagePicker(!showLanguagePicker)}
      >
        <Text style={styles.settingLabel}>语言</Text>
        <View style={styles.settingRight}>
          <Text style={styles.settingValue}>{currentLang?.label || language}</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>

      {showLanguagePicker && (
        <View style={styles.languageList}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={styles.languageOption}
              onPress={() => {
                setLanguage(lang.code)
                setShowLanguagePicker(false)
              }}
            >
              <Text
                style={[
                  styles.languageText,
                  language === lang.code && styles.languageTextActive,
                ]}
              >
                {lang.label}
              </Text>
              {language === lang.code && (
                <Text style={styles.languageCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Navigation buttons */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('Reminder')}
      >
        <Text style={styles.settingLabel}>提醒设置</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#ffffff',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#9090a0',
  },
  arrow: {
    fontSize: 18,
    color: '#9090a0',
  },
  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0a0a1a',
  },
  toggleLabel: {
    fontSize: 15,
    color: '#ffffff',
  },
  languageList: {
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0a0a1a',
  },
  languageText: {
    fontSize: 14,
    color: '#9090a0',
  },
  languageTextActive: {
    color: '#7c6aef',
    fontWeight: '600',
  },
  languageCheck: {
    color: '#7c6aef',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#ef444420',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
})
