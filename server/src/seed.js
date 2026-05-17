/**
 * 数据库种子脚本 (JS 版, 无需 TypeScript 编译)
 * 使用方式: node src/seed.js
 */
const { drizzle } = require('drizzle-orm/better-sqlite3/driver')
const Database = require('better-sqlite3')
const { resolve } = require('path')
const schema = require('./db/schema')

async function main() {
  const dbPath = resolve(__dirname, '..', 'data', 'meditation.db')
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })

  console.log('Seeding database...')

  const existingInstructors = db.select({ id: schema.instructors.id }).from(schema.instructors).all()

  if (existingInstructors.length > 0) {
    console.log('  Database already seeded, skipping...')
    sqlite.close()
    return
  }

  const [{ id: instructorsResult }] = db.insert(schema.instructors).values([
    { id: 'jingxin', name: '静心', avatarUrl: '', bio: '资深冥想导师，擅长呼吸冥想和基础引导', voiceType: 'gentle' },
    { id: 'mengxi', name: '梦溪', avatarUrl: '', bio: '专注睡眠冥想与放松训练', voiceType: 'soft' },
    { id: 'qingfeng', name: '清风', avatarUrl: '', bio: '减压冥想专家，帮助释放焦虑与压力', voiceType: 'calm' },
    { id: 'mingyue', name: '明月', avatarUrl: '', bio: '专注力训练导师，帮助提升工作效率', voiceType: 'clear' },
  ]).returning()
  console.log(`  ✓ instructors`)

  db.insert(schema.series).values([
    { id: '7day-intro', title: '7天冥想入门', description: '从零开始，7天带你走进冥想的世界', coverUrl: '', level: 'beginner', estimatedDays: 7, isRecommended: true, order: 1 },
    { id: 'stress-relief', title: '减压专题', description: '工作和生活中的压力释放练习', coverUrl: '', level: 'intermediate', estimatedDays: 4, isRecommended: true, order: 2 },
    { id: 'sleep-better', title: '改善睡眠', description: '帮助你快速入眠的睡前冥想', coverUrl: '', level: 'beginner', estimatedDays: 3, isRecommended: true, order: 3 },
  ]).returning()
  console.log(`  ✓ series`)

  db.insert(schema.courses).values([
    { id: 'breathing-basics', title: '呼吸基础练习', description: '学习腹式呼吸，让身心放松', category: 'breathing', level: 'beginner', duration: 5, coverUrl: '', audioUrl: '', tags: JSON.stringify(['呼吸', '入门']), instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 1 },
    { id: 'body-scan', title: '身体扫描冥想', description: '从头到脚扫描身体，释放紧张', category: 'body-scan', level: 'beginner', duration: 10, coverUrl: '', audioUrl: '', tags: JSON.stringify(['身体扫描', '放松']), instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 2 },
    { id: 'mindful-eating', title: '正念饮食练习', description: '用正念的方式体验食物', category: 'mindfulness', level: 'beginner', duration: 10, coverUrl: '', audioUrl: '', tags: JSON.stringify(['正念', '饮食']), instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 3 },
    { id: 'emotion-watch', title: '情绪观察冥想', description: '观察情绪起伏，不被情绪带走', category: 'mindfulness', level: 'intermediate', duration: 10, coverUrl: '', audioUrl: '', tags: JSON.stringify(['情绪', '正念']), instructorId: 'qingfeng', seriesId: '7day-intro', orderInSeries: 4 },
    { id: 'walking-meditation', title: '行走冥想指引', description: '在行走中练习正念', category: 'mindfulness', level: 'intermediate', duration: 12, coverUrl: '', audioUrl: '', tags: JSON.stringify(['行走', '正念']), instructorId: 'mingyue', seriesId: '7day-intro', orderInSeries: 5 },
    { id: 'loving-kindness', title: '慈心冥想练习', description: '培养对自己和他人的慈爱之心', category: 'loving-kindness', level: 'intermediate', duration: 15, coverUrl: '', audioUrl: '', tags: JSON.stringify(['慈心', '爱']), instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 6 },
    { id: 'open-sitting', title: '开放式静坐', description: '不加评判地观察当下', category: 'mindfulness', level: 'advanced', duration: 20, coverUrl: '', audioUrl: '', tags: JSON.stringify(['静坐', '进阶']), instructorId: 'jingxin', seriesId: '7day-intro', orderInSeries: 7 },
    { id: 'quick-de-stress', title: '课间5分钟减压', description: '快速缓解工作压力', category: 'breathing', level: 'beginner', duration: 5, coverUrl: '', audioUrl: '', tags: JSON.stringify(['减压', '快速']), instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 1 },
    { id: 'anxiety-relief', title: '焦虑缓解冥想', description: '释放焦虑，找回内心平静', category: 'breathing', level: 'intermediate', duration: 10, coverUrl: '', audioUrl: '', tags: JSON.stringify(['焦虑', '减压']), instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 2 },
    { id: 'stress-release-scan', title: '压力释放身体扫描', description: '通过身体扫描释放深层压力', category: 'body-scan', level: 'intermediate', duration: 15, coverUrl: '', audioUrl: '', tags: JSON.stringify(['压力', '身体扫描']), instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 3 },
    { id: 'deep-relaxation', title: '深度放松瑜伽休息术', description: '全身心深度放松', category: 'visualization', level: 'advanced', duration: 20, coverUrl: '', audioUrl: '', tags: JSON.stringify(['放松', '深度']), instructorId: 'qingfeng', seriesId: 'stress-relief', orderInSeries: 4 },
    { id: 'sleep-journey', title: '深度睡眠引导', description: '帮助您快速进入深度睡眠', category: 'visualization', level: 'beginner', duration: 20, coverUrl: '', audioUrl: '', tags: JSON.stringify(['睡眠', '晚安']), instructorId: 'mengxi', seriesId: 'sleep-better', orderInSeries: 1 },
    { id: 'sleep-breathing', title: '睡前呼吸练习', description: '4-7-8 呼吸法，帮助入眠', category: 'breathing', level: 'beginner', duration: 5, coverUrl: '', audioUrl: '', tags: JSON.stringify(['呼吸', '睡眠']), instructorId: 'mengxi', seriesId: 'sleep-better', orderInSeries: 2 },
    { id: 'body-scan-sleep', title: '睡前身体扫描', description: '放松全身肌肉，准备入睡', category: 'body-scan', level: 'intermediate', duration: 15, coverUrl: '', audioUrl: '', tags: JSON.stringify(['身体扫描', '睡眠']), instructorId: 'mengxi', seriesId: 'sleep-better', orderInSeries: 3 },
    { id: 'morning-focus', title: '清晨专注力', description: '开启一天的正确方式', category: 'mindfulness', level: 'beginner', duration: 5, coverUrl: '', audioUrl: '', tags: JSON.stringify(['专注', '清晨']), instructorId: 'mingyue' },
    { id: 'deep-focus', title: '深度专注训练', description: '提升注意力和工作效率', category: 'mindfulness', level: 'advanced', duration: 20, coverUrl: '', audioUrl: '', tags: JSON.stringify(['专注', '深度']), instructorId: 'mingyue' },
  ]).returning()
  console.log(`  ✓ courses`)

  sqlite.close()
  console.log('Seed complete!')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
