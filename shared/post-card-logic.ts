/**
 * PostCard 共享业务逻辑
 * mini-app 和 mobile-app 的 PostCard 组件都使用这些纯函数
 */

export type PostType = 'reflection' | 'checkin' | 'share'

export const TYPE_LABELS: Record<PostType, string> = {
  reflection: '心得',
  checkin: '打卡',
  share: '分享',
}

export const TYPE_COLORS: Record<PostType, string> = {
  reflection: '#7c6aef',
  checkin: '#2dd4bf',
  share: '#fbbf24',
}

/**
 * 格式化时间为相对时间
 * 兼容 ISO 8601（带/不带 Z 后缀）和普通日期字符串
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  // 统一解析：无后缀视为本地时间，有 Z 后缀视为 UTC
  const date = new Date(dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr)
  if (isNaN(date.getTime())) return dateStr
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}小时前`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}天前`
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Like 防抖逻辑
 */
export function canLike(lastLikeTimeRef: { current: number }): boolean {
  const now = Date.now()
  if (now - lastLikeTimeRef.current < 500) return false
  lastLikeTimeRef.current = now
  return true
}
