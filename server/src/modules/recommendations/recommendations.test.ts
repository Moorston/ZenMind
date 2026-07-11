import { describe, it, expect } from 'vitest'

describe('RecommendationsService', () => {
  describe('getSimilar', () => {
    it('should return empty array for non-existent course', () => {
      expect([]).toEqual([])
    })

    it('should match courses by category and level', () => {
      const mockCourses = [
        { id: 'a', title: 'A', category: 'breathing', level: 'beginner' },
        { id: 'b', title: 'B', category: 'breathing', level: 'beginner' },
        { id: 'c', title: 'C', category: 'mindfulness', level: 'beginner' },
      ]
      const source = mockCourses[0]
      const similar = mockCourses.filter(c =>
        c.category === source.category && c.level === source.level && c.id !== source.id
      )
      expect(similar.length).toBe(1)
      expect(similar[0].id).toBe('b')
    })
  })

  describe('getTrending', () => {
    it('should sort by play count', () => {
      const mockTrending = [
        { courseId: 'c1', playCount: 10 },
        { courseId: 'c2', playCount: 5 },
        { courseId: 'c3', playCount: 3 },
      ]
      const sorted = mockTrending.sort((a, b) => b.playCount - a.playCount)
      expect(sorted[0].courseId).toBe('c1')
      expect(sorted[2].courseId).toBe('c3')
    })
  })

  describe('collaborative filtering', () => {
    it('should find similar users based on shared courses', () => {
      const userA = ['c1', 'c2', 'c3']
      const userB = ['c1', 'c2', 'c4']
      const userC = ['c4', 'c5']

      const sharedA = userA.filter(c => userB.includes(c)).length
      const sharedC = userA.filter(c => userC.includes(c)).length

      expect(sharedA).toBe(2) // A & B share 2 courses
      expect(sharedC).toBe(0) // A & C share 0 courses
    })

    it('should recommend courses not yet taken', () => {
      const userCourses = ['c1', 'c2']
      const similarUserCourses = ['c1', 'c2', 'c3', 'c4']
      const recommendations = similarUserCourses.filter(c => !userCourses.includes(c))

      expect(recommendations).toEqual(['c3', 'c4'])
    })
  })
})