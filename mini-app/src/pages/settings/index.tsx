import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft, Bell, Moon, Volume2,
  Palette, Globe, Info, LogOut,
  ChevronRight, Check
} from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { useUserStore } from '@/store/meditation'
import { useLanguageStore, LANGUAGE_LIST, type LanguageCode } from '@/store/language'

function usePersistedState<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = Taro.getStorageSync(key)
      return stored !== '' ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setPersistedState = (val: T) => {
    setState(val)
    Taro.setStorage({ key, data: JSON.stringify(val) })
  }

  return [state, setPersistedState]
}

export default function Settings() {
  const { t } = useTranslation()
  const { userName, setUserName, isDarkMode, setIsDarkMode } = useUserStore()
  const { language, setLanguage } = useLanguageStore()
  const [notifications, setNotifications] = usePersistedState('setting_notifications', true)
  const [soundEffects, setSoundEffects] = usePersistedState('setting_sound_effects', true)
  const [autoPlay, setAutoPlay] = usePersistedState('setting_auto_play', false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [tempName, setTempName] = useState('')

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleEditName = () => {
    setTempName(userName)
    setShowNameInput(true)
  }

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim())
      Taro.showToast({ title: t('settings.name.saveSuccess'), icon: 'success' })
    }
    setShowNameInput(false)
  }

  const handleCancelName = () => {
    setShowNameInput(false)
    setTempName('')
  }

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code)
    setShowLanguagePicker(false)
  }

  const handleLogout = () => {
    Taro.showModal({
      title: t('settings.logout.title'),
      content: t('settings.logout.content'),
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorage()
          Taro.showToast({ title: t('settings.logout.success'), icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1000)
        }
      }
    })
  }

  return (
    <View className="min-h-screen bg-background px-4 pb-8">
      <View className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground">
          <ChevronLeft size={24} color="#9090a0" />
        </Button>
        <Text className="text-xl font-semibold text-foreground">{t('settings.title')}</Text>
      </View>

      <Card className="bg-card border-0 mb-4">
        <CardContent className="p-0">
          <View className="flex items-center justify-between p-4" onClick={handleEditName}>
            <View className="flex items-center gap-4">
              <View className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <Text className="block text-2xl">🧘</Text>
              </View>
              <View>
                <Text className="block text-foreground font-medium">{userName}</Text>
                <Text className="block text-sm text-muted-foreground">{t('settings.name.editHint')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9090a0" />
          </View>
        </CardContent>
      </Card>

      {showNameInput && (
        <Card className="bg-card border-0 mb-4">
          <CardContent className="p-4">
            <Text className="block text-foreground mb-2">{t('settings.name.inputTitle')}</Text>
            <View className="bg-muted rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-foreground"
                placeholder={t('settings.name.placeholder')}
                value={tempName}
                onInput={(e) => setTempName(e.detail.value)}
                maxlength={20}
              />
            </View>
            <View className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelName}
              >
                  <Text>{t('settings.button.cancel')}</Text>
              </Button>
              <Button
                className="flex-1 bg-primary text-white"
                onClick={handleSaveName}
              >
                <Text>{t('settings.button.save')}</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('settings.section.notifications')}</Text>
      <Card className="bg-card border-0 mb-4">
        <CardContent className="p-0 divide-y divide-border">
          <View className="flex items-center justify-between p-4">
            <View className="flex items-center gap-3">
              <Bell size={20} color="#7c6aef" />
              <Text className="block text-foreground">{t('settings.notifications.label')}</Text>
            </View>
            <Switch
              checked={notifications}
              onCheckedChange={(checked) => setNotifications(checked)}
            />
          </View>
          <View
            className="flex items-center justify-between p-4"
            onClick={() => Taro.navigateTo({ url: '/pages/reminder/index' })}
          >
            <View className="flex items-center gap-3">
              <Moon size={20} color="#6366f1" />
              <View>
                <Text className="block text-foreground">{t('settings.reminderTime.label')}</Text>
                <Text className="block text-xs text-muted-foreground">{t('settings.reminderTime.value')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9090a0" />
          </View>
        </CardContent>
      </Card>

      <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('settings.section.playback')}</Text>
      <Card className="bg-card border-0 mb-4">
        <CardContent className="p-0 divide-y divide-border">
          <View className="flex items-center justify-between p-4">
            <View className="flex items-center gap-3">
              <Volume2 size={20} color="#2dd4bf" />
              <Text className="block text-foreground">{t('settings.playback.soundEffects')}</Text>
            </View>
            <Switch
              checked={soundEffects}
              onCheckedChange={(checked) => setSoundEffects(checked)}
            />
          </View>
          <View className="flex items-center justify-between p-4">
            <View className="flex items-center gap-3">
              <Moon size={20} color="#6366f1" />
              <Text className="block text-foreground">{t('settings.playback.autoPlay')}</Text>
            </View>
            <Switch
              checked={autoPlay}
              onCheckedChange={(checked) => setAutoPlay(checked)}
            />
          </View>
        </CardContent>
      </Card>

      <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('settings.section.appearance')}</Text>
      <Card className="bg-card border-0 mb-4">
        <CardContent className="p-0 divide-y divide-border">
          <View className="flex items-center justify-between p-4">
            <View className="flex items-center gap-3">
              <Palette size={20} color="#f59e0b" />
              <Text className="block text-foreground">{t('settings.appearance.darkMode')}</Text>
            </View>
            <Switch
              checked={isDarkMode}
              onCheckedChange={(checked) => setIsDarkMode(checked)}
            />
          </View>
        </CardContent>
      </Card>

      <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('settings.section.other')}</Text>
      <Card className="bg-card border-0 mb-4">
        <CardContent className="p-0 divide-y divide-border">
          <View className="flex items-center justify-between p-4" onClick={() => setShowLanguagePicker(true)}>
            <View className="flex items-center gap-3">
              <Globe size={20} color="#9090a0" />
              <Text className="block text-foreground">{t('settings.other.language')}</Text>
            </View>
            <View className="flex items-center">
              <Text className="block text-muted-foreground mr-2">{LANGUAGE_LIST.find(l => l.code === language)?.name || t('settings.other.languageValue')}</Text>
              <ChevronRight size={20} color="#9090a0" />
            </View>
          </View>

          <View className="flex items-center justify-between p-4">
            <View className="flex items-center gap-3">
              <Info size={20} color="#9090a0" />
              <Text className="block text-foreground">{t('settings.other.about')}</Text>
            </View>
            <ChevronRight size={20} color="#9090a0" />
          </View>
          <View className="flex items-center justify-between p-4">
            <View className="flex items-center gap-3">
              <Info size={20} color="#9090a0" />
              <Text className="block text-foreground">{t('settings.other.version')}</Text>
            </View>
            <Text className="block text-muted-foreground">{t('settings.other.versionValue')}</Text>
          </View>
        </CardContent>
      </Card>

      <Sheet open={showLanguagePicker} onOpenChange={(open) => setShowLanguagePicker(open)}>
        <SheetContent side="bottom" style={{ maxHeight: '70vh' }} className="flex flex-col">
          <SheetHeader className="pb-4">
            <SheetTitle>{t('settings.language.title')}</SheetTitle>
          </SheetHeader>
          <View className="flex-1 overflow-y-auto">
            <RadioGroup value={language} onValueChange={(v) => handleSelectLanguage(v as LanguageCode)} className="gap-2">
              {LANGUAGE_LIST.map((lang) => (
                <View
                  key={lang.code}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    language === lang.code ? 'bg-primary-20' : 'bg-muted'
                  }`}
                >
                  <View className="flex items-center gap-2 flex-1" onClick={() => handleSelectLanguage(lang.code)}>
                    <RadioGroupItem value={lang.code} />
                    <View>
                      <Text className={`block text-foreground ${language === lang.code ? 'text-primary font-medium' : ''}`}>
                        {lang.name}
                      </Text>
                      <Text className="block text-xs text-muted-foreground">{lang.englishName}</Text>
                    </View>
                  </View>
                  {language === lang.code && (
                    <Check size={16} color="#7c6aef" />
                  )}
                </View>
              ))}
            </RadioGroup>
          </View>
          <SheetClose className="w-full mt-3">
            <Button variant="outline" className="w-full">
              <Text>{t('common.close')}</Text>
            </Button>
          </SheetClose>
        </SheetContent>
      </Sheet>

      <Button
        variant="destructive"
        className="w-full mt-8 bg-destructive-20 text-destructive"
        onClick={handleLogout}
      >
        <LogOut size={18} color="#ef4444" />
        <Text>{t('settings.logout.button')}</Text>
      </Button>
    </View>
  )
}
