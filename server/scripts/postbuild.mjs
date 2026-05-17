import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
let count = 0

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.cjs')) {
      let content = readFileSync(full, 'utf8')
      if (!content.includes('@/')) continue
      content = content.replace(/require\("@\/([^"]+)"\)/g, (_, p) => {
        const rel = './' + relative(dirname(full), join(distDir, p)).replace(/\\/g, '/')
        return `require("${rel}")`
      })
      content = content.replace(/from "@\/([^"]+)"/g, (_, p) => {
        const rel = './' + relative(dirname(full), join(distDir, p)).replace(/\\/g, '/')
        return `from "${rel}"`
      })
      writeFileSync(full, content, 'utf8')
      count++
    }
  }
}

walk(distDir)
console.log(`Post-build: resolved @/ aliases in ${count} files`)
