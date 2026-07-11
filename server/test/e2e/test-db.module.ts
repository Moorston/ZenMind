import { resolve } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

// Generate a unique test DB path and set DATABASE_URL BEFORE any NestJS module imports
const testDbPath = resolve(tmpdir(), `zenmind-test-${randomUUID()}.db`)
process.env.DATABASE_URL = `file:${testDbPath}`

export { testDbPath }
