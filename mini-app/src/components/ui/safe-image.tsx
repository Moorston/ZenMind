import { useState } from 'react'
import { View, Image } from '@tarojs/components'

interface SafeImageProps {
  src?: string
  className?: string
  mode?: 'aspectFill' | 'aspectFit' | 'scaleToFill' | 'widthFix' | 'heightFix'
  fallback?: React.ReactNode
}

const DEFAULT_FALLBACK = (
  <View className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
    <View className="text-4xl">🧘</View>
  </View>
)

export function SafeImage({ src, className = '', mode = 'aspectFill', fallback }: SafeImageProps) {
  const [hasError, setHasError] = useState(!src)

  if (hasError || !src) {
    return (
      <View className={className}>
        {fallback || DEFAULT_FALLBACK}
      </View>
    )
  }

  return (
    <Image
      src={src}
      className={className}
      mode={mode}
      onError={() => setHasError(true)}
    />
  )
}
