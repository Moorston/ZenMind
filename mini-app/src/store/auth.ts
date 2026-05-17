import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

  login: (token: string, user: UserInfo) => void
  logout: () => void
  updateUser: (user: Partial<UserInfo>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      login: (token, user) => set({ token, user, isLoggedIn: true }),

      logout: () => set({ token: null, user: null, isLoggedIn: false }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    { name: 'auth-storage' }
  )
)
