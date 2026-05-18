import { View, Text } from '@tarojs/components'
import { getNoiseEmoji, type WhiteNoise } from '@/store/meditation'
import { useTranslation } from 'react-i18next'

interface WhiteNoiseGridProps {
  whiteNoises: WhiteNoise[]
  onSelect: (noise: WhiteNoise) => void
}

export function WhiteNoiseGrid({ whiteNoises, onSelect }: WhiteNoiseGridProps) {
  const { t } = useTranslation()

  return (
    <View className="grid grid-cols-4 gap-3">
      {whiteNoises.map(noise => (
        <View
          key={noise.id}
          onClick={() => onSelect(noise)}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl"
          style={{ backgroundColor: `${noise.color}15` }}
        >
          <View
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: noise.color + '30' }}
          >
            <Text className="block text-xl">{getNoiseEmoji(noise.id)}</Text>
          </View>
          <Text className="block text-xs text-foreground">{t('whitenoise.' + noise.id, noise.name)}</Text>
        </View>
      ))}
    </View>
  )
}
