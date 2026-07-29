import {
  renderHook,
} from '@testing-library/react'

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import useReview from '../useReview'
import useTodos from '../useTodos'
import useTimetable from '../useTimetable'
import useCoursework from '../useCoursework'
import useFlashcardSets from '../useFlashcardSets'

vi.mock('../useTodos', () => ({
  default: vi.fn(),
}))

vi.mock('../useTimetable', () => ({
  default: vi.fn(),
}))

vi.mock('../useCoursework', () => ({
  default: vi.fn(),
}))

vi.mock('../useFlashcardSets', () => ({
  default: vi.fn(),
}))

vi.mock('../hookUtils', () => ({
  formatLocalDate: vi.fn(
    (date) => {
      const year =
        date.getFullYear()

      const month = String(
        date.getMonth() + 1,
      ).padStart(2, '0')

      const day = String(
        date.getDate(),
      ).padStart(2, '0')

      return `${year}-${month}-${day}`
    },
  ),
}))

const todos = [
  {
    id: 1,
    title: 'Overdue todo',
    due_date: '2026-07-27',
    completed: false,
  },
  {
    id: 2,
    title: 'Today todo',
    due_date: '2026-07-29',
    completed: false,
  },
  {
    id: 3,
    title: 'Completed todo',
    due_date: '2026-07-25',
    completed: true,
  },
]

const blocks = [
  {
    id: 1,
    block_date: '2026-07-27',
    start_time: '09:00',
    end_time: '10:30',
  },
  {
    id: 2,
    block_date: '2026-07-30',
    start_time: '14:00',
    end_time: '15:00',
  },
  {
    id: 3,
    block_date: '2026-08-10',
    start_time: '10:00',
    end_time: '12:00',
  },
]

const classes = [
  {
    id: 1,
    name: 'Economics',
  },
  {
    id: 2,
    name: 'Finance',
  },
]

const coursework = [
  {
    id: 1,
    class_id: 1,
    title: 'Completed essay',
    status: 'completed',
    due_date: '2026-07-20',
    grade: 80,
    hours: 2,
  },
  {
    id: 2,
    class_id: 1,
    title: 'Submitted report',
    status: 'submitted',
    due_date: '2026-07-28',
    grade: 70,
    hours: 3,
  },
  {
    id: 3,
    class_id: 1,
    title: 'Late assignment',
    status: 'in progress',
    due_date: '2026-07-25',
    grade: null,
    hours: 4.5,
  },
  {
    id: 4,
    class_id: 2,
    title: 'Future assignment',
    status: 'not started',
    due_date: '2026-08-05',
    grade: '',
    hours: 2,
  },
]

const flashcardSets = [
  {
    id: 1,
    class_id: 1,
    flashcards: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  {
    id: 2,
    class_id: 1,
    flashcards: [
      { id: 4 },
    ],
  },
  {
    id: 3,
    class_id: 2,
    flashcards: [
      { id: 5 },
      { id: 6 },
    ],
  },
]

const mockHooks = ({
  todosValue = todos,
  blocksValue = blocks,
  courseworkValue = coursework,
  classesValue = classes,
  flashcardSetsValue = flashcardSets,
  todosLoading = false,
  timetableLoading = false,
  courseworkLoading = false,
  flashcardsLoading = false,
  todosError = null,
  timetableError = null,
  courseworkError = null,
  flashcardsError = null,
} = {}) => {
  useTodos.mockReturnValue({
    todos: todosValue,
    loading: todosLoading,
    pageError: todosError,
  })

  useTimetable.mockReturnValue({
    blocks: blocksValue,
    loading: timetableLoading,
    pageError: timetableError,
  })

  useCoursework.mockReturnValue({
    coursework: courseworkValue,
    classes: classesValue,
    loading: courseworkLoading,
    error: courseworkError,
  })

  useFlashcardSets.mockReturnValue({
    flashcardSets:
      flashcardSetsValue,
    loading: flashcardsLoading,
    error: flashcardsError,
  })
}

describe('useReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        10,
        0,
      ),
    )

    mockHooks()
  })

  it('builds the overall review summary', () => {
    const { result } =
      renderHook(() => useReview())

    expect(
      result.current.summary,
    ).toEqual({
      courseworkProgress: 50,
      completedCoursework: 2,
      totalCoursework: 4,
      averageGrade: 75,
      activeTodos: 2,
      totalFlashcards: 6,
      scheduledHours: 2.5,
    })
  })

  it('returns overdue coursework and todos', () => {
    const { result } =
      renderHook(() => useReview())

    expect(
      result.current
        .overdueCoursework.map(
          (assignment) =>
            assignment.id,
        ),
    ).toEqual([3])

    expect(
      result.current
        .overdueTodos.map(
          (todo) => todo.id,
        ),
    ).toEqual([1])
  })

  it('calculates class progress and sorts by progress', () => {
    const { result } =
      renderHook(() => useReview())

    expect(
      result.current.classProgress,
    ).toEqual([
      {
        id: 1,
        name: 'Economics',
        courseworkCount: 3,
        completedCount: 2,
        progress: 67,
        averageGrade: 75,
        flashcardCount: 4,
        remainingHours: 4.5,
      },
      {
        id: 2,
        name: 'Finance',
        courseworkCount: 1,
        completedCount: 0,
        progress: 0,
        averageGrade: null,
        flashcardCount: 2,
        remainingHours: 2,
      },
    ])
  })

  it('handles empty review data', () => {
    mockHooks({
      todosValue: [],
      blocksValue: [],
      courseworkValue: [],
      classesValue: [],
      flashcardSetsValue: [],
    })

    const { result } =
      renderHook(() => useReview())

    expect(
      result.current.summary,
    ).toEqual({
      courseworkProgress: 0,
      completedCoursework: 0,
      totalCoursework: 0,
      averageGrade: null,
      activeTodos: 0,
      totalFlashcards: 0,
      scheduledHours: 0,
    })

    expect(
      result.current.classProgress,
    ).toEqual([])

    expect(
      result.current
        .overdueCoursework,
    ).toEqual([])

    expect(
      result.current.overdueTodos,
    ).toEqual([])
  })

  it('reports loading when any child hook is loading', () => {
    mockHooks({
      timetableLoading: true,
    })

    const { result } =
      renderHook(() => useReview())

    expect(
      result.current.loading,
    ).toBe(true)
  })

  it('returns the first available child hook error', () => {
    mockHooks({
      todosError:
        'Unable to load todos.',
      timetableError:
        'Unable to load timetable.',
      courseworkError:
        'Unable to load coursework.',
    })

    const { result } =
      renderHook(() => useReview())

    expect(
      result.current.error,
    ).toBe(
      'Unable to load todos.',
    )
  })
})