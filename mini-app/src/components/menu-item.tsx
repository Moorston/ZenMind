import { View, Text } from '@tarojs/components'
import { ChevronRight } from 'lucide-react-taro'
import type { ReactNode } from 'react'

interface MenuItemProps {
  icon: ReactNode
  label: string
  subtitle?: string
  rightElement?: ReactNode
  badge?: ReactNode
  onClick?: () => void
  iconBgClass?: string
}

export function MenuItem({ icon, label, subtitle, rightElement, badge, onClick, iconBgClass = 'bg-primary-20' }: MenuItemProps) {
  return (
    <View
      onClick={onClick}
      className="flex items-center p-4"
    >
      <View className={`w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center mr-3`}>
        {icon}
      </View>
      <View className="flex-1 min-w-0">
        <Text className="block text-foreground">{label}</Text>
        {subtitle && <Text className="block text-xs text-muted-foreground">{subtitle}</Text>}
      </View>
      {badge && <View className="mr-2">{badge}</View>}
      {rightElement || <ChevronRight size={20} color="#9090a0" />}
    </View>
  )
}
