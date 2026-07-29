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

import useDashboard from '../useDashboard'
import useTodos from '../useTodos'
import useTimetable from '../useTimetable'
import useCoursework from '../useCoursework'
import useFlashcardSets from '../useFlashcardSets'

import {
  getClassForItem,
  getClassMap,
  getLocalDateString,
  timeToMinutes,
} from '../../utils/dashboardUtils'

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

vi.mock(
  '../../utils/dashboardUtils',
  () => ({
    getClassMap: vi.fn(),
    getClassForItem: vi.fn(),
    getLocalDateString: vi.fn(),
    timeToMinutes: vi.fn(),
  }),
)

const completeTodo = vi.fn()

const classMap = new Map([
  [
    '1',
    {
      id: 1,
      name: 'Economics',
    },
  ],
  [
    '2',
    {
      id: 2,
      name: 'Finance',
    },
  ],
])

const todos = [
  {
    id: 1,
    title: 'Read chapter',
    due_date: '2026-07-29',
    class_id: 1,
    completed: false,
  },
  {
    id: 2,
    title: 'Complete notes',
    due_date: '2026-07-29',
    class_id: 2,
    completed: false,
  },
  {
    id: 3,
    title: 'Completed todo',
    due_date: '2026-07-29',
    class_id: 1,
    completed: true,
  },
  {
    id: 4,
    title: 'Tomorrow todo',
    due_date: '2026-07-30',
    class_id: 1,
    completed: false,
  },
]

const blocks = [
  {
    id: 1,
    title: 'Past lecture',
    class_id: 1,
    block_date: '2026-07-29',
    start_time: '09:00',
    end_time: '10:00',
  },
  {
    id: 2,
    title: 'Afternoon study',
    class_id: 2,
    block_date: '2026-07-29',
    start_time: '15:00',
    end_time: '16:00',
  },
  {
    id: 3,
    title: 'Lunch lecture',
    class_id: 1,
    block_date: '2026-07-29',
    start_time: '13:00',
    end_time: '14:00',
  },
  {
    id: 4,
    title: 'Tomorrow block',
    class_id: 1,
    block_date: '2026-07-30',
    start_time: '10:00',
    end_time: '11:00',
  },
]

const coursework = [
  {
    id: 1,
    title: 'Essay',
    class_id: 1,
    due_date: '2026-07-30',
    status: 'in progress',
  },
  {
    id: 2,
    title: 'Finance report',
    class_id: 2,
    due_date: '2026-07-29',
    status: 'not started',
  },
  {
    id: 3,
    title: 'Presentation',
    class_id: 1,
    due_date: '2026-08-05',
    status: 'not started',
  },
  {
    id: 4,
    title: 'Completed work',
    class_id: 1,
    due_date: '2026-07-31',
    status: 'completed',
  },
  {
    id: 5,
    title: 'Old assignment',
    class_id: 2,
    due_date: '2026-07-20',
    status: 'not started',
  },
  {
    id: 6,
    title: 'Later assignment',
    class_id: 1,
    due_date: '2026-08-10',
    status: 'not started',
  },
]

const flashcardSets = [
  {
    id: 1,
    title: 'Microeconomics',
    class_id: 1,
    flashcards: [
      {
        id: 1,
      },
      {
        id: 2,
      },
    ],
  },
  {
    id: 2,
    title: 'Finance basics',
    class_id: 2,
    flashcards: [
      {
        id: 3,
      },
    ],
  },
  {
    id: 3,
    title: 'Macroeconomics',
    class_id: 1,
    flashcards: [],
  },
  {
    id: 4,
    title: 'Extra set',
    class_id: 2,
    flashcards: [
      {
        id: 4,
      },
    ],
  },
]

const todoClasses = [
  {
    id: 1,
    name: 'Economics',
  },
]

const timetableClasses = [
  {
    id: 2,
    name: 'Finance',
  },
]

const courseworkClasses = [
  {
    id: 1,
    name: 'Economics',
  },
]

const flashcardClasses = [
  {
    id: 2,
    name: 'Finance',
  },
]

