import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { type LanguageCode, LANGUAGE_LIST } from '@/i18n'

interface LanguageState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'zh',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
        set({ language: lang })
      },
    }),
    {
      name: 'app-language',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language)
        }
      },
    }
  )
)

export { LANGUAGE_LIST }
export type { LanguageCode }
