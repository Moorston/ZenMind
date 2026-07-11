import { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/useAuthStore'
import { Network } from '@/api/network'

type Nav = NativeStackNavigationProp<RootStackParamList>

export function RegisterScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const login = useAuthStore((s) => s.login)
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [useEmail, setUseEmail] = useState(false)
  const [loading, setLoading] = useState(false)

  const isPhoneValid = /^1\d{10}$/.test(phone)
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = nickname.length > 0 &&
    password.length >= 6 &&
    password === confirmPassword &&
    code.length === 6 &&
    /^\d{6}$/.test(code) &&
    (useEmail ? isEmailValid : isPhoneValid)

  const handleSendCode = () => {
    if (useEmail) {
      if (!isEmailValid) return
      Network.request({ url: '/api/auth/send-code', method: 'POST', data: { email } })
        .then(() => Alert.alert('验证码已发送'))
        .catch(() => Alert.alert('发送失败'))
    } else {
      if (!isPhoneValid) return
      Network.request({ url: '/api/auth/send-code', method: 'POST', data: { phone } })
        .then(() => Alert.alert('验证码已发送'))
        .catch(() => Alert.alert('发送失败'))
    }
  }

  const handleRegister = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await Network.request<{
        userId: string; token: string
      }>({
        url: '/api/auth/register',
        method: 'POST',
        data: {
          nickname,
          identifier: useEmail ? email : phone,
          password,
          type: useEmail ? 'email' : 'phone',
          code,
        },
      })
      login({
        userId: res.userId,
        token: res.token,
        nickname,
        phone: useEmail ? undefined : phone,
        email: useEmail ? email : undefined,
      })
      navigation.replace('MainTabs')
    } catch {
      Alert.alert('注册失败', '请检查信息后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 60 }]}
      contentContainerStyle={{ paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.brandIcon}>🧘</Text>
      <Text style={styles.title}>创建账号</Text>
      <Text style={styles.subtitle}>注册后即可开始你的冥想之旅</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="昵称"
          placeholderTextColor="#606080"
          maxLength={20}
          value={nickname}
          onChangeText={setNickname}
        />

        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.switchTab, !useEmail && styles.switchTabActive]}
            onPress={() => setUseEmail(false)}
          >
            <Text style={[styles.switchText, !useEmail && styles.switchTextActive]}>
              手机号
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchTab, useEmail && styles.switchTabActive]}
            onPress={() => setUseEmail(true)}
          >
            <Text style={[styles.switchText, useEmail && styles.switchTextActive]}>
              邮箱
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            placeholder={useEmail ? '邮箱地址' : '手机号'}
            placeholderTextColor="#606080"
            keyboardType={useEmail ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            maxLength={useEmail ? undefined : 11}
            value={useEmail ? email : phone}
            onChangeText={useEmail ? setEmail : setPhone}
          />
          <TouchableOpacity
            style={[styles.codeButton, styles.codeButtonSmall,
              !(useEmail ? isEmailValid : isPhoneValid) && styles.codeButtonDisabled,
            ]}
            onPress={handleSendCode}
            disabled={!(useEmail ? isEmailValid : isPhoneValid)}
          >
            <Text style={[styles.codeButtonText, !(useEmail ? isEmailValid : isPhoneValid) && styles.codeButtonTextDisabled]}>
              验证码
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="验证码"
          placeholderTextColor="#606080"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <TextInput
          style={styles.input}
          placeholder="密码（至少6位）"
          placeholderTextColor="#606080"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="确认密码"
          placeholderTextColor="#606080"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          disabled={!canSubmit || loading}
          onPress={handleRegister}
        >
          <Text style={styles.submitText}>
            {loading ? '注册中...' : '注册'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>已有账号？</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.loginText}>返回登录</Text>
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
  form: {
    marginBottom: 32,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#12122a',
  },
  switchTabActive: {
    backgroundColor: '#7c6aef',
  },
  switchText: {
    fontSize: 14,
    color: '#9090a0',
  },
  switchTextActive: {
    color: '#ffffff',
    fontWeight: '500',
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
  codeButtonSmall: {
    paddingHorizontal: 12,
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
  loginButton: {
    borderWidth: 1,
    borderColor: '#7c6aef',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#7c6aef',
    fontWeight: '500',
  },
})