const mockHooks = ({
  todosValue = todos,
  blocksValue = blocks,
  courseworkValue = coursework,
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
    classes: todoClasses,
    loading: todosLoading,
    pageError: todosError,
    completeTodo,
  })

  useTimetable.mockReturnValue({
    blocks: blocksValue,
    classes: timetableClasses,
    loading: timetableLoading,
    pageError: timetableError,
  })

  useCoursework.mockReturnValue({
    coursework: courseworkValue,
    classes: courseworkClasses,
    loading: courseworkLoading,
    error: courseworkError,
  })

  useFlashcardSets.mockReturnValue({
    flashcardSets: flashcardSetsValue,
    classes: flashcardClasses,
    loading: flashcardsLoading,
    error: flashcardsError,
  })
}

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getLocalDateString
      .mockReturnValue(
        '2026-07-29',
      )

    getClassMap
      .mockReturnValue(classMap)

    getClassForItem
      .mockImplementation(
        (item) =>
          classMap.get(
            String(item.class_id),
          ) || null,
      )

    timeToMinutes
      .mockImplementation((time) => {
        const [
          hours,
          minutes,
        ] = time
          .split(':')
          .map(Number)

        return (
          hours * 60 +
          minutes
        )
      })

    mockHooks()
  })

  it('builds a class map from all child hook classes', () => {
    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    renderHook(() =>
      useDashboard(currentDate),
    )

    expect(
      getClassMap,
    ).toHaveBeenCalledWith([
      todoClasses,
      timetableClasses,
      courseworkClasses,
      flashcardClasses,
    ])
  })

  it('returns incomplete todos due today sorted by title', () => {
    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current.todaysTodos.map(
        (todo) => todo.id,
      ),
    ).toEqual([2, 1])

    expect(
      result.current
        .todaysTodos[0]
        .classItem,
    ).toEqual({
      id: 2,
      name: 'Finance',
    })

    expect(
      result.current
        .todaysTodos.some(
          (todo) => todo.id === 3,
        ),
    ).toBe(false)
  })

  it('returns only remaining blocks for today sorted by start time', () => {
    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current
        .remainingBlocks.map(
          (block) => block.id,
        ),
    ).toEqual([3, 2])

    expect(
      result.current
        .remainingBlocks[0]
        .classItem,
    ).toEqual({
      id: 1,
      name: 'Economics',
    })

    expect(
      result.current
        .remainingBlocks.some(
          (block) => block.id === 1,
        ),
    ).toBe(false)

    expect(
      result.current
        .remainingBlocks.some(
          (block) => block.id === 4,
        ),
    ).toBe(false)
  })

  it('returns the next three incomplete coursework items', () => {
    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current
        .upcomingCoursework.map(
          (assignment) =>
            assignment.id,
        ),
    ).toEqual([2, 1, 3])

    expect(
      result.current
        .upcomingCoursework[0]
        .classItem,
    ).toEqual({
      id: 2,
      name: 'Finance',
    })

    expect(
      result.current
        .upcomingCoursework,
    ).toHaveLength(3)

    expect(
      result.current
        .upcomingCoursework.some(
          (assignment) =>
            assignment.id === 4,
        ),
    ).toBe(false)

    expect(
      result.current
        .upcomingCoursework.some(
          (assignment) =>
            assignment.id === 5,
        ),
    ).toBe(false)
  })

  it('returns the first three flashcard sets with card counts', () => {
    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current.flashcardSets,
    ).toEqual([
      {
        ...flashcardSets[0],
        classItem: {
          id: 1,
          name: 'Economics',
        },
        cardCount: 2,
      },
      {
        ...flashcardSets[1],
        classItem: {
          id: 2,
          name: 'Finance',
        },
        cardCount: 1,
      },
      {
        ...flashcardSets[2],
        classItem: {
          id: 1,
          name: 'Economics',
        },
        cardCount: 0,
      },
    ])
  })

  it('returns completeTodo from the todo hook', () => {
    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current.completeTodo,
    ).toBe(completeTodo)
  })

  it('reports loading when any child hook is loading', () => {
    mockHooks({
      courseworkLoading: true,
    })

    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

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

    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current.error,
    ).toBe(
      'Unable to load todos.',
    )
  })

  it('returns empty dashboard sections when there is no data', () => {
    mockHooks({
      todosValue: [],
      blocksValue: [],
      courseworkValue: [],
      flashcardSetsValue: [],
    })

    const currentDate =
      new Date(
        2026,
        6,
        29,
        12,
        30,
      )

    const { result } =
      renderHook(() =>
        useDashboard(currentDate),
      )

    expect(
      result.current.todaysTodos,
    ).toEqual([])

    expect(
      result.current
        .remainingBlocks,
    ).toEqual([])

    expect(
      result.current
        .upcomingCoursework,
    ).toEqual([])

    expect(
      result.current.flashcardSets,
    ).toEqual([])

    expect(
      result.current.loading,
    ).toBe(false)

    expect(
      result.current.error,
    ).toBeNull()
  })
})