/**
 * 统一 API 响应格式
 * 所有 Controller 返回值必须使用此格式
 */
import { ErrorCode, ERROR_MESSAGES } from './error-codes'

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  errors?: Array<{
    field: string
    message: string
  }>
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

/**
 * 成功响应
 */
export function success<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return { status: 'success', data, ...(meta ? { meta } : {}) }
}

/**
 * 错误响应
 * @param message 错误消息或错误码
 * @param errors 可选的字段级错误详情
 */
export function error(message: string | ErrorCode, errors?: ApiResponse['errors']): ApiResponse {
  const resolvedMessage = typeof message === 'number' ? (ERROR_MESSAGES[message] || 'Unknown error') : message
  return { status: 'error', message: resolvedMessage, errors }
}
