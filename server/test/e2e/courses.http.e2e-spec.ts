import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createHttpTestApp, closeHttpTestApp } from './http-test-helper'
import { instructors } from '@/db/schema/instructors'
import { series } from '@/db/schema/series'
import { courses } from '@/db/schema/courses'

describe('Courses HTTP API (E2E)', () => {
  let app: any
  let db: any
  let sqlite: any

  beforeAll(async () => {
    const testApp = await createHttpTestApp()
    app = testApp.app
    db = testApp.db
    sqlite = testApp.sqlite

    // Seed test data
    db.insert(instructors).values({
      id: 'http-test-instr', name: 'HTTP测试导师',
      avatarUrl: 'https://example.com/avatar.jpg', bio: '测试', voiceType: 'gentle',
    }).run()

    db.insert(series).values({
      id: 'http-test-series', title: 'HTTP测试系列', description: '测试',
      coverUrl: 'https://example.com/cover.jpg', level: 'beginner', estimatedDays: 7,
      isRecommended: true, order: 1,
    }).run()

    db.insert(courses).values({
      id: 'http-test-course', title: 'HTTP测试课程', description: '测试课程描述',
      category: 'breathing', level: 'beginner', duration: 10,
      coverUrl: 'https://example.com/course.jpg', audioUrl: 'https://example.com/audio.mp3',
      tags: JSON.stringify(['测试']), instructorId: 'http-test-instr', seriesId: 'http-test-series',
      orderInSeries: 1,
    }).run()
  })

  afterAll(async () => {
    await closeHttpTestApp(app, sqlite)
  })

  it('GET /api/courses should return courses', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/courses')
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('GET /api/courses/:id should return a course', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/courses/http-test-course')
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.id).toBe('http-test-course')
  })

  it('GET /api/series should return series', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/series')
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('GET /api/instructors should return instructors', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/instructors')
      .expect(200)
    expect(res.body.status).toBe('success')
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })
})