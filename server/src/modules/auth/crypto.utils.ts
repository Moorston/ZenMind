import * as crypto from 'crypto'

const ENCRYPTION_KEY = process.env.OPENID_ENCRYPTION_KEY
const SALT = process.env.OPENID_ENCRYPTION_SALT

if (!ENCRYPTION_KEY) {
  throw new Error('OPENID_ENCRYPTION_KEY environment variable is required')
}
if (!SALT) {
  throw new Error('OPENID_ENCRYPTION_SALT environment variable is required')
}

// 启动时派生一次密钥，后续复用
const DERIVED_KEY: Buffer = crypto.scryptSync(ENCRYPTION_KEY, SALT, 32)

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', DERIVED_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedData: string): string {
  const [ivHex, data] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', DERIVED_KEY, iv)
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function tryDecrypt(encryptedData: string): string | null {
  try {
    return decrypt(encryptedData)
  } catch {
    return null
  }
}