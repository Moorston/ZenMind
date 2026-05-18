import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, ScrollView } from '@tarojs/components'
import { SafeImage } from '@/components/ui/safe-image'
import Taro from '@tarojs/taro'
import { Search, Moon, Brain, Smile, Sparkles, Clock } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { WhiteNoiseGrid } from '@/components/white-noise-grid'
import { meditationCourses, whiteNoises, type MeditationCourse, type WhiteNoise } from '@/store/meditation'

const categories = [
  { id: 'all', icon: Sparkles },
  { id: 'beginner', icon: Sparkles },
  { id: 'sleep', icon: Moon },
  { id: 'relax', icon: Smile },
  { id: 'focus', icon: Brain }
]

export default function Discover() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getCategoryName = (category: string) => t('common.category.' + category, category)

  const filteredCourses = meditationCourses.filter(course => {
    const matchCategory = activeCategory === 'all' || course.category === activeCategory
    const matchSearch = !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleCourseClick = (course: MeditationCourse) => {
    Taro.navigateTo({
      url: `/pages/player/index?courseId=${course.id}`
    })
  }

  const handleWhiteNoiseClick = (noise: WhiteNoise) => {
    Taro.navigateTo({
      url: `/pages/player/index?noiseId=${noise.id}`
    })
  }

  return (
    <View className="flex flex-col h-screen bg-background overflow-hidden">
      <View className="px-4 pt-4 pb-2">
        <View className="bg-card rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search size={20} color="#9090a0" />
          <Input
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
            placeholder={t('discover.search.placeholder')}
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
          />
        </View>
      </View>

      <View className="px-4 py-2">
        <ScrollView scrollX className="whitespace-nowrap">
          <View className="flex gap-2">
            {categories.map(cat => (
              <View
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-card text-muted-foreground'
                }`}
              >
                <Text className="block">{t('discover.category.' + cat.id)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView scrollY className="flex-1 px-4 pb-8">
        <View className="mb-6">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-lg font-semibold text-foreground">{t('discover.whiteNoise.title')}</Text>
            <Text className="block text-sm text-muted-foreground">{t('discover.whiteNoise.subtitle')}</Text>
          </View>
          <WhiteNoiseGrid whiteNoises={whiteNoises} onSelect={(noise) => handleWhiteNoiseClick(noise)} />
        </View>

        <View>
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-lg font-semibold text-foreground">{t('discover.courses.title')}</Text>
            <Text className="block text-sm text-muted-foreground">{t('discover.courses.count', { count: filteredCourses.length })}</Text>
          </View>

          {filteredCourses.length === 0 ? (
            <View className="py-12 flex flex-col items-center">
              <Text className="block text-4xl mb-4">🧘</Text>
              <Text className="block text-muted-foreground">{t('discover.courses.empty')}</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-4">
              {filteredCourses.map(course => (
                <View
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                >
                  <Card className="bg-card border-0 overflow-hidden">
                    <View className="flex">
                      <SafeImage
                        src={course.coverUrl}
                        className="w-28 h-28"
                        mode="aspectFill"
                      />
                      <CardContent className="flex-1 p-3 flex flex-col justify-between">
                        <View>
                          <Text className="block text-base font-medium text-foreground mb-1">
                            {course.title}
                          </Text>
                          <Text className="block text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </Text>
                        </View>
                        <View className="flex items-center gap-2 mt-2">
                          <Badge className="bg-primary-20 text-primary text-xs">
                            <Clock size={12} className="mr-1" color="#7c6aef" />
                            {t('common.duration', { duration: course.duration })}
                          </Badge>
                          <Badge className="bg-secondary-20 text-secondary text-xs">
                            {getCategoryName(course.category)}
                          </Badge>
                        </View>
                      </CardContent>
                    </View>
                  </Card>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
