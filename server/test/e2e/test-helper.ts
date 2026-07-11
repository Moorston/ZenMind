import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { testDbPath } from './test-db.module'
import { AppModule } from '@/app.module'
import { DRIZZLE } from '@/modules/db/db.module'
import { users } from '@/db/schema/users'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { courses } from '@/db/schema/courses'
import { unlinkSync } from 'fs'

export async function createTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.setGlobalPrefix('api')
  await app.init()

  // Get the db instance that DbModule created
  const db = moduleFixture.get(DRIZZLE)

  // Create tables using the underlying better-sqlite3 instance
  const sqlite = (db as any).$client
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
      nickname TEXT NOT NULL, token TEXT, role TEXT NOT NULL DEFAULT 'user',
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
  `)

  return { app, db, sqlite, testDbPath }
}

export async function closeTestApp(app: INestApplication, sqlite: any, dbPath: string) {
  await app.close()
  try { sqlite.close() } catch {}
  try { unlinkSync(dbPath) } catch {}
}

export function createTestUser(db: any) {
  const bcrypt = require('bcryptjs')
  const crypto = require('crypto')

  const userId = crypto.randomUUID()
  const email = `test-${Date.now()}@example.com`
  const password = 'Test1234!'
  const hashedPassword = bcrypt.hashSync(password, 10)
  const token = `token-${crypto.randomUUID()}`

  db.insert(users).values({
    id: userId, email, password: hashedPassword,
    nickname: 'Test User', token, role: 'user',
  }).run()

  return { userId, email, password, token }
}

export function createAdminUser(db: any) {
  const bcrypt = require('bcryptjs')
  const crypto = require('crypto')

  const userId = crypto.randomUUID()
  const email = `admin-${Date.now()}@example.com`
  const password = 'Admin1234!'
  const hashedPassword = bcrypt.hashSync(password, 10)
  const token = `admin-token-${crypto.randomUUID()}`

  db.insert(users).values({
    id: userId, email, password: hashedPassword,
    nickname: 'Admin User', token, role: 'admin',
  }).run()

  return { userId, email, password, token }
}

export function seedTestData(db: any) {
  db.insert(instructors).values({
    id: 'instr-test-1', name: '测试导师',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: '测试导师简介', voiceType: 'gentle',
  }).run()

  db.insert(series).values({
    id: 'series-test-1', title: '测试系列',
    description: '测试系列描述',
    coverUrl: 'https://example.com/cover.jpg',
    level: 'beginner', estimatedDays: 7,
    isRecommended: true, order: 1,
  }).run()

  db.insert(courses).values({
    id: 'course-test-1', title: '测试课程',
    description: '测试课程描述',
    category: 'breathing', level: 'beginner', duration: 10,
    coverUrl: 'https://example.com/course-cover.jpg',
    audioUrl: 'https://example.com/audio.mp3',
    tags: JSON.stringify(['测试']),
    instructorId: 'instr-test-1', seriesId: 'series-test-1',
    orderInSeries: 1,
  }).run()

  return { instructorId: 'instr-test-1', seriesId: 'series-test-1', courseId: 'course-test-1' }
}