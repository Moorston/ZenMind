import { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Dimensions,
  FlatList, TouchableOpacity, NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/useAuthStore'

type Nav = NativeStackNavigationProp<RootStackParamList>

const { width } = Dimensions.get('window')

const slides = [
  {
    id: '1',
    icon: '🧘',
    title: '静心冥想',
    subtitle: '在喧嚣的世界中\n找到内心的平静',
  },
  {
    id: '2',
    icon: '🌙',
    title: '助眠放松',
    subtitle: '科学的冥想引导\n帮助你快速入眠',
  },
  {
    id: '3',
    icon: '📊',
    title: '追踪进度',
    subtitle: '记录每一次冥想\n见证内心的成长',
  },
]

export function WelcomeScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const setHasSeenWelcome = useAuthStore((s) => s.setHasSeenWelcome)

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      setHasSeenWelcome()
      navigation.replace('Login')
    }
  }

  const handleSkip = () => {
    setHasSeenWelcome()
    navigation.replace('Login')
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>跳过</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? '开始' : '下一步'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#9090a0',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9090a0',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a2a4a',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#7c6aef',
    borderRadius: 4,
  },
  nextButton: {
    width: '100%',
    backgroundColor: '#7c6aef',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
})
