import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createHttpTestApp, closeHttpTestApp } from './http-test-helper'
import { courses } from '@/db/schema/courses'

describe('Progress HTTP API (E2E)', () => {
  let app: any
  let db: any
  let sqlite: any

  beforeAll(async () => {
    const testApp = await createHttpTestApp()
    app = testApp.app
    db = testApp.db
    sqlite = testApp.sqlite

    // Seed course for progress tests
    db.insert(courses).values({
      id: 'http-progress-course', title: '进度测试课程', description: '测试',
      category: 'breathing', level: 'beginner', duration: 10,
      coverUrl: 'https://example.com/course.jpg', audioUrl: 'https://example.com/audio.mp3',
      tags: JSON.stringify(['测试']),
    }).run()
  })

  afterAll(async () => {
    await closeHttpTestApp(app, sqlite)
  })

  it('PUT /api/progress/:userId/:courseId should create progress', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/progress/test-user/http-progress-course')
      .send({ position: 60, completed: false })
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.position).toBe(60)
  })

  it('GET /api/progress/:userId should return user progress', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/progress/test-user')
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('POST /api/progress/:userId/:courseId/complete should mark complete', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/progress/test-user/http-progress-course/complete')
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.completed).toBe(true)
  })
})