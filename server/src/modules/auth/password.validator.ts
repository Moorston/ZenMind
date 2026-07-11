export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 64

/**
 * 校验密码强度
 * @returns null 表示密码有效，string 表示错误描述
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符`
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符`
  }
  if (!/[A-Z]/.test(password)) return '密码需要包含大写字母'
  if (!/[a-z]/.test(password)) return '密码需要包含小写字母'
  if (!/[0-9]/.test(password)) return '密码需要包含数字'
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?`~\\]/.test(password)) return '密码需要包含特殊字符'
  return null
}