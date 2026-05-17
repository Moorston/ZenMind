import { View, Text, StyleSheet } from 'react-native'

export function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>数据统计将在此显示</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 14, color: '#606080' },
})
