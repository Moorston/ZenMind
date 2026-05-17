import { View, Text, StyleSheet } from 'react-native'

export function ReminderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>每日提醒将在此显示</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 14, color: '#606080' },
})
