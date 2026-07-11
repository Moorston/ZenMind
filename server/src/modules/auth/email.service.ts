import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  sendVerificationCode(email: string, code: string): boolean {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    if (!host || !user || !pass) {
      this.logger.warn(`SMTP not configured. Would send code ${code} to ${email}`)
      return false
    }

    const html = `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;padding:40px 20px;">
        <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:32px;margin-bottom:8px;">🧘</div>
            <h1 style="margin:0;font-size:24px;color:#1a1a2e;font-weight:700;">ZenMind</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">尘间静 · 冥想助手</p>
          </div>
          <div style="background:#f0f4ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">您的验证码</p>
            <div style="font-size:36px;font-weight:700;color:#7c6aef;letter-spacing:8px;font-family:monospace;">${code}</div>
          </div>
          <p style="font-size:14px;color:#374151;line-height:1.6;margin-bottom:16px;">请在 10 分钟内使用此验证码完成操作。</p>
          <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:12px;color:#991b1b;line-height:1.5;">⚠️ 如非本人操作，请忽略此邮件。</p>
          </div>
        </div>
      </div>
    `

    try {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
      transporter.sendMail({ from: `"ZenMind" <${user}>`, to: email, subject: '【ZenMind】验证码', html, text: `您的验证码是：${code}\n\n10 分钟内有效。` })
      return true
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}:`, err)
      return false
    }
  }
}