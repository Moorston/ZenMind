import { Injectable, Logger } from '@nestjs/common'
import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createReadStream } from 'fs'
import { sep } from 'path'
import { lookup } from 'mime-types'

export interface UploadResult {
  url: string
  key: string
  bucket: string
}

export interface TOSConfig {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrlBase: string
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private client: S3Client | null = null
  private config: TOSConfig | null = null

  /** 从环境变量加载 TOS 配置 */
  private loadConfig(): TOSConfig {
    const cfg: TOSConfig = {
      endpoint: process.env.TOS_ENDPOINT || '',
      region: process.env.TOS_REGION || 'cn-north-1',
      accessKeyId: process.env.TOS_ACCESS_KEY || '',
      secretAccessKey: process.env.TOS_SECRET_KEY || '',
      bucket: process.env.TOS_BUCKET || '',
      publicUrlBase: process.env.TOS_PUBLIC_URL || '',
    }

    if (!cfg.endpoint || !cfg.accessKeyId || !cfg.secretAccessKey || !cfg.bucket) {
      throw new Error(
        'TOS not configured. Set TOS_ENDPOINT, TOS_ACCESS_KEY, TOS_SECRET_KEY, TOS_BUCKET in .env'
      )
    }

    return cfg
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.config = this.loadConfig()
      this.client = new S3Client({
        endpoint: this.config.endpoint,
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
        forcePathStyle: true,
      })
    }
    return this.client
  }

  private getConfig(): TOSConfig {
    if (!this.config) this.getClient()
    return this.config!
  }

  /** 测试连接 */
  async testConnection(): Promise<boolean> {
    try {
      await this.getClient().send(new ListBucketsCommand({}))
      return true
    } catch {
      return false
    }
  }

  /**
   * 上传文件到 TOS
   * @param filePath 本地文件路径
   * @param key TOS 对象键 (如 `meditation/covers/breathing-basics.jpg`)
   * @param contentType MIME 类型 (自动检测)
   */
  async uploadFile(filePath: string, key: string, contentType?: string): Promise<UploadResult> {
    const cfg = this.getConfig()
    const mime = contentType || lookup(filePath) || 'application/octet-stream'

    const upload = new Upload({
      client: this.getClient(),
      params: {
        Bucket: cfg.bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: mime,
      },
    })

    await upload.done()

    const url = cfg.publicUrlBase
      ? `${cfg.publicUrlBase.replace(/\/+$/, '')}/${key}`
      : `${cfg.endpoint}/${cfg.bucket}/${key}`

    this.logger.log(`Uploaded: ${key} → ${url}`)
    return { url, key, bucket: cfg.bucket }
  }

  /**
   * 批量上传目录下的文件
   * @param dirPath 本地目录路径
   * @param prefix TOS key 前缀 (如 `meditation/covers/`)
   */
  async uploadDirectory(dirPath: string, prefix: string): Promise<UploadResult[]> {
    const { readdirSync, statSync } = await import('fs')
    const { resolve, relative, sep: pathSep } = await import('path')
    const results: UploadResult[] = []

    const walkDir = (currentDir: string) => {
      const entries = readdirSync(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = resolve(currentDir, entry.name)
        if (entry.isDirectory()) {
          walkDir(fullPath)
        } else if (entry.isFile()) {
          const relativePath = relative(dirPath, fullPath).replace(/\\/g, '/')
          const key = `${prefix.replace(/\/+$/, '')}/${relativePath}`
          results.push({ ...this.uploadFileSync(fullPath, key), originalPath: fullPath } as any)
        }
      }
    }

    walkDir(dirPath)
    return results
  }

  private uploadFileSync(filePath: string, key: string): UploadResult {
    // Synchronous wrapper — called from uploadDirectory which already
    // batches the work. Use uploadFile for async version.
    throw new Error('Use uploadFile() for async upload. uploadDirectory is not yet async-ready.')
  }

  /** 获取文件的公开访问 URL */
  getPublicUrl(key: string): string {
    const cfg = this.getConfig()
    if (cfg.publicUrlBase) {
      return `${cfg.publicUrlBase.replace(/\/+$/, '')}/${key}`
    }
    return `${cfg.endpoint}/${cfg.bucket}/${key}`
  }
}
