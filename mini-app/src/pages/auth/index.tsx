import { useState, useRef } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { Network } from '@/network'

const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

export default function AuthPage() {
  const { t } = useTranslation()
  const login = useAuthStore((s) => s.login)

  const [isRegister, setIsRegister] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(!isWeapp)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval>>()

  // 微信小程序一键登录
  const handleWechatLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      const { code: wxCode } = await Taro.login()

      const res = await Network.request<{
        status: string
        data?: { token: string; user: { id: string; nickname: string }; expiresAt?: string }
        message?: string
      }>({
        url: '/api/auth/wechat-login',
        method: 'POST',
        data: { code: wxCode },
      })

      if (res.data?.status === 'error' || !res.data?.data) {
        Taro.showToast({ title: res.data?.message || t('auth.wechatLoginFailed'), icon: 'none' })
        return
      }

      const { token, user, expiresAt } = res.data.data
      login(token, { id: user.id, nickname: user.nickname }, expiresAt)
      Taro.showToast({ title: t('auth.wechatLoginSuccess'), icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1000)
    } catch {
      Taro.showToast({ title: t('auth.wechatLoginFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const sendCode = async () => {
    if (countdown > 0 || !email) return
    try {
      await Network.request({
        url: '/api/auth/send-code',
        method: 'POST',
        data: { email },
      })
      Taro.showToast({ title: t('auth.codeSent'), icon: 'success' })
      setCountdown(60)
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch {
      Taro.showToast({ title: t('auth.sendCodeFailed'), icon: 'none' })
    }
  }

  const handleSubmit = async () => {
    if (isRegister && !nickname) {
      Taro.showToast({ title: t('auth.nicknameRequired'), icon: 'none' })
      return
    }
    if (!email) {
      Taro.showToast({ title: t('auth.accountRequired'), icon: 'none' })
      return
    }
    if (!password) {
      Taro.showToast({ title: t('auth.passwordRequired'), icon: 'none' })
      return
    }
    if (isRegister && !code) {
      Taro.showToast({ title: t('auth.codeRequired'), icon: 'none' })
      return
    }

    try {
      const url = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister
        ? { email, password, nickname, code }
        : { email, password }

      const res = await Network.request<{
        status: string
        data?: { token: string; user: { id: string; email: string; nickname: string }; expiresAt?: string }
        message?: string
      }>({ url, method: 'POST', data: body })

      if (res.data?.status === 'error' || !res.data?.data) {
        Taro.showToast({ title: res.data?.message || t('auth.requestFailed'), icon: 'none' })
        return
      }

      const { token, user, expiresAt } = res.data.data
      login(token, user, expiresAt)
      Taro.showToast({
        title: isRegister ? t('auth.registerSuccess') : t('auth.loginSuccess'),
        icon: 'success',
      })
      setTimeout(() => Taro.navigateBack(), 1000)
    } catch {
      Taro.showToast({ title: t('auth.requestFailed'), icon: 'none' })
    }
  }

  return (
    <ScrollView scrollY className="h-screen bg-background">
      <View className="pt-12 pb-8 px-6">
        <Text className="block text-3xl font-bold text-foreground text-center mb-2">
          {t('auth.welcome')}
        </Text>
        <Text className="block text-sm text-muted-foreground text-center">
          {t('auth.subtitle')}
        </Text>
      </View>

      <View className="px-4">
        {/* 微信一键登录（仅小程序环境显示） */}
        {isWeapp && !showEmailForm && (
          <View className="space-y-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWechatLogin}
              disabled={loading}
            >
              {loading ? '...' : t('auth.wechatLogin')}
            </Button>

            <View className="flex items-center gap-4 my-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted-foreground">{t('auth.or')}</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowEmailForm(true)}
            >
              {t('auth.otherLogin')}
            </Button>
          </View>
        )}

        {/* 邮箱登录/注册表单 */}
        {showEmailForm && (
          <>
            <Card className="bg-card border-0">
              <CardContent className="p-6 space-y-4">
                {isRegister && (
                  <View>
                    <Text className="block text-sm text-foreground mb-2">{t('auth.nickname')}</Text>
                    <Input
                      placeholder={t('auth.nicknamePlaceholder')}
                      value={nickname}
                      onInput={(e) => setNickname(e.detail.value)}
                      type="text"
                    />
                  </View>
                )}
                <View>
                  <Text className="block text-sm text-foreground mb-2">{t('auth.email')}</Text>
                  <Input
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onInput={(e) => setEmail(e.detail.value)}
                    type="text"
                  />
                </View>
                <View>
                  <Text className="block text-sm text-foreground mb-2">{t('auth.password')}</Text>
                  <Input
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onInput={(e) => setPassword(e.detail.value)}
                    password
                  />
                </View>
                {isRegister && (
                  <View>
                    <Text className="block text-sm text-foreground mb-2">{t('auth.verifyCode')}</Text>
                    <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Input
                          placeholder={t('auth.codePlaceholder')}
                          value={code}
                          onInput={(e) => setCode(e.detail.value)}
                          type="text"
                        />
                      </View>
                      <View style={{ flexShrink: 0 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={countdown > 0}
                          onClick={sendCode}
                        >
                          {countdown > 0 ? `${countdown}s` : t('auth.sendCode')}
                        </Button>
                      </View>
                    </View>
                  </View>
                )}
                <Button className="w-full" onClick={handleSubmit}>
                  {isRegister ? t('auth.register') : t('auth.login')}
                </Button>
              </CardContent>
            </Card>

            <View className="mt-6 text-center">
              <Text
                className="block text-sm text-primary"
                onClick={() => { setIsRegister(!isRegister); setPassword(''); setCode(''); setCountdown(0) }}
              >
                {isRegister ? t('auth.tab.login') : t('auth.tab.register')}
              </Text>
            </View>

            {isWeapp && (
              <View className="mt-4 text-center">
                <Text
                  className="block text-sm text-muted-foreground"
                  onClick={() => setShowEmailForm(false)}
                >
                  ← {t('auth.wechatLogin')}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  )
}
