import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'

export default function AuthPage() {
  const { t } = useTranslation()
  const login = useAuthStore((s) => s.login)

  const [tab, setTab] = useState('login')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [countdown, setCountdown] = useState(0)

  const isRegister = tab === 'register'
  const useEmail = tab === 'login_email'

  const sendCode = () => {
    if (countdown > 0) return
    const target = useEmail ? email : phone
    if (!target) return
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
    // Network.request({ url: '/api/auth/send-code', method: 'POST', data: { phone, email } })
    Taro.showToast({ title: t('auth.codeSent'), icon: 'success' })
  }

  const handleLogin = () => {
    if (isRegister && !nickname) {
      Taro.showToast({ title: t('auth.nicknameRequired'), icon: 'none' })
      return
    }
    if (!phone && !email) {
      Taro.showToast({ title: t('auth.accountRequired'), icon: 'none' })
      return
    }
    if (!password) {
      Taro.showToast({ title: t('auth.passwordRequired'), icon: 'none' })
      return
    }
    login('mock-token-' + Date.now(), {
      id: 'user_' + Date.now(),
      nickname: isRegister && nickname ? nickname : phone || email,
      phone: phone || undefined,
      email: email || undefined,
    })
    Taro.showToast({ title: isRegister ? t('auth.registerSuccess') : t('auth.loginSuccess'), icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1000)
  }

  const handleWechatLogin = () => {
    Taro.showToast({ title: t('auth.wechatLogin'), icon: 'none' })
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
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setCountdown(0) }}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="login" className="flex-1">{t('auth.tab.login')}</TabsTrigger>
            <TabsTrigger value="login_email" className="flex-1">{t('auth.tab.email')}</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">{t('auth.tab.register')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-card border-0">
              <CardContent className="p-6 space-y-4">
                <View>
                  <Text className="block text-sm text-foreground mb-2">{t('auth.phone')}</Text>
                  <Input
                    placeholder={t('auth.phonePlaceholder')}
                    value={phone}
                    onInput={(e) => setPhone(e.detail.value)}
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
                <Button className="w-full" onClick={handleLogin}>{t('auth.login')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login_email">
            <Card className="bg-card border-0">
              <CardContent className="p-6 space-y-4">
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
                <Button className="w-full" onClick={handleLogin}>{t('auth.login')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-card border-0">
              <CardContent className="p-6 space-y-4">
                <View>
                  <Text className="block text-sm text-foreground mb-2">{t('auth.nickname')}</Text>
                  <Input
                    placeholder={t('auth.nicknamePlaceholder')}
                    value={nickname}
                    onInput={(e) => setNickname(e.detail.value)}
                    type="text"
                  />
                </View>
                <View>
                  <Text className="block text-sm text-foreground mb-2">{t('auth.phone')}</Text>
                  <Input
                    placeholder={t('auth.phonePlaceholder')}
                    value={phone}
                    onInput={(e) => setPhone(e.detail.value)}
                    type="text"
                  />
                </View>
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
                <View>
                  <Text className="block text-sm text-foreground mb-2">{t('auth.password')}</Text>
                  <Input
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onInput={(e) => setPassword(e.detail.value)}
                    password
                  />
                </View>
                <Button className="w-full" onClick={handleLogin}>{t('auth.register')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <View className="mt-6 mb-4">
          <View className="flex items-center mb-4">
            <View className="flex-1 h-px bg-border" />
            <Text className="block mx-3 text-xs text-muted-foreground">{t('auth.thirdParty')}</Text>
            <View className="flex-1 h-px bg-border" />
          </View>
          <Button variant="outline" className="w-full" onClick={handleWechatLogin}>
            <Text className="block">{t('auth.wechatLoginBtn')}</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}
