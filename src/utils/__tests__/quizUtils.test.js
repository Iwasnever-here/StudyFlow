import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  buildQuizQuestions,
  calculatePercentage,
  shuffleArray,
} from '../quizUtils'

describe('quizUtils', () => {
  describe('shuffleArray', () => {
    it('returns a new array containing the same items', () => {
      const original = [1, 2, 3, 4]

      const shuffled =
        shuffleArray(original)

      expect(shuffled).toHaveLength(4)
      expect([...shuffled].sort()).toEqual(
        [...original].sort(),
      )

      expect(shuffled).not.toBe(original)
    })
  })

  describe('buildQuizQuestions', () => {
    it('builds quiz questions from valid flashcards', () => {
      const questions =
        buildQuizQuestions([
          {
            id: 1,
            front: 'A',
            back: 'Apple',
          },
          {
            id: 2,
            front: 'B',
            back: 'Ball',
          },
          {
            id: 3,
            front: 'C',
            back: 'Cat',
          },
          {
            id: 4,
            front: 'D',
            back: 'Dog',
          },
        ])

      expect(questions).toHaveLength(4)

      questions.forEach((question) => {
        expect(question.question).toBeTruthy()
        expect(
          question.options,
        ).toContain(
          question.correctAnswer,
        )
      })
    })

    it('ignores invalid cards and non-array input', () => {
      expect(
        buildQuizQuestions(null),
      ).toEqual([])

      expect(
        buildQuizQuestions([
          {
            id: 1,
            front: '',
            back: 'Answer',
          },
          {
            id: 2,
            front: 'Question',
            back: '',
          },
        ]),
      ).toEqual([])
    })
  })

  describe('calculatePercentage', () => {
    it('calculates percentages safely', () => {
      expect(
        calculatePercentage(3, 4),
      ).toBe(75)

      expect(
        calculatePercentage(0, 10),
      ).toBe(0)

      expect(
        calculatePercentage(5, 0),
      ).toBe(0)
    })
  })
})