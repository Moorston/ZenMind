/**
 * 标准错误码枚举
 * 用于统一错误处理和前端错误识别
 */
export enum ErrorCode {
  // 认证相关 (1xxx)
  AUTH_TOKEN_MISSING = 1001,
  AUTH_TOKEN_INVALID = 1002,
  AUTH_TOKEN_EXPIRED = 1003,
  AUTH_EMAIL_REQUIRED = 1004,
  AUTH_PASSWORD_REQUIRED = 1005,
  AUTH_NICKNAME_REQUIRED = 1006,
  AUTH_CODE_REQUIRED = 1007,
  AUTH_INVALID_CREDENTIALS = 1008,
  AUTH_WECHAT_CODE_REQUIRED = 1009,
  AUTH_WECHAT_LOGIN_FAILED = 1010,
  AUTH_VERIFICATION_CODE_INVALID = 1011,
  AUTH_EMAIL_ALREADY_EXISTS = 1012,

  // 业务逻辑 (2xxx)
  COURSE_NOT_FOUND = 2001,
  SERIES_NOT_FOUND = 2002,
  INSTRUCTOR_NOT_FOUND = 2003,
  PROGRESS_NOT_FOUND = 2004,

  // 输入验证 (3xxx)
  VALIDATION_FAILED = 3001,
  INVALID_QUERY_PARAMETERS = 3002,

  // 服务器错误 (5xxx)
  INTERNAL_ERROR = 5000,
  DATABASE_ERROR = 5001,
  EXTERNAL_SERVICE_ERROR = 5002,
}

/**
 * 错误码对应的默认消息
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_TOKEN_MISSING]: 'Missing authorization header',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid or expired token',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Token has expired',
  [ErrorCode.AUTH_EMAIL_REQUIRED]: 'Email is required',
  [ErrorCode.AUTH_PASSWORD_REQUIRED]: 'Password is required',
  [ErrorCode.AUTH_NICKNAME_REQUIRED]: 'Nickname is required',
  [ErrorCode.AUTH_CODE_REQUIRED]: 'Verification code is required',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_WECHAT_CODE_REQUIRED]: 'WeChat code is required',
  [ErrorCode.AUTH_WECHAT_LOGIN_FAILED]: 'WeChat login failed',
  [ErrorCode.AUTH_VERIFICATION_CODE_INVALID]: 'Invalid or expired verification code',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'Email already registered',

  [ErrorCode.COURSE_NOT_FOUND]: 'Course not found',
  [ErrorCode.SERIES_NOT_FOUND]: 'Series not found',
  [ErrorCode.INSTRUCTOR_NOT_FOUND]: 'Instructor not found',
  [ErrorCode.PROGRESS_NOT_FOUND]: 'Progress not found',

  [ErrorCode.VALIDATION_FAILED]: 'Validation failed',
  [ErrorCode.INVALID_QUERY_PARAMETERS]: 'Invalid query parameters',

  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
}
