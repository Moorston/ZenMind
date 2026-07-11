import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { useUserStore } from '@/store/useUserStore'

type Nav = NativeStackNavigationProp<RootStackParamList>

const QUESTIONS = [
  {
    id: 'preference',
    question: '你希望通过冥想改善什么？',
    options: [
      { id: 'sleep', label: '改善睡眠', icon: '🌙', desc: '帮助入眠，提升睡眠质量' },
      { id: 'anxiety', label: '缓解焦虑', icon: '😌', desc: '释放压力，平复心绪' },
      { id: 'focus', label: '提升专注', icon: '🎯', desc: '增强注意力，提高效率' },
    ],
  },
]

export function QuizScreen() {
  const navigation = useNavigation<Nav>()
  const { setPreference, completeQuiz } = useUserStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const currentQuestion = QUESTIONS[currentIndex]
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100

  const handleSelect = (optionId: string) => {
    setSelected(optionId)
  }

  const handleNext = () => {
    if (!selected) return
    setPreference(selected as 'sleep' | 'anxiety' | 'focus')
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      completeQuiz()
      navigation.goBack()
    }
  }

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.stepText}>第 {currentIndex + 1} 题 / 共 {QUESTIONS.length} 题</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsList}>
          {currentQuestion.options.map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                selected === opt.id && styles.optionCardSelected,
              ]}
              onPress={() => handleSelect(opt.id)}
            >
              <Text style={styles.optionIcon}>{opt.icon}</Text>
              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected === opt.id && styles.optionLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              {selected === opt.id && (
                <Text style={styles.optionCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={[styles.nextBtnText, !selected && styles.nextBtnTextDisabled]}>
            {currentIndex < QUESTIONS.length - 1 ? '下一题' : '完成'}
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
  progressBarBg: {
    height: 4,
    backgroundColor: '#1a1a3e',
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#7c6aef',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#9090a0',
    marginBottom: 16,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsList: {
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#7c6aef',
    backgroundColor: '#7c6aef10',
  },
  optionIcon: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#7c6aef',
  },
  optionDesc: {
    fontSize: 14,
    color: '#9090a0',
  },
  optionCheck: {
    fontSize: 20,
    color: '#7c6aef',
    fontWeight: 'bold',
  },
  nextBtn: {
    backgroundColor: '#7c6aef',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#1a1a3e',
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtnTextDisabled: {
    color: '#9090a0',
  },
})
