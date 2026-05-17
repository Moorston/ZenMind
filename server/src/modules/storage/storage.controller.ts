import {
  Controller, Post, Body, HttpCode,
} from '@nestjs/common'
import { StorageService } from './storage.service'

class UploadUrlDto {
  url!: string
  key!: string
  bucket!: string
}

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  @HttpCode(200)
  async getUploadUrl(@Body() body: { key: string }): Promise<{ status: string; data: UploadUrlDto }> {
    const url = this.storageService.getPublicUrl(body.key)
    return {
      status: 'success',
      data: { url, key: body.key, bucket: process.env.TOS_BUCKET || '' },
    }
  }
}
