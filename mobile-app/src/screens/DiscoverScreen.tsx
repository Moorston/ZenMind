import { View, Text, StyleSheet } from 'react-native'

export function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>发现</Text>
      <Text style={styles.placeholder}>课程搜索和分类筛选将在此显示</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    fontSize: 14,
    color: '#606080',
    textAlign: 'center',
    paddingVertical: 80,
  },
})
