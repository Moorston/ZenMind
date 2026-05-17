import { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore, type AuthMethod } from '@/store/useAuthStore'
import { Network } from '@/api/network'

type Nav = NativeStackNavigationProp<RootStackParamList>

export function LoginScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const login = useAuthStore((s) => s.login)
  const [method, setMethod] = useState<AuthMethod>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const isPhoneValid = /^1\d{10}$/.test(phone)
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmitPhone = method === 'phone' && isPhoneValid && password.length >= 6
  const canSubmitEmail = method === 'email' && isEmailValid && password.length >= 6

  const handleWechatLogin = () => {
    setLoading(true)
    setTimeout(() => {
      login({
        userId: 'wx_' + Date.now(),
        token: 'mock_token_wx',
        nickname: '微信用户',
        wechatOpenId: 'mock_openid',
      })
      navigation.replace('MainTabs')
      setLoading(false)
    }, 800)
  }

  const handlePasswordLogin = async () => {
    setLoading(true)
    try {
      const identifier = method === 'phone' ? phone : email
      const res = await Network.request<{
        userId: string; token: string; nickname?: string; avatarUrl?: string
      }>({
        url: '/api/auth/login',
        method: 'POST',
        data: { identifier, password, type: method },
      })
      login({
        userId: res.userId,
        token: res.token,
        nickname: res.nickname,
        avatarUrl: res.avatarUrl,
        phone: method === 'phone' ? phone : undefined,
        email: method === 'email' ? email : undefined,
      })
      navigation.replace('MainTabs')
    } catch {
      Alert.alert('登录失败', '账号或密码错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = () => {
    if (!isPhoneValid) return
    Network.request({ url: '/api/auth/send-code', method: 'POST', data: { phone } })
      .then(() => Alert.alert('验证码已发送'))
      .catch(() => Alert.alert('发送失败'))
  }

  const tabs: { key: AuthMethod; label: string }[] = [
    { key: 'wechat', label: '微信' },
    { key: 'phone', label: '手机号' },
    { key: 'email', label: '邮箱' },
  ]

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 60 }]}
      contentContainerStyle={{ paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.brandIcon}>🧘</Text>
      <Text style={styles.title}>欢迎回来</Text>
      <Text style={styles.subtitle}>登录尘间静，开始你的冥想之旅</Text>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, method === t.key && styles.tabActive]}
            onPress={() => setMethod(t.key)}
          >
            <Text style={[styles.tabText, method === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {method === 'wechat' ? (
        <View style={styles.wechatSection}>
          <TouchableOpacity
            style={styles.wechatButton}
            onPress={handleWechatLogin}
            disabled={loading}
          >
            <Text style={styles.wechatIcon}>💬</Text>
            <Text style={styles.wechatButtonText}>微信一键登录</Text>
          </TouchableOpacity>
          <Text style={styles.wechatHint}>
            首次登录将自动创建账号
          </Text>
        </View>
      ) : (
        <View style={styles.form}>
          {method === 'phone' ? (
            <>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="手机号"
                  placeholderTextColor="#606080"
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phone}
                  onChangeText={setPhone}
                />
                <TouchableOpacity
                  style={[styles.codeButton, !isPhoneValid && styles.codeButtonDisabled]}
                  onPress={handleSendCode}
                  disabled={!isPhoneValid}
                >
                  <Text style={[styles.codeButtonText, !isPhoneValid && styles.codeButtonTextDisabled]}>
                    发送验证码
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="密码"
                placeholderTextColor="#606080"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={[styles.submitButton, !canSubmitPhone && styles.submitButtonDisabled]}
                disabled={!canSubmitPhone || loading}
                onPress={handlePasswordLogin}
              >
                <Text style={styles.submitText}>
                  {loading ? '登录中...' : '登录'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="邮箱地址"
                placeholderTextColor="#606080"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="密码"
                placeholderTextColor="#606080"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={[styles.submitButton, !canSubmitEmail && styles.submitButtonDisabled]}
                disabled={!canSubmitEmail || loading}
                onPress={handlePasswordLogin}
              >
                <Text style={styles.submitText}>
                  {loading ? '登录中...' : '登录'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>还没有账号？</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>注册新账号</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 24,
  },
  brandIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9090a0',
    textAlign: 'center',
    marginBottom: 40,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#12122a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#7c6aef',
  },
  tabText: {
    fontSize: 15,
    color: '#9090a0',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  wechatSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  wechatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07c160',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  wechatIcon: {
    fontSize: 20,
  },
  wechatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  wechatHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#606080',
  },
  form: {
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: '#12122a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
  },
  codeButton: {
    backgroundColor: '#7c6aef',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 12,
  },
  codeButtonDisabled: {
    backgroundColor: '#2a2a4a',
  },
  codeButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  codeButtonTextDisabled: {
    color: '#606080',
  },
  submitButton: {
    backgroundColor: '#7c6aef',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#2a2a4a',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1a1a2e',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#606080',
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#7c6aef',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#7c6aef',
    fontWeight: '500',
  },
})
