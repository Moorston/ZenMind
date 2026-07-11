import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { CommunityAPI } from '@/api/community'
import { useAuthStore } from '@/store/useAuthStore'

type PostType = 'reflection' | 'checkin' | 'share'

const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: 'reflection', label: '心得' },
  { key: 'checkin', label: '打卡' },
  { key: 'share', label: '分享' },
]

const MAX_CHARS = 500

export function CreatePostScreen() {
  const navigation = useNavigation()
  const userId = useAuthStore((s) => s.userId)

  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<PostType>('reflection')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = content.trim().length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    if (!userId) {
      Alert.alert('提示', '请先登录后再发帖')
      return
    }

    setSubmitting(true)
    try {
      await CommunityAPI.createPost({
        userId,
        content: content.trim(),
        type: postType,
      })
      Alert.alert('成功', '帖子发布成功', [
        { text: '确定', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      Alert.alert('发布失败', error?.message || '请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发帖</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type chips */}
          <Text style={styles.label}>类型</Text>
          <View style={styles.chipRow}>
            {TYPE_OPTIONS.map((opt) => {
              const selected = postType === opt.key
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setPostType(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Content input */}
          <Text style={styles.label}>内容</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="分享你的冥想心得..."
              placeholderTextColor="#606080"
              multiline
              maxLength={MAX_CHARS}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {content.length}/{MAX_CHARS}
            </Text>
          </View>
        </ScrollView>

        {/* Publish button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.publishBtn, !canSubmit && styles.publishBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text
                style={[
                  styles.publishBtnText,
                  !canSubmit && styles.publishBtnTextDisabled,
                ]}
              >
                发布
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9090a0',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  chipSelected: {
    backgroundColor: '#7c6aef20',
    borderColor: '#7c6aef',
  },
  chipText: {
    fontSize: 14,
    color: '#9090a0',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#7c6aef',
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
  },
  textInput: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    minHeight: 160,
    padding: 0,
  },
  charCount: {
    fontSize: 12,
    color: '#606080',
    textAlign: 'right',
    marginTop: 8,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  publishBtn: {
    backgroundColor: '#7c6aef',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: {
    backgroundColor: '#2a2a4e',
  },
  publishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  publishBtnTextDisabled: {
    color: '#606080',
  },
})
