import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  findBestCandidate,
  getScheduleCandidates,
} from '../schedulerCandidates'

vi.mock(
  '../schedulerScoring',
  () => ({
    SCHEDULER_CONFIG: {
      dayStartMinutes: 540,
      dayEndMinutes: 1200,
      lunchStartMinutes: 720,
      lunchEndMinutes: 780,
      dinnerStartMinutes: 1050,
      dinnerEndMinutes: 1110,
      minimumSessionMinutes: 30,
      maximumSessionMinutes: 90,
      candidateStepMinutes: 15,
    },
  }),
)

describe('schedulerCandidates', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns no candidates for invalid input', () => {
    expect(
      getScheduleCandidates({
        assignment: {},
        remainingMinutes: 60,
        todayString: '2026-07-29',
      }),
    ).toEqual([])

    expect(
      getScheduleCandidates({
        assignment: {
          due_date: '2026-07-30',
        },
        remainingMinutes: 0,
        todayString: '2026-07-29',
      }),
    ).toEqual([])

    expect(
      getScheduleCandidates({
        assignment: {
          due_date: '2026-07-30',
        },
        remainingMinutes: 'invalid',
        todayString: '2026-07-29',
      }),
    ).toEqual([])
  })

  it('creates candidates between today and the due date', () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        8,
        0,
      ),
    )

    const candidates =
      getScheduleCandidates({
        assignment: {
          due_date: '2026-07-30',
        },
        remainingMinutes: 60,
        blocks: [],
        todayString: '2026-07-29',
      })

    expect(
      candidates.length,
    ).toBeGreaterThan(0)

    expect(candidates[0]).toEqual({
      date: '2026-07-29',
      startMinutes: 540,
      endMinutes: 600,
      duration: 60,
    })

    expect(
      candidates.some(
        (candidate) =>
          candidate.date ===
          '2026-07-30',
      ),
    ).toBe(true)
  })

  it('does not schedule over existing timetable blocks', () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        8,
        0,
      ),
    )

    const candidates =
      getScheduleCandidates({
        assignment: {
          due_date: '2026-07-29',
        },
        remainingMinutes: 60,
        todayString: '2026-07-29',
        blocks: [
          {
            block_date:
              '2026-07-29',
            start_time:
              '09:00:00',
            end_time:
              '10:00:00',
          },
        ],
      })

    expect(candidates[0]).toEqual({
      date: '2026-07-29',
      startMinutes: 600,
      endMinutes: 660,
      duration: 60,
    })
  })

  it('supports nested timeBlock timetable records', () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        8,
        0,
      ),
    )

    const candidates =
      getScheduleCandidates({
        assignment: {
          due_date: '2026-07-29',
        },
        remainingMinutes: 60,
        todayString: '2026-07-29',
        blocks: [
          {
            id: 1,
            timeBlock: {
              block_date:
                '2026-07-29',
              start_time:
                '09:00:00',
              end_time:
                '11:00:00',
            },
          },
        ],
      })

    expect(candidates[0]).toEqual({
      date: '2026-07-29',
      startMinutes: 660,
      endMinutes: 720,
      duration: 60,
    })
  })

  it('avoids fixed lunch and dinner breaks', () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        11,
        45,
      ),
    )

    const candidates =
      getScheduleCandidates({
        assignment: {
          due_date: '2026-07-29',
        },
        remainingMinutes: 60,
        todayString: '2026-07-29',
        blocks: [],
      })

    expect(candidates[0]).toEqual({
      date: '2026-07-29',
      startMinutes: 780,
      endMinutes: 840,
      duration: 60,
    })

    expect(
      candidates.some(
        (candidate) =>
          candidate.startMinutes <
            780 &&
          candidate.endMinutes > 720,
      ),
    ).toBe(false)

    expect(
      candidates.some(
        (candidate) =>
          candidate.startMinutes <
            1110 &&
          candidate.endMinutes > 1050,
      ),
    ).toBe(false)
  })

  it('rounds today forward and returns the first candidate as best', () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        10,
        7,
      ),
    )

    const bestCandidate =
      findBestCandidate({
        assignment: {
          due_date: '2026-07-29',
        },
        remainingMinutes: 45,
        blocks: [],
        todayString: '2026-07-29',
      })

    expect(bestCandidate).toEqual({
      date: '2026-07-29',
      startMinutes: 615,
      endMinutes: 660,
      duration: 45,
    })
  })
})