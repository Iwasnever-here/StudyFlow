import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  getLectureCollections,
  hasCompleteTimeBlock,
  mergeLectureWithBlock,
  mergeLecturesWithBlocks,
  prepareLectureValues,
} from '../lectureHelpers'

import {
  getNextLecture,
  sortLectures,
} from '../../utils/lectureSchedule'

vi.mock(
  '../../utils/lectureSchedule',
  () => ({
    getNextLecture: vi.fn(),
    sortLectures: vi.fn(
      (lectures) => lectures,
    ),
  }),
)

describe('lectureHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    sortLectures.mockImplementation(
      (lectures) => lectures,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('prepares and normalises lecture values', () => {
    const result =
      prepareLectureValues({
        title: '  Demand Theory  ',
        lecture_url:
          '  https://example.com  ',
        week_number: '2',
        estimated_minutes: '75',
      })

    expect(result).toEqual({
      title: 'Demand Theory',
      lectureUrl:
        'https://example.com',
      weekNumber: 2,
      estimatedMinutes: 75,
    })
  })

  it('uses defaults for optional lecture values', () => {
    const result =
      prepareLectureValues(
        {
          title: 'Introduction',
          lecture_url: '   ',
          week_number: '',
          estimated_minutes: '',
        },
        120,
      )

    expect(result).toEqual({
      title: 'Introduction',
      lectureUrl: null,
      weekNumber: null,
      estimatedMinutes: 120,
    })
  })

  it.each([
    {
      formData: {
        title: '   ',
      },
      message:
        'Please enter a lecture title.',
    },
    {
      formData: {
        title: 'Lecture',
        week_number: '0',
      },
      message:
        'Week number must be at least 1.',
    },
    {
      formData: {
        title: 'Lecture',
        week_number: 'invalid',
      },
      message:
        'Week number must be at least 1.',
    },
  ])(
    'validates invalid lecture values: $message',
    ({ formData, message }) => {
      expect(() =>
        prepareLectureValues(formData),
      ).toThrow(message)
    },
  )

  it('checks whether a complete time block exists', () => {
    expect(
      hasCompleteTimeBlock({
        block_date: '2026-08-01',
        start_time: '10:00',
        end_time: '11:00',
      }),
    ).toBe(true)

    expect(
      hasCompleteTimeBlock({
        block_date: '2026-08-01',
        start_time: '',
        end_time: '11:00',
      }),
    ).toBe(false)
  })

  it('merges lectures with matching timetable blocks', () => {
    const lectures = [
      {
        id: 1,
        title: 'Demand',
      },
      {
        id: 2,
        title: 'Supply',
      },
    ]

    const blocks = [
      {
        id: 10,
        lecture_id: 1,
        block_date: '2026-08-01',
      },
      {
        id: 11,
        lecture_id: null,
      },
    ]

    const result =
      mergeLecturesWithBlocks(
        lectures,
        blocks,
      )

    expect(result).toEqual([
      {
        id: 1,
        title: 'Demand',
        timeBlock: blocks[0],
      },
      {
        id: 2,
        title: 'Supply',
        timeBlock: null,
      },
    ])

    expect(
      sortLectures,
    ).toHaveBeenCalledWith(
      expect.any(Array),
    )
  })

  it('merges one lecture with one timetable block', () => {
    const lecture = {
      id: 1,
      title: 'Demand',
    }

    const timeBlock = {
      id: 10,
      lecture_id: 1,
    }

    expect(
      mergeLectureWithBlock(
        lecture,
        timeBlock,
      ),
    ).toEqual({
      ...lecture,
      timeBlock,
    })
  })

  it('builds completed, upcoming and next lecture collections', () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        '2026-08-01T10:00:00',
      ),
    )

    const lectures = [
      {
        id: 1,
        completed: true,
        timeBlock: {
          block_date: '2026-08-01',
          start_time: '09:00',
        },
      },
      {
        id: 2,
        completed: false,
        timeBlock: {
          block_date: '2026-08-01',
          start_time: '11:00',
        },
      },
      {
        id: 3,
        completed: false,
        timeBlock: null,
      },
    ]

    getNextLecture.mockReturnValue(
      lectures[1],
    )

    const result =
      getLectureCollections(lectures)

    expect(
      getNextLecture,
    ).toHaveBeenCalledWith(
      lectures,
    )

    expect(result).toEqual({
      nextLecture: lectures[1],
      completedLectures: [
        lectures[0],
      ],
      upcomingLectures: [
        lectures[1],
      ],
    })
  })
})