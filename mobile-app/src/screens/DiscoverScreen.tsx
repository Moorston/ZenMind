import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, TextInput,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useCoursesStore } from '@/store/useCoursesStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { whiteNoises, getNoiseEmoji } from '@/store/constants'
import type { MeditationCourse } from '@/store/types'
import { styles } from './DiscoverScreen.styles'

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'beginner', label: '初级' },
  { id: 'sleep', label: '睡眠' },
  { id: 'relax', label: '放松' },
  { id: 'focus', label: '专注' },
]

export function DiscoverScreen() {
  const navigation = useNavigation<any>()
  const { courses, initialized, initialize } = useCoursesStore()
  const { reset } = usePlayerStore()

  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  const meditationCourses: MeditationCourse[] = useMemo(
    () => courses.map(toMeditationCourse),
    [courses]
  )

  const filteredCourses = useMemo(() => {
    return meditationCourses.filter(c => {
      const matchCategory = activeCategory === 'all' || c.category === activeCategory
      const matchSearch = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [meditationCourses, activeCategory, searchQuery])

  const handleCoursePress = (course: MeditationCourse) => {
    reset().then(() => {
      navigation.navigate('Player', { courseId: course.id })
    })
  }

  const handleNoisePress = (noiseId: string) => {
    reset().then(() => {
      navigation.navigate('Player', { noiseId })
    })
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索冥想课程..."
          placeholderTextColor="#9090a0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              activeCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === cat.id && styles.categoryChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* White noise section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>白噪音</Text>
          <Text style={styles.sectionSubtitle}>选择环境音伴你冥想</Text>
          <View style={styles.noiseGrid}>
            {whiteNoises.map(noise => (
              <TouchableOpacity
                key={noise.id}
                style={[styles.noiseCard, { backgroundColor: noise.color + '30' }]}
                onPress={() => handleNoisePress(noise.id)}
              >
                <Text style={styles.noiseEmoji}>{getNoiseEmoji(noise.id)}</Text>
                <Text style={styles.noiseName}>{noise.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Course list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>全部课程</Text>
            <Text style={styles.courseCount}>{filteredCourses.length}个课程</Text>
          </View>

          {filteredCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧘</Text>
              <Text style={styles.emptyText}>没有找到相关课程</Text>
            </View>
          ) : (
            <View style={styles.courseList}>
              {filteredCourses.map(course => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => handleCoursePress(course)}
                >
                  <Image
                    source={{ uri: course.coverUrl }}
                    style={styles.courseImage}
                    resizeMode="cover"
                  />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle} numberOfLines={2}>
                      {course.title}
                    </Text>
                    <Text style={styles.courseDesc} numberOfLines={2}>
                      {course.description}
                    </Text>
                    <View style={styles.courseMeta}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>⏱ {course.duration}分钟</Text>
                      </View>
                      <View style={[styles.badge, styles.badgeSecondary]}>
                        <Text style={styles.badgeTextSecondary}>
                          {getCategoryLabel(course.category)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    beginner: '入门',
    sleep: '睡眠',
    relax: '放松',
    focus: '专注',
  }
  return labels[cat] || cat
}

function toMeditationCourse(c: any): MeditationCourse {
  return {
    id: c.id,
    title: c.title || '',
    description: c.description || '',
    category: (c.category === 'breathing' ? 'beginner'
      : c.category === 'body-scan' ? 'sleep'
      : c.category === 'visualization' ? 'focus'
      : c.category === 'loving-kindness' ? 'relax'
      : c.category || 'beginner') as any,
    duration: c.duration || 0,
    coverUrl: c.coverUrl || '',
    audioUrl: c.audioUrl || '',
    tags: (() => {
      if (typeof c.tags === 'string') {
        try { return JSON.parse(c.tags) } catch { return [] }
      }
      return c.tags || []
    })(),
    instructor: c.instructor?.name || '静心',
  }
}
