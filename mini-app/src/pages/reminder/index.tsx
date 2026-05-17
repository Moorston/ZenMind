import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChevronLeft, Bell, Moon, Sun, Clock } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const timeSlots = [
  { id: 'morning', time: '07:00', icon: Sun, color: '#f59e0b' },
  { id: 'noon', time: '12:00', icon: Sun, color: '#fbbf24' },
  { id: 'afternoon', time: '15:00', icon: Sun, color: '#f97316' },
  { id: 'evening', time: '18:00', icon: Moon, color: '#6366f1' },
  { id: 'night', time: '22:00', icon: Moon, color: '#8b5cf6' },
]

const presetTimes = [
  '06:00', '06:30', '07:00', '07:30', '08:00',
  '12:00', '14:00', '18:00', '20:00', '21:00', '22:00', '23:00'
]

export default function Reminder() {
  const [selectedSlot, setSelectedSlot] = useState('night')
  const [customTime, setCustomTime] = useState('22:00')
  const [isEnabled, setIsEnabled] = useState(true)
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [tempTime, setTempTime] = useState('')
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current)
      }
    }
  }, [])

  const handleBack = () => {
    if (navigateTimerRef.current) {
      clearTimeout(navigateTimerRef.current)
    }
    Taro.navigateBack()
  }

  const handleSave = () => {
    const reminderTime = selectedSlot === 'custom' ? customTime : (timeSlots.find(s => s.id === selectedSlot)?.time || customTime)

    if (isEnabled) {
      Taro.setStorage({
        key: 'reminder_enabled',
        data: true,
      })
      Taro.setStorage({
        key: 'reminder_time',
        data: reminderTime,
      })
    } else {
      Taro.setStorage({
        key: 'reminder_enabled',
        data: false,
      })
    }

    Taro.showToast({
      title: isEnabled ? t('reminder.save.enabled', { time: reminderTime }) : t('reminder.save.disabled'),
      icon: 'success',
    })
    navigateTimerRef.current = setTimeout(() => Taro.navigateBack(), 1000)
  }

  const handleCustomTime = () => {
    setTempTime(customTime)
    setShowTimeInput(true)
  }

  const handleSaveTime = () => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (timeRegex.test(tempTime)) {
      setCustomTime(tempTime)
      setSelectedSlot('custom')
      setShowTimeInput(false)
    } else {
      Taro.showToast({ title: t('reminder.error.timeFormat'), icon: 'none' })
    }
  }

  const currentSlot = timeSlots.find(s => s.id === selectedSlot)
  const displayTime = selectedSlot === 'custom' ? customTime : (currentSlot?.time || customTime)

  return (
    <View className="min-h-screen bg-background px-4 pb-8">
      <View className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground">
          <ChevronLeft size={24} color="#9090a0" />
        </Button>
        <Text className="text-xl font-semibold text-foreground">{t('reminder.title')}</Text>
      </View>

      <Card className={`border-0 mb-4 ${isEnabled ? 'bg-muted' : 'bg-card'}`}>
        <CardContent className="p-4">
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-primary-20 flex items-center justify-center">
                <Bell size={24} color="#7c6aef" />
              </View>
              <View>
                <Text className="block text-foreground font-medium">{t('reminder.switch.title')}</Text>
                <Text className="block text-sm text-muted-foreground">{t('reminder.switch.subtitle')}</Text>
              </View>
            </View>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => setIsEnabled(checked)}
            />
          </View>
        </CardContent>
      </Card>

      {isEnabled && (
        <>
          <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('reminder.section.slots')}</Text>
          <View className="grid grid-cols-2 gap-3 mb-4">
            {timeSlots.map(slot => {
              const SlotIcon = slot.icon
              const isSelected = selectedSlot === slot.id
              return (
                <View
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-10'
                      : 'border-muted bg-card'
                  }`}
                >
                  <View className="flex items-center gap-2 mb-2">
                    <SlotIcon size={18} color={isSelected ? '#7c6aef' : slot.color} />
                    <Text className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {t(`reminder.slot.${slot.id}.label`)}
                    </Text>
                  </View>
                  <Text className="block text-2xl font-bold text-foreground mb-1">{slot.time}</Text>
                  <Text className="block text-xs text-muted-foreground">{t(`reminder.slot.${slot.id}.desc`)}</Text>
                </View>
              )
            })}
          </View>

          <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('reminder.section.customTime')}</Text>
          <Card className="bg-card border-0 mb-4">
            <CardContent className="p-4">
              <View className="flex items-center gap-4">
                <Clock size={20} color="#9090a0" />
                <Text className="block text-foreground">{t('reminder.customTime.pick')}</Text>
                <View className="flex-1" />
                <View
                  className="px-3 py-1 rounded-lg bg-primary-20"
                  onClick={handleCustomTime}
                >
                  <Text className="block text-primary">{customTime}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {showTimeInput && (
            <Card className="bg-card border-0 mb-4">
              <CardContent className="p-4">
                <Text className="block text-foreground mb-2">{t('reminder.customTime.inputTitle')}</Text>
                <View className="bg-muted rounded-xl px-4 py-3 mb-3">
                  <Input
                    className="w-full bg-transparent text-foreground"
                    placeholder={t('reminder.customTime.placeholder')}
                    value={tempTime}
                    onInput={(e) => setTempTime(e.detail.value)}
                    maxlength={5}
                  />
                </View>
                <View className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowTimeInput(false)}
                  >
                    <Text>{t('reminder.button.cancel')}</Text>
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-white"
                    onClick={handleSaveTime}
                  >
                    <Text>{t('reminder.button.confirm')}</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          <Text className="block text-sm text-muted-foreground px-2 mb-2">{t('reminder.section.quickSelect')}</Text>
          <View className="flex flex-wrap gap-2 mb-4">
            {presetTimes.map(time => (
              <View
                key={time}
                onClick={() => {
                  setCustomTime(time)
                  setSelectedSlot('custom')
                }}
                className={`px-3 py-2 rounded-full text-sm transition-all ${
                  customTime === time
                    ? 'bg-primary text-white'
                    : 'bg-card text-muted-foreground'
                }`}
              >
                <Text className="block">{time}</Text>
              </View>
            ))}
          </View>

          <Card className="bg-card border-0 mb-4">
            <CardContent className="p-4">
              <Text className="block text-muted-foreground text-sm mb-2">{t('reminder.section.messageTemplates')}</Text>
              <View className="flex flex-wrap gap-2">
                <Badge className="bg-primary-20 text-primary">
                  {t('reminder.message.template1')}
                </Badge>
                <Badge className="bg-card text-muted-foreground">
                  {t('reminder.message.template2')}
                </Badge>
                <Badge className="bg-card text-muted-foreground">
                  {t('reminder.message.template3')}
                </Badge>
              </View>
            </CardContent>
          </Card>
        </>
      )}

      <Button
        className={`w-full mt-4 ${isEnabled ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
        onClick={handleSave}
      >
        <Text>{isEnabled ? t('reminder.save.buttonEnabled', { time: displayTime }) : t('reminder.save.buttonDisabled')}</Text>
      </Button>
    </View>
  )
}
