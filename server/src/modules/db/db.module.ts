import { Global, Module, OnApplicationShutdown } from '@nestjs/common'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3/driver'
import Database from 'better-sqlite3'
import { resolve } from 'path'
import * as schema from '@/db/schema'

export const DRIZZLE = 'DRIZZLE'

function getDbPath(): string {
  const url = process.env.DATABASE_URL || ''
  if (url.startsWith('file:')) return url.slice(5)
  if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/')) return resolve(url)
  if (url.includes(':') && !url.includes('\\')) {
    // Looks like postgres:// — fall back to local file
    console.warn('[DbModule] DATABASE_URL appears to be PostgreSQL; using local SQLite fallback')
    return resolve(__dirname, '..', '..', '..', 'data', 'meditation.db')
  }
  return resolve(url || __dirname, '..', '..', '..', 'data', 'meditation.db')
}

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const dbPath = getDbPath()
        console.log(`[DbModule] SQLite database: ${dbPath}`)
        const sqlite = new Database(dbPath)
        sqlite.pragma('journal_mode = WAL')
        sqlite.pragma('foreign_keys = ON')
        return drizzle(sqlite, { schema }) as BetterSQLite3Database<typeof schema>
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    console.log(`[DbModule] Shutting down (signal: ${signal})`)
  }
}
