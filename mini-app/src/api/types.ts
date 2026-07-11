/**
 * 统一 API 响应类型（与后端 api-response.ts 对应）
 */
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
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
