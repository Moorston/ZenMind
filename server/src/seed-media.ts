/**
 * 媒体资源上传脚本 — 支持本地开发 + TOS 生产
 *
 * 使用方式：
 *   # 1. 准备媒体文件，按 {courseId}.mp3 / {courseId}.jpg 命名放入目录
 *   # 2a. 本地开发 (零费用)：
 *        npx ts-node src/seed-media.ts ./media --local
 *        → URL 格式: http://localhost:3000/media/breathing-basics.mp3
 *
 *   # 2b. 生产环境 (需配置 TOS)：
 *        npx ts-node src/seed-media.ts ./media
 *        → 上传到 TOS 并更新数据库
 *
 *   # 3. 文件命名对应数据库中的课程 ID：
 *        breathing-basics.mp3 → courses.id = 'breathing-basics'
 *        body-scan.jpg        → courses.id = 'body-scan'
 *        jingxin.jpg          → instructors.id = 'jingxin'
 *        7day-intro.jpg       → series.id = '7day-intro'
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/better-sqlite3/driver'
import { eq } from 'drizzle-orm'
import Database from 'better-sqlite3'
import { createReadStream, readdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import * as schema from './db/schema'

const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'])
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

async function main() {
  const args = process.argv.slice(2)
  const mediaDir = args.find(a => !a.startsWith('--'))
  const isLocal = args.includes('--local')

  if (!mediaDir) {
    console.error('用法: npx ts-node src/seed-media.ts <media-directory> [--local]')
    console.error('示例: npx ts-node src/seed-media.ts ./media --local')
    process.exit(1)
  }

  const dbPath = process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL.slice(5)
    : resolve(__dirname, '..', 'data', 'meditation.db')
  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite, { schema })

  const files = readdirSync(resolve(mediaDir)).filter(f => {
    const dot = f.lastIndexOf('.')
    if (dot === -1) return false
    const ext = f.slice(dot).toLowerCase()
    return AUDIO_EXTS.has(ext) || IMAGE_EXTS.has(ext)
  })

  if (files.length === 0) {
    console.error(`❌ ${mediaDir} 中没有找到媒体文件`)
    console.error('   支持的格式: mp3, m4a, wav, ogg, aac, flac, jpg, jpeg, png, webp')
    process.exit(1)
  }

  console.log(`📁 找到 ${files.length} 个媒体文件\n`)

  // 本地开发模式：直接使用 localhost URL
  if (isLocal) {
    console.log('🔧 本地开发模式 (--local)')
    console.log(`   媒体 URL 前缀: http://localhost:3000/media/\n`)

    for (const name of files) {
      const dot = name.lastIndexOf('.')
      const ext = name.slice(dot).toLowerCase()
      const id = name.slice(0, dot)
      const url = `http://localhost:3000/media/${name}`
      const isAudio = AUDIO_EXTS.has(ext)

      console.log(`   ${name}`)

      const r1 = await db.update(schema.courses)
        .set(isAudio ? { audioUrl: url } : { coverUrl: url })
        .where(eq(schema.courses.id, id))

      if (r1.changes && r1.changes > 0) {
        console.log(`     ✅ 课程 "${id}" 已更新`)
      }

      if (!isAudio) {
        const r2 = await db.update(schema.series)
          .set({ coverUrl: url })
          .where(eq(schema.series.id, id))

        if (r2.changes && r2.changes > 0) {
          console.log(`     ✅ 系列 "${id}" 已更新`)
        }

        const r3 = await db.update(schema.instructors)
          .set({ avatarUrl: url })
          .where(eq(schema.instructors.id, id))

        if (r3.changes && r3.changes > 0) {
          console.log(`     ✅ 导师 "${id}" 已更新`)
        }
      }
    }

    console.log('\n✅ 本地媒体注册完成!')
    console.log('   启动后端: pnpm dev:server')
    console.log('   后端会自动提供 http://localhost:3000/media/* 的文件')
    sqlite.close()
    return
  }

  // TOS 生产模式
  const { S3Client } = await import('@aws-sdk/client-s3')
  const { Upload } = await import('@aws-sdk/lib-storage')

  const {
    TOS_ENDPOINT, TOS_ACCESS_KEY, TOS_SECRET_KEY, TOS_BUCKET, TOS_PUBLIC_URL, TOS_REGION,
  } = process.env

  if (!TOS_ENDPOINT || !TOS_ACCESS_KEY || !TOS_SECRET_KEY || !TOS_BUCKET) {
    console.error('❌ TOS 未配置。使用 --local 进行本地开发，或在 .env 中配置：')
    console.error('   TOS_ENDPOINT, TOS_ACCESS_KEY, TOS_SECRET_KEY, TOS_BUCKET')
    process.exit(1)
  }

  const s3 = new S3Client({
    endpoint: TOS_ENDPOINT,
    region: TOS_REGION || 'cn-north-1',
    credentials: { accessKeyId: TOS_ACCESS_KEY, secretAccessKey: TOS_SECRET_KEY },
    forcePathStyle: true,
  })

  console.log('☁️  TOS 生产模式\n')

  for (const name of files) {
    const dot = name.lastIndexOf('.')
    const ext = name.slice(dot).toLowerCase()
    const id = name.slice(0, dot)
    const filePath = resolve(mediaDir, name)
    const key = `meditation/${name}`

    const mimeMap: Record<string, string> = {
      '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav',
      '.ogg': 'audio/ogg', '.aac': 'audio/aac', '.flac': 'audio/flac',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.webp': 'image/webp',
    }

    console.log(`⬆  上传: ${name}`)

    await new Upload({
      client: s3,
      params: {
        Bucket: TOS_BUCKET,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: mimeMap[ext] || 'application/octet-stream',
      },
    }).done()

    const url = TOS_PUBLIC_URL
      ? `${TOS_PUBLIC_URL.replace(/\/+$/, '')}/${key}`
      : `${TOS_ENDPOINT}/${TOS_BUCKET}/${key}`

    console.log(`   ✅ ${url}`)

    const isAudio = AUDIO_EXTS.has(ext)

    const r1 = await db.update(schema.courses)
      .set(isAudio ? { audioUrl: url } : { coverUrl: url })
      .where(eq(schema.courses.id, id))

    if (r1.changes && r1.changes > 0) {
      console.log(`     📝 课程 "${id}" 已更新`)
    }

    if (!isAudio) {
      const r2 = await db.update(schema.series)
        .set({ coverUrl: url })
        .where(eq(schema.series.id, id))

      if (r2.changes && r2.changes > 0) {
        console.log(`     📝 系列 "${id}" 已更新`)
      }

      const r3 = await db.update(schema.instructors)
        .set({ avatarUrl: url })
        .where(eq(schema.instructors.id, id))

      if (r3.changes && r3.changes > 0) {
        console.log(`     📝 导师 "${id}" 已更新`)
      }
    }
  }

  console.log('\n✅ 上传完成!')
  sqlite.close()
}

main().catch((err) => {
  console.error('❌ 失败:', err)
  process.exit(1)
})
