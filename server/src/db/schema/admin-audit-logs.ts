import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const adminAuditLogs = sqliteTable('admin_audit_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull(),
  action: text('action').notNull(),       // 'role_change' | 'course_archive' | 'course_restore' | 'push_broadcast'
  targetType: text('target_type').notNull(), // 'user' | 'course' | 'push'
  targetId: text('target_id'),             // 被操作对象ID
  oldValue: text('old_value'),             // 操作前的值
  newValue: text('new_value'),             // 操作后的值
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  adminIdx: index('idx_audit_admin').on(table.adminId),
  actionIdx: index('idx_audit_action').on(table.action),
  createdIdx: index('idx_audit_created').on(table.createdAt),
}))

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert
