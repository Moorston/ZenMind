import { PropsWithChildren, useEffect, useCallback, useState } from 'react';
import { View, Text } from '@tarojs/components'
import { LucideTaroProvider } from 'lucide-react-taro';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { Toaster } from '@/components/ui/toast';
import { useUserStore, useCoursesStore } from '@/store/meditation';
import { useLanguageStore } from '@/store/language';
import { canUseDOM } from '@/lib/platform';
import Taro from '@tarojs/taro';
import '@/app.css';
import { Preset } from './presets';

const updateTabBar = () => {
  try {
    Taro.setTabBarItem({ index: 0, text: i18n.t('tabbar.home') })
    Taro.setTabBarItem({ index: 1, text: i18n.t('tabbar.discover') })
    Taro.setTabBarItem({ index: 2, text: i18n.t('tabbar.player') })
    Taro.setTabBarItem({ index: 3, text: i18n.t('tabbar.profile') })
    Taro.setNavigationBarTitle({ title: i18n.t('app.navbarTitle') })
  } catch {}
}

const GRADIENTS = [
  'linear-gradient(135deg, #0f0a1a 0%, #1a1035 30%, #0d1b2a 70%, #0a0a0a 100%)',
  'linear-gradient(135deg, #0a0a1a 0%, #16213e 30%, #0f3460 70%, #1a1a2e 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #2d1b1b 30%, #1b2838 70%, #0a0a0a 100%)',
  'linear-gradient(135deg, #0a1a0f 0%, #1b2d1b 30%, #0d2137 70%, #0a0a0a 100%)',
]

const App = ({ children }: PropsWithChildren) => {
  const isDarkMode = useUserStore((s) => s.isDarkMode);
  const [showSplash, setShowSplash] = useState(true);
  const [gradientIndex, setGradientIndex] = useState(0);

  useEffect(() => {
    if (canUseDOM()) {
      const root = document.documentElement
      if (isDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    useCoursesStore.getState().initialize()
  }, []);

  useEffect(() => {
    const lang = useLanguageStore.getState().language
    if (lang && lang !== 'zh') {
      i18n.changeLanguage(lang)
    }
    updateTabBar()
    const gradTimer = setInterval(() => {
      setGradientIndex((i) => (i + 1) % GRADIENTS.length)
    }, 800)
    const hideTimer = setTimeout(() => setShowSplash(false), 2800)
    return () => {
      clearInterval(gradTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const onLanguageChanged = useCallback(() => {
    updateTabBar()
  }, [])

  useEffect(() => {
    i18n.on('languageChanged', onLanguageChanged)
    return () => {
      i18n.off('languageChanged', onLanguageChanged)
    }
  }, [onLanguageChanged])

  return (
    <I18nextProvider i18n={i18n}>
      <LucideTaroProvider defaultColor="#000" defaultSize={24}>
        <View className={isDarkMode ? 'dark' : ''}>
          <Preset>{children}</Preset>
        </View>
        <Toaster />
        {showSplash && (
          <View
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: GRADIENTS[gradientIndex],
              zIndex: 9999,
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 0 60px rgba(124,58,237,0.4)',
              }}
            >
              <Text style={{ fontSize: 40, lineHeight: 1 }}>🧘</Text>
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#f0e6ff',
                letterSpacing: 4,
                marginBottom: 8,
              }}
            >
              尘间静
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: 'rgba(196, 181, 253, 0.8)',
                letterSpacing: 6,
              }}
            >
              静心冥想
            </Text>
          </View>
        )}
      </LucideTaroProvider>
    </I18nextProvider>
  );
};

export default App;
