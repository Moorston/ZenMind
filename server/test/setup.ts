import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3/driver'
import * as schema from '../src/db/schema'

/**
 * Creates an in-memory SQLite database for testing.
 * Each test file should call this to get an isolated database instance.
 */
export function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS instructors (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, avatar_url TEXT NOT NULL,
      bio TEXT NOT NULL, voice_type TEXT NOT NULL DEFAULT 'gentle',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      cover_url TEXT NOT NULL, level TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced')),
      estimated_days INTEGER NOT NULL DEFAULT 7, is_recommended INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('breathing','body-scan','visualization','loving-kindness','mindfulness')),
      level TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced')),
      duration INTEGER NOT NULL, cover_url TEXT NOT NULL, audio_url TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]', instructor_id TEXT REFERENCES instructors(id) ON DELETE SET NULL,
      series_id TEXT REFERENCES series(id) ON DELETE CASCADE, order_in_series INTEGER DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS series_courses (
      series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      "order" INTEGER DEFAULT 0, PRIMARY KEY (series_id, course_id)
    );
    CREATE TABLE IF NOT EXISTS progress (
      user_id TEXT NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0, completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, course_id)
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
      nickname TEXT NOT NULL, token TEXT, token_expires_at TEXT, role TEXT NOT NULL DEFAULT 'user',
      wechat_openid TEXT, avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS email_verification_codes (
      id TEXT PRIMARY KEY, email TEXT NOT NULL, code TEXT NOT NULL,
      expires_at TEXT NOT NULL, used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS push_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'h5', token TEXT,
      reminder_time TEXT, enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      access_token TEXT NOT NULL, refresh_token TEXT NOT NULL,
      device_info TEXT, ip_address TEXT,
      expires_at TEXT NOT NULL, refresh_expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    );
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id TEXT PRIMARY KEY, token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY, admin_id TEXT NOT NULL,
      action TEXT NOT NULL, target_type TEXT NOT NULL,
      target_id TEXT, old_value TEXT, new_value TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  return { sqlite, db }
}