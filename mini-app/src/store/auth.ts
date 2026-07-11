import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Taro from '@tarojs/taro'

interface UserInfo {
  id: string
  nickname: string
  phone?: string
  email?: string
  avatar?: string
}

interface AuthState {
  token: string | null
  user: UserInfo | null
  isLoggedIn: boolean
  tokenExpiresAt: number | null

  login: (token: string, user: UserInfo, expiresAt?: string) => void
  logout: () => void
  updateUser: (user: Partial<UserInfo>) => void
  refreshToken: (token: string, expiresAt?: string) => void
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      tokenExpiresAt: null,

      login: (token, user, expiresAt) => set({
        token,
        user,
        isLoggedIn: true,
        tokenExpiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
      }),

      logout: () => {
        set({ token: null, user: null, isLoggedIn: false, tokenExpiresAt: null })
        Taro.removeStorageSync('auth-storage')
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      refreshToken: (token, expiresAt) => set({
        token,
        tokenExpiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
      }),

      isTokenExpired: () => {
        const { tokenExpiresAt, token } = get()
        if (!token) return true
        if (!tokenExpiresAt) return false // 无过期时间的旧 token 不算过期
        return Date.now() > tokenExpiresAt
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
)
