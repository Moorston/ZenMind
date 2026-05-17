import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/RootNavigator'

type Nav = NativeStackNavigationProp<RootStackParamList>

export function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()

  const menuItems = [
    { label: '偏好测试', screen: 'Quiz' as const },
    { label: '数据统计', screen: 'Stats' as const },
    { label: '每日提醒', screen: 'Reminder' as const },
    { label: '设置', screen: 'Settings' as const },
  ]

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>我的</Text>
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 32,
  },
  menuSection: {
    backgroundColor: '#12122a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3a',
  },
  menuLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  menuArrow: {
    fontSize: 20,
    color: '#606080',
  },
})
