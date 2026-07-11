/**
 * 测试用 Guard Mock
 * 在 E2E 测试中替代 AuthGuard，跳过认证
 */
export class TestAuthGuard {
  canActivate() {
    return true
  }
}

/**
 * 创建管理员测试用户的 token
 */
export class TestAdminGuard {
  canActivate() {
    return true
  }
}