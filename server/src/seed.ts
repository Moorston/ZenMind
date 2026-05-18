import 'dotenv/config'
import { drizzle } from 'drizzle-orm/better-sqlite3/driver'
import Database from 'better-sqlite3'
import { resolve } from 'path'
import * as schema from './db/schema'

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS instructors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT NOT NULL,
  voice_type TEXT NOT NULL DEFAULT 'gentle',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced')),
  estimated_days INTEGER NOT NULL DEFAULT 7,
  is_recommended INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('breathing','body-scan','visualization','loving-kindness','mindfulness')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced')),
  duration INTEGER NOT NULL,
  cover_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  instructor_id TEXT REFERENCES instructors(id) ON DELETE SET NULL,
  series_id TEXT REFERENCES series(id) ON DELETE CASCADE,
  order_in_series INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS series_courses (
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  PRIMARY KEY (series_id, course_id)
);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`

async function seed() {
  const dbPath = process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL.slice(5)
    : resolve(__dirname, '..', 'data', 'meditation.db')
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })

  // 自动创建表 (SQLite 专用)
  sqlite.exec(CREATE_TABLES)
  console.log('✓ Tables ready')

  console.log('Seeding database...')

  const force = process.argv.includes('--force')

  const existingInstructors = db.select({ id: schema.instructors.id }).from(schema.instructors).all()

  if (existingInstructors.length > 0) {
    if (force) {
      console.log('  Force re-seeding: clearing existing data...')
      sqlite.exec('DELETE FROM progress; DELETE FROM series_courses; DELETE FROM courses; DELETE FROM series; DELETE FROM instructors;')
    } else {
      console.log('  Database already seeded, skipping...')
      console.log('  Use --force to re-seed')
      sqlite.close()
      return
    }
  }

  const instructorsResult = await db.insert(schema.instructors).values([
    { id: 'jingxin', name: '静心', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', bio: '资深冥想导师，擅长呼吸冥想和基础引导', voiceType: 'gentle' },
    { id: 'mengxi', name: '梦溪', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', bio: '专注睡眠冥想与放松训练', voiceType: 'soft' },
    { id: 'qingfeng', name: '清风', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', bio: '减压冥想专家，帮助释放焦虑与压力', voiceType: 'calm' },
    { id: 'mingyue', name: '明月', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', bio: '专注力训练导师，帮助提升工作效率', voiceType: 'clear' },
  ]).onConflictDoNothing().returning()
  console.log(`  ✓ ${instructorsResult.length} instructors`)

  const seriesResult = await db.insert(schema.series).values([
    {
      id: '7day-intro',
      title: '7天冥想入门',
      description: '从零开始，7天带你走进冥想的世界',
      coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      level: 'beginner',
      estimatedDays: 7,
      isRecommended: true,
      order: 1,
    },
    {
      id: 'stress-relief',
      title: '减压专题',
      description: '工作和生活中的压力释放练习',
      coverUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27abb37f?w=400',
      level: 'intermediate',
      estimatedDays: 4,
      isRecommended: true,
      order: 2,
    },
    {
      id: 'sleep-better',
      title: '改善睡眠',
      description: '帮助你快速入眠的睡前冥想',
      coverUrl: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400',
      level: 'beginner',
      estimatedDays: 3,
      isRecommended: true,
      order: 3,
    },
  ]).onConflictDoNothing().returning()
  console.log(`  ✓ ${seriesResult.length} series`)

  const coursesResult = await db.insert(schema.courses).values([
    {
      id: 'breathing-basics', title: '呼吸基础练习', description: '学习腹式呼吸，让身心放松',
      category: 'breathing', level: 'beginner', duration: 5,
      // 上传真实文件后替换 coverUrl 和 audioUrl: npx ts-node src/seed-media.ts ./media
      // TODO: 上传真实文件后替换 coverUrl 和 audioUrl: npx ts-node src/seed-media.ts ./media
      coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', tags: JSON.stringify(['呼吸', '入门']),
      instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 1,
    },
    {
      id: 'body-scan', title: '身体扫描冥想', description: '从头到脚扫描身体，释放紧张',
      category: 'body-scan', level: 'beginner', duration: 10,
      coverUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', tags: JSON.stringify(['身体扫描', '放松']),
      instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 2,
    },
    {
      id: 'mindful-eating', title: '正念饮食练习', description: '用正念的方式体验食物',
      category: 'mindfulness', level: 'beginner', duration: 10,
      coverUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', tags: JSON.stringify(['正念', '饮食']),
      instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 3,
    },
    {
      id: 'emotion-watch', title: '情绪观察冥想', description: '观察情绪起伏，不被情绪带走',
      category: 'mindfulness', level: 'intermediate', duration: 10,
      coverUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27abb37f?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', tags: JSON.stringify(['情绪', '正念']),
      instructorId: 'qingfeng', seriesId: '7day-intro', orderInSeries: 4,
    },
    {
      id: 'walking-meditation', title: '行走冥想指引', description: '在行走中练习正念',
      category: 'mindfulness', level: 'intermediate', duration: 12,
      coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', tags: JSON.stringify(['行走', '正念']),
      instructorId: 'mingyue', seriesId: '7day-intro', orderInSeries: 5,
    },
    {
      id: 'loving-kindness', title: '慈心冥想练习', description: '培养对自己和他人的慈爱之心',
      category: 'loving-kindness', level: 'intermediate', duration: 15,
      coverUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', tags: JSON.stringify(['慈心', '爱']),
      instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 6,
    },
    {
      id: 'open-sitting', title: '开放式静坐', description: '不加评判地观察当下',
      category: 'mindfulness', level: 'advanced', duration: 20,
      coverUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', tags: JSON.stringify(['静坐', '进阶']),
      instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 7,
    },
    {
      id: 'quick-de-stress', title: '课间5分钟减压', description: '快速缓解工作压力',
      category: 'breathing', level: 'beginner', duration: 5,
      coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', tags: JSON.stringify(['减压', '快速']),
      instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 1,
    },
    {
      id: 'anxiety-relief', title: '焦虑缓解冥想', description: '释放焦虑，找回内心平静',
      category: 'breathing', level: 'intermediate', duration: 10,
      coverUrl: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', tags: JSON.stringify(['焦虑', '减压']),
      instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 2,
    },
    {
      id: 'stress-release-scan', title: '压力释放身体扫描', description: '通过身体扫描释放深层压力',
      category: 'body-scan', level: 'intermediate', duration: 15,
      coverUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27abb37f?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', tags: JSON.stringify(['压力', '身体扫描']),
      instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 3,
    },
    {
      id: 'deep-relaxation', title: '深度放松瑜伽休息术', description: '全身心深度放松',
      category: 'visualization', level: 'advanced', duration: 20,
      coverUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', tags: JSON.stringify(['放松', '深度']),
      instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 4,
    },
    {
      id: 'sleep-journey', title: '深度睡眠引导', description: '帮助您快速进入深度睡眠',
      category: 'visualization', level: 'beginner', duration: 20,
      coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', tags: JSON.stringify(['睡眠', '晚安']),
      instructorId: 'mengxi', seriesId: 'sleep-better', orderInSeries: 1,
    },
    {
      id: 'sleep-breathing', title: '睡前呼吸练习', description: '4-7-8 呼吸法，帮助入眠',
      category: 'breathing', level: 'beginner', duration: 5,
      coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', tags: JSON.stringify(['呼吸', '睡眠']),
      instructorId: 'mengxi', seriesId: 'sleep-better', orderInSeries: 2,
    },
    {
      id: 'body-scan-sleep', title: '睡前身体扫描', description: '放松全身肌肉，准备入睡',
      category: 'body-scan', level: 'intermediate', duration: 15,
      coverUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', tags: JSON.stringify(['身体扫描', '睡眠']),
      instructorId: 'mengxi', seriesId: 'sleep-better', orderInSeries: 3,
    },
    {
      id: 'morning-focus', title: '清晨专注力', description: '开启一天的正确方式',
      category: 'mindfulness', level: 'beginner', duration: 5,
      coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', tags: JSON.stringify(['专注', '清晨']),
      instructorId: 'mingyue',
    },
    {
      id: 'deep-focus', title: '深度专注训练', description: '提升注意力和工作效率',
      category: 'mindfulness', level: 'advanced', duration: 20,
      coverUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', tags: JSON.stringify(['专注', '深度']),
      instructorId: 'mingyue',
    },
  ]).onConflictDoNothing().returning()
  console.log(`  ✓ ${coursesResult.length} courses`)

  for (const s of seriesResult) {
    const courseIds = coursesResult
      .filter((c: any) => c.seriesId === s.id)
      .sort((a: any, b: any) => (a.orderInSeries || 0) - (b.orderInSeries || 0))
      .map((c: any) => c.id)

    if (courseIds.length > 0) {
      await db.insert(schema.seriesCourses).values(
        courseIds.map((cid: string, idx: number) => ({
          seriesId: s.id,
          courseId: cid,
          order: idx + 1,
        }))
      ).onConflictDoNothing()
    }
  }
  console.log(`  ✓ series_courses relations`)

  console.log('Seed complete!')
  sqlite.close()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
