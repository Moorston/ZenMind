import { useState, useRef, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Moon, Brain, Smile, ChevronLeft } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SelectableCard, SelectableCardIcon, SelectableCardText } from '@/components/selectable-card'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/store/meditation'

export default function Quiz() {
  const { t } = useTranslation()
  const questions = [
    {
      id: 1,
      question: t('quiz.question.title'),
      subtitle: t('quiz.question.subtitle'),
      options: [
        { id: 'sleep', label: t('quiz.option.sleep.label'), icon: Moon, color: '#6366f1', desc: t('quiz.option.sleep.desc') },
        { id: 'anxiety', label: t('quiz.option.anxiety.label'), icon: Smile, color: '#f59e0b', desc: t('quiz.option.anxiety.desc') },
        { id: 'focus', label: t('quiz.option.focus.label'), icon: Brain, color: '#10b981', desc: t('quiz.option.focus.desc') }
      ]
    }
  ]
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setPreference, completeQuiz } = useUserStore()

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current)
      }
    }
  }, [])

  const question = questions[currentStep]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleNext = () => {
    if (!selectedOption) {
      Taro.showToast({ title: t('quiz.error.noSelection'), icon: 'none' })
      return
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
      setSelectedOption(null)
    } else {
      setPreference(selectedOption as 'sleep' | 'anxiety' | 'focus')
      completeQuiz()
      Taro.showToast({ title: t('quiz.success'), icon: 'success' })
      navigateTimerRef.current = setTimeout(() => {
        Taro.navigateBack()
      }, 1000)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setSelectedOption(null)
    } else {
      Taro.navigateBack()
    }
  }

  return (
    <View className="min-h-screen bg-background px-4">
      <View className="pt-4 pb-6">
        <View className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-muted-foreground"
          >
            <ChevronLeft size={24} color="#9090a0" />
          </Button>
          <View className="flex-1">
            <Progress value={((currentStep + 1) / questions.length) * 100} />
          </View>
          <Text className="block text-sm text-muted-foreground">
            {currentStep + 1}/{questions.length}
          </Text>
        </View>
      </View>

      <View className="flex-1">
        <View className="mb-8">
          <Text className="block text-2xl font-bold text-foreground mb-2">
            {question.question}
          </Text>
          <Text className="block text-sm text-muted-foreground">
            {question.subtitle}
          </Text>
        </View>

        <View className="flex flex-col gap-4">
          {question.options.map(option => {
            const isSelected = selectedOption === option.id
            const Icon = option.icon

            return (
              <SelectableCard
                key={option.id}
                selected={isSelected}
                onSelect={() => handleOptionSelect(option.id)}
              >
                <SelectableCardIcon color={option.color}>
                  <Icon size={28} color={option.color} />
                </SelectableCardIcon>
                <SelectableCardText label={option.label} desc={option.desc} />
              </SelectableCard>
            )
          })}
        </View>
      </View>

      <View className="pb-8 pt-4">
        <Button
          className={`w-full ${
            selectedOption
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
          }`}
          onClick={handleNext}
        >
          <Text className="block">
            {currentStep < questions.length - 1 ? t('quiz.button.next') : t('quiz.button.finish')}
          </Text>
        </Button>
      </View>
    </View>
  )
}
