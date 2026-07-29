import {
  act,
  renderHook,
  waitFor,
} from '@testing-library/react'

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import useClassDetails from '../useClassDetails'
import useClasses from '../useClasses'
import useClassLectures from '../useClassLectures'

const mockFrom = vi.fn()
const mockFetchClassById = vi.fn()
const mockUpdateClass = vi.fn()
const mockFetchLectures = vi.fn()
const mockCreateLecture = vi.fn()
const mockUpdateLecture = vi.fn()
const mockToggleLectureComplete = vi.fn()
const mockDeleteLecture = vi.fn()

vi.mock(
  '../../lib/supabaseClient',
  () => ({
    supabase: {
      from: (...args) =>
        mockFrom(...args),
    },
  }),
)

vi.mock('../useClasses', () => ({
  default: vi.fn(),
}))

vi.mock('../useClassLectures', () => ({
  default: vi.fn(),
}))

const testClass = {
  id: 5,
  user_id: 'user-1',
  name: 'Economics',
  code: 'EC101',
  lecturer: 'Dr Smith',
  color: '#26371f',
  target_grade: 70,
  credits: 20,
}

const assignments = [
  {
    id: 1,
    class_id: 5,
    title: 'Essay',
    status: 'In Progress',
    due_date: '2099-08-10',
    grade: null,
    weight: 40,
  },
  {
    id: 2,
    class_id: 5,
    title: 'Presentation',
    status: ' completed ',
    due_date: '2099-08-15',
    grade: 80,
    weight: 30,
  },
  {
    id: 3,
    class_id: 5,
    title: 'Exam',
    status: 'Completed',
    due_date: '2099-08-20',
    grade: 70,
    weight: 70,
  },
]

const lectures = [
  {
    id: 1,
    title: 'Demand',
    completed: false,
  },
  {
    id: 2,
    title: 'Supply',
    completed: true,
  },
]

const completedLectures = [
  lectures[1],
]

const upcomingLectures = [
  lectures[0],
]

const createQuery = ({
  data = null,
  error = null,
  count = null,
} = {}) => {
  const result = {
    data,
    error,
    count,
  }

  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    then: (
      resolve,
      reject,
    ) =>
      Promise.resolve(result).then(
        resolve,
        reject,
      ),
  }

  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.order.mockReturnValue(query)

  return query
}

const setupSupabaseQueries = ({
  assignmentData = assignments,
  assignmentError = null,
  flashcardCount = 12,
  flashcardError = null,
} = {}) => {
  const assignmentQuery =
    createQuery({
      data: assignmentData,
      error: assignmentError,
    })

  const flashcardQuery =
    createQuery({
      count: flashcardCount,
      error: flashcardError,
    })

  mockFrom.mockImplementation(
    (table) => {
      if (table === 'assignments') {
        return assignmentQuery
      }

      if (table === 'flashcards') {
        return flashcardQuery
      }

      throw new Error(
        `Unexpected table: ${table}`,
      )
    },
  )

  return {
    assignmentQuery,
    flashcardQuery,
  }
}

const setupHookMocks = ({
  lecturesLoading = false,
  lecturesError = null,
} = {}) => {
  useClasses.mockReturnValue({
    fetchClassById:
      mockFetchClassById,
    updateClass: mockUpdateClass,
  })

  useClassLectures.mockReturnValue({
    lectures,
    nextLecture: lectures[0],
    completedLectures,
    upcomingLectures,
    loading: lecturesLoading,
    error: lecturesError,
    fetchLectures:
      mockFetchLectures,
    createLecture:
      mockCreateLecture,
    updateLecture:
      mockUpdateLecture,
    toggleLectureComplete:
      mockToggleLectureComplete,
    deleteLecture:
      mockDeleteLecture,
  })
}

const renderLoadedHook = async (
  classId = 5,
) => {
  const hook = renderHook(() =>
    useClassDetails(classId),
  )

  await waitFor(() => {
    expect(
      hook.result.current.loading,
    ).toBe(false)
  })

  return hook
}

