import { create } from 'zustand'

export type AuthMethod = 'wechat' | 'phone' | 'email'

interface AuthState {
  isLoggedIn: boolean
  hasSeenWelcome: boolean
  userId: string | null
  token: string | null
  phone: string | null
  email: string | null
  wechatOpenId: string | null
  nickname: string
  avatarUrl: string

  setHasSeenWelcome: () => void
  login: (params: {
    userId: string
    token: string
    nickname?: string
    avatarUrl?: string
    phone?: string
    email?: string
    wechatOpenId?: string
  }) => void
  logout: () => void
  updateProfile: (data: { nickname?: string; avatarUrl?: string }) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  hasSeenWelcome: false,
  userId: null,
  token: null,
  phone: null,
  email: null,
  wechatOpenId: null,
  nickname: '',
  avatarUrl: '',

  setHasSeenWelcome: () => set({ hasSeenWelcome: true }),

  login: (params) =>
    set({
      isLoggedIn: true,
      userId: params.userId,
      token: params.token,
      nickname: params.nickname || '',
      avatarUrl: params.avatarUrl || '',
      phone: params.phone || null,
      email: params.email || null,
      wechatOpenId: params.wechatOpenId || null,
    }),

  logout: () =>
    set({
      isLoggedIn: false,
      userId: null,
      token: null,
      phone: null,
      email: null,
      wechatOpenId: null,
      nickname: '',
      avatarUrl: '',
    }),

  updateProfile: (data) =>
    set((s) => ({
      nickname: data.nickname ?? s.nickname,
      avatarUrl: data.avatarUrl ?? s.avatarUrl,
    })),
}))
