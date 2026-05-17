import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.greeting}>你好，冥想者</Text>
      <Text style={styles.subtitle}>今日宜静心</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日推荐</Text>
        <Text style={styles.placeholder}>推荐课程将在此显示</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#9090a0',
    marginTop: 8,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#606080',
    textAlign: 'center',
    paddingVertical: 40,
  },
})
