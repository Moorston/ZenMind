import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import zhHant from './locales/zh-Hant.json'
import en from './locales/en.json'
import es from './locales/es.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import it from './locales/it.json'
import hi from './locales/hi.json'
import vi from './locales/vi.json'
import th from './locales/th.json'

const SUPPORTED_LANGUAGES = {
  zh: { name: '简体中文', nativeName: '简体中文' },
  'zh-Hant': { name: '繁体中文', nativeName: '繁體中文' },
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Español', nativeName: 'Español' },
  ja: { name: '日本語', nativeName: '日本語' },
  ko: { name: '한국어', nativeName: '한국어' },
  fr: { name: 'Français', nativeName: 'Français' },
  de: { name: 'Deutsch', nativeName: 'Deutsch' },
  pt: { name: 'Português', nativeName: 'Português' },
  ru: { name: 'Русский', nativeName: 'Русский' },
  ar: { name: 'العربية', nativeName: 'العربية' },
  it: { name: 'Italiano', nativeName: 'Italiano' },
  hi: { name: 'हिन्दी', nativeName: 'हिन्दी' },
  vi: { name: 'Tiếng Việt', nativeName: 'Tiếng Việt' },
  th: { name: 'ไทย', nativeName: 'ไทย' },
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

export const LANGUAGE_LIST = Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => ({
  code: code as LanguageCode,
  name: lang.nativeName,
  englishName: lang.name,
}))

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    'zh-Hant': { translation: zhHant },
    en: { translation: en },
    es: { translation: es },
    ja: { translation: ja },
    ko: { translation: ko },
    fr: { translation: fr },
    de: { translation: de },
    pt: { translation: pt },
    ru: { translation: ru },
    ar: { translation: ar },
    it: { translation: it },
    hi: { translation: hi },
    vi: { translation: vi },
    th: { translation: th },
  },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
})

export default i18n
