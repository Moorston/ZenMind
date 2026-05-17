import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

import { HomeScreen } from '@/screens/HomeScreen'
import { DiscoverScreen } from '@/screens/DiscoverScreen'
import { PlayerScreen } from '@/screens/PlayerScreen'
import { ProfileScreen } from '@/screens/ProfileScreen'
import { QuizScreen } from '@/screens/QuizScreen'
import { StatsScreen } from '@/screens/StatsScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { ReminderScreen } from '@/screens/ReminderScreen'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { LoginScreen } from '@/screens/LoginScreen'
import { RegisterScreen } from '@/screens/RegisterScreen'
import { useAuthStore } from '@/store/useAuthStore'

export type RootTabParamList = {
  Home: undefined
  Discover: undefined
  Player: undefined
  Profile: undefined
}

export type RootStackParamList = {
  Welcome: undefined
  Login: undefined
  Register: undefined
  MainTabs: undefined
  Quiz: undefined
  Stats: undefined
  Settings: undefined
  Reminder: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7c6aef',
    background: '#0a0a1a',
    card: '#0a0a1a',
    text: '#ffffff',
    border: '#1a1a2e',
    notification: '#7c6aef',
  },
}

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Discover: '🔍',
    Player: '▶️',
    Profile: '👤',
  }
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '●'}
    </Text>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a1a',
          borderTopColor: '#1a1a2e',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#7c6aef',
        tabBarInactiveTintColor: '#9090a0',
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ tabBarLabel: '发现' }} />
      <Tab.Screen name="Player" component={PlayerScreen} options={{ tabBarLabel: '播放' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '我的' }} />
    </Tab.Navigator>
  )
}

function AuthFlow() {
  const hasSeenWelcome = useAuthStore((s) => s.hasSeenWelcome)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenWelcome ? (
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : !isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen
            name="Stats"
            component={StatsScreen}
            options={{
              headerShown: true,
              headerTitle: '数据统计',
              headerStyle: { backgroundColor: '#0a0a1a' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              headerTitle: '设置',
              headerStyle: { backgroundColor: '#0a0a1a' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Reminder"
            component={ReminderScreen}
            options={{
              headerShown: true,
              headerTitle: '每日提醒',
              headerStyle: { backgroundColor: '#0a0a1a' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={darkTheme}>
      <AuthFlow />
    </NavigationContainer>
  )
}
