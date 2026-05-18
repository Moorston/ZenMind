import { View, Text } from '@tarojs/components'
import { Check } from 'lucide-react-taro'
import type { ReactNode } from 'react'

interface SelectableCardProps {
  selected: boolean
  onSelect: () => void
  children: ReactNode
  className?: string
}

export function SelectableCard({ selected, onSelect, children, className = '' }: SelectableCardProps) {
  return (
    <View
      onClick={onSelect}
      className={`p-4 rounded-2xl border-2 transition-all ${
        selected
          ? 'border-primary bg-primary-10'
          : 'border-muted bg-card'
      } ${className}`}
    >
      <View className="flex items-center gap-4">
        {children}
        {selected && (
          <View className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Check size={14} color="#fff" />
          </View>
        )}
      </View>
    </View>
  )
}

interface SelectableCardIconProps {
  color: string
  children: ReactNode
}

export function SelectableCardIcon({ color, children }: SelectableCardIconProps) {
  return (
    <View
      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}20` }}
    >
      {children}
    </View>
  )
}

interface SelectableCardTextProps {
  label: string
  desc?: string
}

export function SelectableCardText({ label, desc }: SelectableCardTextProps) {
  return (
    <View className="flex-1 min-w-0">
      <Text className="block text-lg font-medium text-foreground">{label}</Text>
      {desc && <Text className="block text-sm text-muted-foreground">{desc}</Text>}
    </View>
  )
}
