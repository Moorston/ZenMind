import { View, Text, StyleSheet } from 'react-native'

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>设置页面将在此显示</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 14, color: '#606080' },
})