describe('useClassDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()

    mockFetchClassById
      .mockResolvedValue(testClass)

    mockFetchLectures
      .mockResolvedValue(lectures)

    mockUpdateClass
      .mockResolvedValue(testClass)

    setupHookMocks()
    setupSupabaseQueries()
  })

  it('fetches the class, assignments, flashcards and lectures', async () => {
    const {
      result,
    } = await renderLoadedHook()

    expect(
      useClasses,
    ).toHaveBeenCalledWith({
      fetchOnMount: false,
    })

    expect(
      useClassLectures,
    ).toHaveBeenCalledWith(
      5,
      {
        fetchOnMount: false,
      },
    )

    expect(
      mockFetchClassById,
    ).toHaveBeenCalledWith(5)

    expect(
      mockFetchLectures,
    ).toHaveBeenCalled()

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'assignments',
    )

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'flashcards',
    )

    expect(
      result.current.classItem,
    ).toEqual(testClass)

    expect(
      result.current.assignments,
    ).toEqual(assignments)

    expect(
      result.current.flashcardCount,
    ).toBe(12)
  })

  it('handles a missing class ID', async () => {
    const {
      result,
    } = await renderLoadedHook(null)

    expect(
      result.current.classItem,
    ).toBeNull()

    expect(
      result.current.assignments,
    ).toEqual([])

    expect(
      result.current.flashcardCount,
    ).toBe(0)

    expect(
      result.current.error,
    ).toBe(
      'A class ID is required.',
    )

    expect(
      mockFetchClassById,
    ).not.toHaveBeenCalled()

    expect(
      mockFrom,
    ).not.toHaveBeenCalled()
  })

  it('handles assignment loading failure', async () => {
    setupSupabaseQueries({
      assignmentError: {
        message:
          'Unable to load assignments.',
      },
    })

    const {
      result,
    } = await renderLoadedHook()

    expect(
      result.current.classItem,
    ).toBeNull()

    expect(
      result.current.assignments,
    ).toEqual([])

    expect(
      result.current.flashcardCount,
    ).toBe(0)

    expect(
      result.current.error,
    ).toBe(
      'Unable to load assignments.',
    )
  })

  it('handles flashcard count failure', async () => {
    setupSupabaseQueries({
      flashcardError: {
        message:
          'Unable to count flashcards.',
      },
    })

    const {
      result,
    } = await renderLoadedHook()

    expect(
      result.current.classItem,
    ).toBeNull()

    expect(
      result.current.assignments,
    ).toEqual([])

    expect(
      result.current.flashcardCount,
    ).toBe(0)

    expect(
      result.current.error,
    ).toBe(
      'Unable to count flashcards.',
    )
  })

  it('separates completed and remaining assignments', async () => {
    const {
      result,
    } = await renderLoadedHook()

    expect(
      result.current
        .completedAssignments,
    ).toEqual([
      assignments[1],
      assignments[2],
    ])

    expect(
      result.current
        .remainingAssignments,
    ).toEqual([
      assignments[0],
    ])

    expect(
      result.current
        .courseworkSummary,
    ).toEqual({
      total: 3,
      active: 1,
      completed: 2,
      nextAssignment:
        assignments[0],
    })
  })

  it('calculates the weighted current grade', async () => {
    const {
      result,
    } = await renderLoadedHook()

    expect(
      result.current.currentGrade,
    ).toBe(73)
  })

  it('returns null when there are no weighted grades', async () => {
    setupSupabaseQueries({
      assignmentData: [
        {
          id: 1,
          class_id: 5,
          title: 'Essay',
          status: 'In Progress',
          due_date: '2099-08-10',
          grade: null,
          weight: 40,
        },
      ],
    })

    const {
      result,
    } = await renderLoadedHook()

    expect(
      result.current.currentGrade,
    ).toBeNull()
  })

  it('calculates lecture progress and exposes lecture actions', async () => {
    const {
      result,
    } = await renderLoadedHook()

    expect(
      result.current.lectureProgress,
    ).toEqual({
      total: 2,
      completed: 1,
      remaining: 1,
      percentage: 50,
    })

    expect(
      result.current.nextLecture,
    ).toEqual(lectures[0])

    expect(
      result.current
        .upcomingLectures,
    ).toEqual(upcomingLectures)

    expect(
      result.current.createLecture,
    ).toBe(mockCreateLecture)

    expect(
      result.current.updateLecture,
    ).toBe(mockUpdateLecture)

    expect(
      result.current
        .toggleLectureComplete,
    ).toBe(
      mockToggleLectureComplete,
    )

    expect(
      result.current.deleteLecture,
    ).toBe(mockDeleteLecture)
  })

  it('edits the class and updates local class state', async () => {
    const updatedClass = {
      ...testClass,
      name: 'Advanced Economics',
      code: 'EC201',
    }

    mockUpdateClass
      .mockResolvedValue(
        updatedClass,
      )

    const {
      result,
    } = await renderLoadedHook()

    let returnedClass

    await act(async () => {
      returnedClass =
        await result.current
          .editClass({
            name:
              'Advanced Economics',
            code: 'EC201',
          })
    })

    expect(
      mockUpdateClass,
    ).toHaveBeenCalledWith(
      5,
      {
        name:
          'Advanced Economics',
        code: 'EC201',
      },
    )

    expect(returnedClass).toEqual(
      updatedClass,
    )

    expect(
      result.current.classItem,
    ).toEqual(updatedClass)
  })

  it('refreshes all class details and combines lecture loading and errors', async () => {
    setupHookMocks({
      lecturesLoading: true,
      lecturesError:
        'Unable to load lectures.',
    })

    const hook = renderHook(() =>
      useClassDetails(5),
    )

    expect(
      hook.result.current.loading,
    ).toBe(true)

    await waitFor(() => {
      expect(
        hook.result.current
          .classItem,
      ).toEqual(testClass)
    })

    expect(
      hook.result.current.error,
    ).toBe(
      'Unable to load lectures.',
    )

    setupHookMocks({
      lecturesLoading: false,
      lecturesError: null,
    })

    hook.rerender()

    await waitFor(() => {
      expect(
        hook.result.current.loading,
      ).toBe(false)
    })

    const fetchCountBeforeRefresh =
      mockFetchClassById.mock.calls
        .length

    await act(async () => {
      await hook.result.current
        .refresh()
    })

    expect(
      mockFetchClassById,
    ).toHaveBeenCalledTimes(
      fetchCountBeforeRefresh + 1,
    )

    expect(
      mockFetchLectures,
    ).toHaveBeenCalledTimes(
      fetchCountBeforeRefresh + 1,
    )
  })
})