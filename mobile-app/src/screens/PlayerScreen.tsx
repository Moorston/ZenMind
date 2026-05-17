import { View, Text, StyleSheet } from 'react-native'

export function PlayerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>播放器</Text>
      <Text style={styles.placeholder}>音频播放器将在此显示</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 14,
    color: '#606080',
    textAlign: 'center',
  },
})
