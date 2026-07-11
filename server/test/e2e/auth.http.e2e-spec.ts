import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createHttpTestApp, closeHttpTestApp } from './http-test-helper'

describe('Auth HTTP API (E2E)', () => {
  let app: any
  let sqlite: any

  beforeAll(async () => {
    const testApp = await createHttpTestApp()
    app = testApp.app
    sqlite = testApp.sqlite
  })

  afterAll(async () => {
    await closeHttpTestApp(app, sqlite)
  })

  it('GET /api/health should return OK', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
    expect(res.body.status).toBe('success')
  })

  it('POST /api/auth/send-code should return code', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/send-code')
      .send({ email: 'test@example.com' })
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data).toHaveProperty('code')
  })

  it('POST /api/auth/send-code should reject without email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/send-code')
      .send({})
      .expect(200)
    expect(res.body.status).toBe('error')
  })

  it('POST /api/auth/register should reject with invalid code', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'Pass123!', nickname: 'Test', code: '000000' })
      .expect(200)
    expect(res.body.status).toBe('error')
  })

  it('POST /api/auth/login should reject wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' })
      .expect(200)
    expect(res.body.status).toBe('error')
  })
})