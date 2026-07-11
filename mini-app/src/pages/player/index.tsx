import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from '@tarojs/components'
import { SafeImage } from '@/components/ui/safe-image'
import Taro from '@tarojs/taro'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Clock, X, Users
} from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { useAudioPlayer } from '@/lib/hooks/use-audio-player'
import { useRoom } from '@/hooks/useRoom'
import { useAuthStore } from '@/store/auth'
import {
  getNoiseEmoji, getNoiseColor
} from '@/store/meditation'

function SleepTimer({
  timerValue, setTimerValue, onStart, onClose,
}: {
  timerValue: number
  setTimerValue: (v: number) => void
  onStart: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <View className="mx-4 mb-4 bg-card rounded-2xl p-4">
      <View className="flex justify-between items-center mb-3">
        <Text className="block text-foreground text-sm font-semibold">{t('player.sleepTimer.title')}</Text>
        <View onClick={onClose}><X size={16} color="#9090a0" /></View>
      </View>
      <View className="flex items-center gap-4">
        <Slider
          className="flex-1"
          min={5}
          max={60}
          step={5}
          value={[timerValue]}
          onValueChange={(value) => setTimerValue(value[0])}
        />
        <Text className="block text-primary w-12 text-center">{t('player.sleepTimer.minutes', { value: timerValue })}</Text>
      </View>
      <View className="flex gap-2 mt-3">
        {[15, 30, 45, 60].map(m => (
          <View
            key={m}
            onClick={() => setTimerValue(m)}
            className={`px-3 py-2 rounded-full text-xs ${
              timerValue === m
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Text className="block text-xs">{t('player.sleepTimer.minuteOption', { m })}</Text>
          </View>
        ))}
      </View>
      <Button
        className="w-full mt-3 bg-primary text-white"
        onClick={onStart}
      >
        <Text className="block">{t('player.sleepTimer.confirm')}</Text>
      </Button>
    </View>
  )
}

export default function Player() {
  const { t } = useTranslation()
  const {
    currentCourse, isPlaying, currentTime, duration,
    volume, isLooping, whiteNoise, sleepTimer,
    isLoading, hasError, courseNotFound,
    togglePlay, skip, changeVolume, toggleMute, toggleLoop,
    setSleepTimerMinutes, formatTime, handleReset,
  } = useAudioPlayer()

  const [showTimer, setShowTimer] = useState(false)
  const [timerValue, setTimerValue] = useState(15)
  const params = Taro.getCurrentInstance()?.router?.params || {}
  const roomId = params.roomId as string | undefined
  const { user } = useAuthStore()
  const room = useRoom(roomId || null)

  // Connect to room if roomId is present
  useEffect(() => {
    if (roomId && user?.id) {
      room.connect(user.id)
    }
    return () => { room.disconnect() }
  }, [roomId, user?.id])

  // Sync playback to room when play state changes
  useEffect(() => {
    if (roomId) {
      room.sendPlaybackSync(currentTime, isPlaying)
    }
  }, [isPlaying, currentTime])

  const handleClose = () => {
    handleReset()
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/discover/index' })
    }
  }

  const handleSeek = (value: number) => {
    skip(value - currentTime)
  }

  const courseDescription = currentCourse?.description || (whiteNoise ? t('player.subtitle.whiteNoise', { name: whiteNoise.name }) : t('player.subtitle.selectMusic'))

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <View className="flex items-center justify-between px-4 pt-4 pb-2">
        <View
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          onClick={handleClose}
          hoverClass="opacity-80"
        >
          <X size={24} color="#9090a0" />
        </View>
        <Text className="block text-muted-foreground text-sm">
          {whiteNoise ? t('player.header.whiteNoise') : t('player.header.meditationCourse')}
        </Text>
        {roomId ? (
          <View className="flex items-center gap-1">
            <Users size={16} color="#7c6aef" />
            <Text className="block text-xs text-primary">{room.participants.length + 1}</Text>
          </View>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTimer(!showTimer)}
            className="text-muted-foreground"
          >
            <Clock size={24} color="#9090a0" />
          </Button>
        )}
      </View>

      {/* Sleep Timer Panel */}
      {showTimer && (
        <SleepTimer
          timerValue={timerValue}
          setTimerValue={setTimerValue}
          onStart={() => {
            setSleepTimerMinutes(timerValue)
            setShowTimer(false)
          }}
          onClose={() => setShowTimer(false)}
        />
      )}

      {/* Cover / Visual */}
      <View className="flex-1 flex flex-col items-center justify-center px-8">
        {isLoading && !currentCourse ? (
          <View className="mb-8">
            <Skeleton className="w-64 h-64 rounded-full" />
          </View>
        ) : courseNotFound ? (
          <View className="mb-8 flex flex-col items-center">
            <Text className="block text-6xl">📭</Text>
            <Text className="block text-base text-foreground text-center mt-4 font-medium">课程已下架</Text>
            <Text className="block text-sm text-muted-foreground text-center mt-2">该课程已不再可用，请浏览其他课程</Text>
            <Button
              className="mt-6 bg-primary text-white px-6"
              onClick={() => Taro.switchTab({ url: '/pages/discover/index' })}
            >
              <Text className="block">浏览课程</Text>
            </Button>
          </View>
        ) : hasError ? (
          <View className="mb-8">
            <Text className="block text-6xl">⚠️</Text>
            <Text className="block text-sm text-muted-foreground text-center mt-4">Load failed</Text>
          </View>
        ) : currentCourse ? (
          <View className="relative mb-8">
            <View className="w-64 h-64 rounded-full overflow-hidden shadow-lg shadow-primary">
              <SafeImage
                src={currentCourse.coverUrl}
                className="w-full h-full"
                mode="aspectFill"
              />
            </View>
            {isLoading && (
              <View className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
                <Text className="block text-white text-sm">Loading...</Text>
              </View>
            )}
            <View className="absolute inset-0 rounded-full border-2 border-primary-50 animate-pulse -m-2" />
          </View>
        ) : whiteNoise ? (
          <View className="relative mb-8">
            <View
              className="w-64 h-64 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${getNoiseColor(whiteNoise.id)}30` }}
            >
              <Text className="block text-8xl">{getNoiseEmoji(whiteNoise.id)}</Text>
            </View>
            <View className="absolute inset-0 rounded-full border-2 border-secondary-30 animate-pulse -m-2" />
          </View>
        ) : (
          <View className="mb-8">
            <Text className="block text-6xl">🎵</Text>
          </View>
        )}

        <Text className="block text-2xl font-semibold text-foreground text-center mb-2">
          {currentCourse?.title || whiteNoise?.name || t('player.title.selectMusic')}
        </Text>
        <Text className="block text-sm text-muted-foreground text-center">
          {courseDescription}
        </Text>

        {/* Progress Slider */}
        {currentCourse && (
          <View className="w-full mt-8">
            <Slider
              className="w-full"
              min={0}
              max={duration}
              value={[currentTime]}
              onValueChange={(value) => handleSeek(value[0])}
            />
            <View className="flex justify-between mt-2">
              <Text className="block text-xs text-muted-foreground">{formatTime(currentTime)}</Text>
              <Text className="block text-xs text-muted-foreground">{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Controls */}
      <View className="px-8 pb-12">
        <View className="flex items-center gap-3 mb-6">
          <View onClick={toggleMute} className="flex items-center">
            {volume === 0 ? <VolumeX size={20} color="#9090a0" /> : <Volume2 size={20} color="#9090a0" />}
          </View>
          <Slider
            className="flex-1"
            min={0}
            max={100}
            step={1}
            value={[volume * 100]}
            onValueChange={(value) => changeVolume(value[0] / 100)}
          />
        </View>

        <View className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(-15)}
            className="text-muted-foreground"
          >
            <SkipBack size={28} color="#9090a0" />
          </Button>

          <View
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-primary-40 flex items-center justify-center shadow-lg shadow-primary"
          >
            {isPlaying ? (
              <Pause size={36} color="#fff" />
            ) : (
              <Play size={36} color="#fff" className="ml-1" />
            )}
          </View>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(15)}
            className="text-muted-foreground"
          >
            <SkipForward size={28} color="#9090a0" />
          </Button>
        </View>

        <View className="flex items-center justify-center mt-6 gap-4">
          <Button
            variant="ghost"
            onClick={toggleLoop}
            className={`${isLooping ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Repeat size={20} color={isLooping ? '#7c6aef' : '#9090a0'} />
            <Text className="block text-xs ml-1">{t('player.loop')}</Text>
          </Button>

          {sleepTimer > 0 && (
            <View className="flex items-center text-primary text-xs">
              <Clock size={14} color="#7c6aef" />
              <Text className="block ml-1">{t('player.sleepTimer.active', { sleepTimer })}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
