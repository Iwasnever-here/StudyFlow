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

import useClassLectures from '../useClassLectures'

import {
  getAuthenticatedUser,
  getErrorMessage,
} from '../hookUtils'

import {
  getLectureCollections,
  hasCompleteTimeBlock,
  mergeLecturesWithBlocks,
  mergeLectureWithBlock,
  prepareLectureValues,
  sortLectures,
} from '../lectureHelpers'

import {
  deleteLectureBlockById,
  deleteLectureBlocks,
  deleteLectureRecord,
  fetchLectureRecords,
  insertLectureBlock,
  insertLectureRecord,
  updateLectureBlock,
  updateLectureBlockCompletion,
  updateLectureCompletion,
  updateLectureRecord,
} from '../lectureService'

vi.mock(
  '../../lib/supabaseClient',
  () => ({
    supabase: {
      auth: {},
    },
  }),
)

vi.mock('../hookUtils', () => ({
  getAuthenticatedUser: vi.fn(),
  getErrorMessage: vi.fn(),
}))

vi.mock('../lectureHelpers', () => ({
  getLectureCollections: vi.fn(),
  hasCompleteTimeBlock: vi.fn(),
  mergeLecturesWithBlocks: vi.fn(),
  mergeLectureWithBlock: vi.fn(),
  prepareLectureValues: vi.fn(),
  sortLectures: vi.fn(),
}))

vi.mock('../lectureService', () => ({
  deleteLectureBlockById: vi.fn(),
  deleteLectureBlocks: vi.fn(),
  deleteLectureRecord: vi.fn(),
  fetchLectureRecords: vi.fn(),
  insertLectureBlock: vi.fn(),
  insertLectureRecord: vi.fn(),
  updateLectureBlock: vi.fn(),
  updateLectureBlockCompletion:
    vi.fn(),
  updateLectureCompletion: vi.fn(),
  updateLectureRecord: vi.fn(),
}))

const testUser = {
  id: 'user-1',
}

const lectureRecords = [
  {
    id: 1,
    class_id: 5,
    title: 'Demand and supply',
    lecture_url:
      'https://example.com/lecture-1',
    week_number: 1,
    estimated_minutes: 90,
    completed: false,
  },
  {
    id: 2,
    class_id: 5,
    title: 'Market structures',
    lecture_url:
      'https://example.com/lecture-2',
    week_number: 2,
    estimated_minutes: 75,
    completed: true,
  },
]

const lectureBlocks = [
  {
    id: 20,
    lecture_id: 1,
    class_id: 5,
    title: 'Demand and supply',
    block_date: '2026-08-01',
    start_time: '10:00',
    end_time: '11:30',
    completed: false,
  },
]

const mergedLectures = [
  {
    ...lectureRecords[0],
    timeBlock: lectureBlocks[0],
  },
  {
    ...lectureRecords[1],
    timeBlock: null,
  },
]

const lectureCollections = {
  nextLecture: mergedLectures[0],
  completedLectures: [
    mergedLectures[1],
  ],
  upcomingLectures: [
    mergedLectures[0],
  ],
}

const preparedValues = {
  title: 'New lecture',
  lectureUrl:
    'https://example.com/new',
  weekNumber: 3,
  estimatedMinutes: 90,
}

const createdLecture = {
  id: 3,
  class_id: 5,
  title: 'New lecture',
  lecture_url:
    'https://example.com/new',
  week_number: 3,
  estimated_minutes: 90,
  completed: false,
}

const createdBlock = {
  id: 30,
  lecture_id: 3,
  class_id: 5,
  title: 'New lecture',
  block_date: '2026-08-03',
  start_time: '13:00',
  end_time: '14:30',
  completed: false,
  auto_generated: false,
}

const createdMergedLecture = {
  ...createdLecture,
  timeBlock: createdBlock,
}

const lectureFormData = {
  title: '  New lecture  ',
  lecture_url:
    'https://example.com/new',
  week_number: '3',
  estimated_minutes: '90',
  block_date: '2026-08-03',
  start_time: '13:00',
  end_time: '14:30',
  auto_generated: false,
}

const setupDefaultMocks = () => {
  getAuthenticatedUser
    .mockResolvedValue(testUser)

  getErrorMessage
    .mockImplementation(
      (
        caughtError,
        fallbackMessage,
      ) =>
        caughtError?.message ||
        fallbackMessage,
    )

  fetchLectureRecords
    .mockResolvedValue({
      lectures: lectureRecords,
      blocks: lectureBlocks,
    })

  mergeLecturesWithBlocks
    .mockReturnValue(
      mergedLectures,
    )

  getLectureCollections
    .mockReturnValue(
      lectureCollections,
    )

  prepareLectureValues
    .mockReturnValue(
      preparedValues,
    )

  insertLectureRecord
    .mockResolvedValue(
      createdLecture,
    )

  insertLectureBlock
    .mockResolvedValue(
      createdBlock,
    )

  mergeLectureWithBlock
    .mockReturnValue(
      createdMergedLecture,
    )

  sortLectures
    .mockImplementation(
      (lectures) => lectures,
    )

  hasCompleteTimeBlock
    .mockReturnValue(true)

  deleteLectureRecord
    .mockResolvedValue(
      undefined,
    )

  updateLectureRecord
    .mockResolvedValue(
      createdLecture,
    )

  updateLectureBlock
    .mockResolvedValue(
      createdBlock,
    )

  updateLectureCompletion
    .mockResolvedValue(
      createdLecture,
    )

  updateLectureBlockCompletion
    .mockResolvedValue(
      createdBlock,
    )

  deleteLectureBlockById
    .mockResolvedValue(
      undefined,
    )

  deleteLectureBlocks
    .mockResolvedValue(
      undefined,
    )
}

const renderLoadedHook = async (
  classId = 5,
  options,
) => {
  const hook = renderHook(() =>
    useClassLectures(
      classId,
      options,
    ),
  )

  await waitFor(() => {
    expect(
      hook.result.current.loading,
    ).toBe(false)
  })

  return hook
}

describe('useClassLectures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupDefaultMocks()
  })

  describe('fetching lectures', () => {
    it('fetches and merges lectures on mount', async () => {
      const { result } =
        await renderLoadedHook()

      expect(
        getAuthenticatedUser,
      ).toHaveBeenCalledWith(
        expect.anything(),
        'You must be signed in to manage lectures.',
      )

      expect(
        fetchLectureRecords,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        classId: 5,
      })

      expect(
        mergeLecturesWithBlocks,
      ).toHaveBeenCalledWith(
        lectureRecords,
        lectureBlocks,
      )

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)

      expect(
        result.current.error,
      ).toBeNull()

      expect(
        result.current.loading,
      ).toBe(false)
    })

    it('returns derived lecture collections', async () => {
      const { result } =
        await renderLoadedHook()

      expect(
        getLectureCollections,
      ).toHaveBeenLastCalledWith(
        mergedLectures,
      )

      expect(
        result.current.nextLecture,
      ).toEqual(
        lectureCollections.nextLecture,
      )

      expect(
        result.current
          .completedLectures,
      ).toEqual(
        lectureCollections
          .completedLectures,
      )

      expect(
        result.current
          .upcomingLectures,
      ).toEqual(
        lectureCollections
          .upcomingLectures,
      )
    })

    it('does not fetch on mount when fetchOnMount is false', () => {
      const { result } =
        renderHook(() =>
          useClassLectures(
            5,
            {
              fetchOnMount: false,
            },
          ),
        )

      expect(
        fetchLectureRecords,
      ).not.toHaveBeenCalled()

      expect(
        getAuthenticatedUser,
      ).not.toHaveBeenCalled()

      expect(
        result.current.loading,
      ).toBe(false)

      expect(
        result.current.lectures,
      ).toEqual([])
    })

    it('returns an error when the class ID is missing', async () => {
      const { result } =
        await renderLoadedHook(null)

      expect(
        getAuthenticatedUser,
      ).not.toHaveBeenCalled()

      expect(
        fetchLectureRecords,
      ).not.toHaveBeenCalled()

      expect(
        result.current.lectures,
      ).toEqual([])

      expect(
        result.current.error,
      ).toBe(
        'A class ID is required.',
      )
    })

    it('handles a lecture fetch failure', async () => {
      fetchLectureRecords
        .mockRejectedValue(
          new Error(
            'Unable to fetch lectures.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      expect(
        result.current.lectures,
      ).toEqual([])

      expect(
        result.current.error,
      ).toBe(
        'Unable to fetch lectures.',
      )

      expect(
        getErrorMessage,
      ).toHaveBeenCalledWith(
        expect.any(Error),
        'Something went wrong while managing lectures.',
      )
    })

    it('manually refetches lectures', async () => {
      const { result } =
        await renderLoadedHook(
          5,
          {
            fetchOnMount: false,
          },
        )

      expect(
        result.current.lectures,
      ).toEqual([])

      let returnedLectures

      await act(async () => {
        returnedLectures =
          await result.current
            .fetchLectures()
      })

      expect(
        returnedLectures,
      ).toEqual(mergedLectures)

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)

      expect(
        result.current.error,
      ).toBeNull()
    })
  })

  describe('creating lectures', () => {
    it('creates a lecture with a timetable block', async () => {
      const { result } =
        await renderLoadedHook()

      let returnedLecture

      await act(async () => {
        returnedLecture =
          await result.current
            .createLecture(
              lectureFormData,
            )
      })

      expect(
        prepareLectureValues,
      ).toHaveBeenCalledWith(
        lectureFormData,
        90,
      )

      expect(
        insertLectureRecord,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        classId: 5,
        title: 'New lecture',
        lectureUrl:
          'https://example.com/new',
        weekNumber: 3,
        estimatedMinutes: 90,
      })

      expect(
        hasCompleteTimeBlock,
      ).toHaveBeenCalledWith(
        lectureFormData,
      )

      expect(
        insertLectureBlock,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        classId: 5,
        lectureId: 3,
        title: 'New lecture',
        formData:
          lectureFormData,
        completed: false,
        autoGenerated: false,
      })

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        createdLecture,
        createdBlock,
      )

      expect(
        sortLectures,
      ).toHaveBeenCalledWith([
        ...mergedLectures,
        createdMergedLecture,
      ])

      expect(
        result.current.lectures,
      ).toEqual([
        ...mergedLectures,
        createdMergedLecture,
      ])

      expect(
        returnedLecture,
      ).toEqual(
        createdMergedLecture,
      )
    })

    it('creates a lecture without a timetable block', async () => {
      hasCompleteTimeBlock
        .mockReturnValue(false)

      const lectureWithoutBlock = {
        ...createdLecture,
        timeBlock: null,
      }

      mergeLectureWithBlock
        .mockReturnValue(
          lectureWithoutBlock,
        )

      const { result } =
        await renderLoadedHook()

      let returnedLecture

      await act(async () => {
        returnedLecture =
          await result.current
            .createLecture({
              ...lectureFormData,
              block_date: '',
              start_time: '',
              end_time: '',
            })
      })

      expect(
        insertLectureRecord,
      ).toHaveBeenCalled()

      expect(
        insertLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        createdLecture,
        null,
      )

      expect(
        returnedLecture,
      ).toEqual(
        lectureWithoutBlock,
      )
    })

    it('uses auto-generated when creating a lecture block', async () => {
      const autoGeneratedForm = {
        ...lectureFormData,
        auto_generated: true,
      }

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .createLecture(
            autoGeneratedForm,
          )
      })

      expect(
        insertLectureBlock,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        classId: 5,
        lectureId: 3,
        title: 'New lecture',
        formData:
          autoGeneratedForm,
        completed: false,
        autoGenerated: true,
      })
    })

    it('rejects creation when the class ID is missing', async () => {
      const { result } =
        renderHook(() =>
          useClassLectures(
            null,
            {
              fetchOnMount: false,
            },
          ),
        )

      let caughtError

      await act(async () => {
        try {
          await result.current
            .createLecture(
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'A class ID is required to create a lecture.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'A class ID is required to create a lecture.',
      )

      expect(
        insertLectureRecord,
      ).not.toHaveBeenCalled()
    })

    it('handles a lecture record creation failure', async () => {
      insertLectureRecord
        .mockRejectedValue(
          new Error(
            'Unable to create lecture.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .createLecture(
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to create lecture.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Unable to create lecture.',
      )

      expect(
        insertLectureBlock,
      ).not.toHaveBeenCalled()
    })

    it('rolls back the lecture when block creation fails', async () => {
      insertLectureBlock
        .mockRejectedValue(
          new Error(
            'Unable to create timetable block.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .createLecture(
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(
        deleteLectureRecord,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        lectureId: 3,
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to create timetable block.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Unable to create timetable block.',
      )

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)
    })

    it('preserves the block error when rollback also fails', async () => {
      const blockError =
        new Error(
          'Block creation failed.',
        )

      insertLectureBlock
        .mockRejectedValue(
          blockError,
        )

      deleteLectureRecord
        .mockRejectedValue(
          new Error(
            'Rollback failed.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .createLecture(
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(
        deleteLectureRecord,
      ).toHaveBeenCalled()

      expect(caughtError).toBe(
        blockError,
      )

      expect(
        result.current.error,
      ).toBe(
        'Block creation failed.',
      )
    })

    it('handles lecture validation failure', async () => {
      prepareLectureValues
        .mockImplementation(() => {
          throw new Error(
            'Please enter a lecture title.',
          )
        })

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .createLecture({
              ...lectureFormData,
              title: '',
            })
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Please enter a lecture title.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Please enter a lecture title.',
      )

      expect(
        insertLectureRecord,
      ).not.toHaveBeenCalled()
    })
  })
    describe('updating lectures', () => {
    it('updates a lecture and its existing timetable block', async () => {
      const updatedLecture = {
        ...lectureRecords[0],
        title: 'Updated demand',
        lecture_url:
          'https://example.com/updated',
        week_number: 4,
        estimated_minutes: 120,
      }

      const updatedBlock = {
        ...lectureBlocks[0],
        title: 'Updated demand',
        block_date: '2026-08-05',
        start_time: '14:00',
        end_time: '16:00',
      }

      const mergedUpdatedLecture = {
        ...updatedLecture,
        timeBlock: updatedBlock,
      }

      const updateFormData = {
        ...lectureFormData,
        title: 'Updated demand',
        block_date: '2026-08-05',
        start_time: '14:00',
        end_time: '16:00',
      }

      prepareLectureValues
        .mockReturnValue({
          title: 'Updated demand',
          lectureUrl:
            'https://example.com/updated',
          weekNumber: 4,
          estimatedMinutes: 120,
        })

      updateLectureRecord
        .mockResolvedValue(
          updatedLecture,
        )

      updateLectureBlock
        .mockResolvedValue(
          updatedBlock,
        )

      mergeLectureWithBlock
        .mockReturnValue(
          mergedUpdatedLecture,
        )

      hasCompleteTimeBlock
        .mockReturnValue(true)

      const { result } =
        await renderLoadedHook()

      let returnedLecture

      await act(async () => {
        returnedLecture =
          await result.current
            .updateLecture(
              1,
              updateFormData,
            )
      })

      expect(
        prepareLectureValues,
      ).toHaveBeenCalledWith(
        updateFormData,
        90,
      )

      expect(
        updateLectureRecord,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        lectureId: 1,
        title: 'Updated demand',
        lectureUrl:
          'https://example.com/updated',
        weekNumber: 4,
        estimatedMinutes: 120,
      })

      expect(
        updateLectureBlock,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        blockId: 20,
        title: 'Updated demand',
        formData:
          updateFormData,
      })

      expect(
        insertLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        deleteLectureBlockById,
      ).not.toHaveBeenCalled()

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        updatedLecture,
        updatedBlock,
      )

      expect(
        result.current.lectures,
      ).toEqual([
        mergedUpdatedLecture,
        mergedLectures[1],
      ])

      expect(
        returnedLecture,
      ).toEqual(
        mergedUpdatedLecture,
      )
    })

    it('creates a timetable block when the lecture did not have one', async () => {
      const currentLecture =
        mergedLectures[1]

      const updatedLecture = {
        ...lectureRecords[1],
        title:
          'Updated market structures',
      }

      const newBlock = {
        id: 40,
        lecture_id: 2,
        class_id: 5,
        title:
          'Updated market structures',
        block_date: '2026-08-06',
        start_time: '10:00',
        end_time: '11:15',
        completed: true,
        auto_generated: false,
      }

      const mergedUpdatedLecture = {
        ...updatedLecture,
        timeBlock: newBlock,
      }

      const updateFormData = {
        ...lectureFormData,
        title:
          'Updated market structures',
        block_date: '2026-08-06',
        start_time: '10:00',
        end_time: '11:15',
      }

      prepareLectureValues
        .mockReturnValue({
          title:
            'Updated market structures',
          lectureUrl:
            'https://example.com/lecture-2',
          weekNumber: 2,
          estimatedMinutes: 75,
        })

      updateLectureRecord
        .mockResolvedValue(
          updatedLecture,
        )

      insertLectureBlock
        .mockResolvedValue(newBlock)

      mergeLectureWithBlock
        .mockReturnValue(
          mergedUpdatedLecture,
        )

      hasCompleteTimeBlock
        .mockReturnValue(true)

      const { result } =
        await renderLoadedHook()

      let returnedLecture

      await act(async () => {
        returnedLecture =
          await result.current
            .updateLecture(
              currentLecture.id,
              updateFormData,
            )
      })

      expect(
        insertLectureBlock,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        classId: 5,
        lectureId: 2,
        title:
          'Updated market structures',
        formData:
          updateFormData,
        completed: true,
        autoGenerated: false,
      })

      expect(
        updateLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        deleteLectureBlockById,
      ).not.toHaveBeenCalled()

      expect(
        result.current.lectures,
      ).toEqual([
        mergedLectures[0],
        mergedUpdatedLecture,
      ])

      expect(
        returnedLecture,
      ).toEqual(
        mergedUpdatedLecture,
      )
    })

    it('removes an existing timetable block when block fields are cleared', async () => {
      const updatedLecture = {
        ...lectureRecords[0],
        title:
          'Demand without block',
      }

      const updateFormData = {
        ...lectureFormData,
        title:
          'Demand without block',
        block_date: '',
        start_time: '',
        end_time: '',
      }

      const mergedUpdatedLecture = {
        ...updatedLecture,
        timeBlock: null,
      }

      prepareLectureValues
        .mockReturnValue({
          title:
            'Demand without block',
          lectureUrl:
            'https://example.com/lecture-1',
          weekNumber: 1,
          estimatedMinutes: 90,
        })

      updateLectureRecord
        .mockResolvedValue(
          updatedLecture,
        )

      hasCompleteTimeBlock
        .mockReturnValue(false)

      mergeLectureWithBlock
        .mockReturnValue(
          mergedUpdatedLecture,
        )

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .updateLecture(
            1,
            updateFormData,
          )
      })

      expect(
        deleteLectureBlockById,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        blockId: 20,
      })

      expect(
        updateLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        insertLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        updatedLecture,
        null,
      )

      expect(
        result.current.lectures,
      ).toEqual([
        mergedUpdatedLecture,
        mergedLectures[1],
      ])
    })

    it('updates only the lecture when it has no block and no complete block data', async () => {
      const updatedLecture = {
        ...lectureRecords[1],
        title:
          'Markets updated',
      }

      const updateFormData = {
        ...lectureFormData,
        title: 'Markets updated',
        block_date: '',
        start_time: '',
        end_time: '',
      }

      const mergedUpdatedLecture = {
        ...updatedLecture,
        timeBlock: null,
      }

      prepareLectureValues
        .mockReturnValue({
          title: 'Markets updated',
          lectureUrl:
            'https://example.com/lecture-2',
          weekNumber: 2,
          estimatedMinutes: 75,
        })

      updateLectureRecord
        .mockResolvedValue(
          updatedLecture,
        )

      hasCompleteTimeBlock
        .mockReturnValue(false)

      mergeLectureWithBlock
        .mockReturnValue(
          mergedUpdatedLecture,
        )

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .updateLecture(
            2,
            updateFormData,
          )
      })

      expect(
        updateLectureRecord,
      ).toHaveBeenCalled()

      expect(
        updateLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        insertLectureBlock,
      ).not.toHaveBeenCalled()

      expect(
        deleteLectureBlockById,
      ).not.toHaveBeenCalled()

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        updatedLecture,
        null,
      )
    })

    it('rejects an update when no lecture ID is supplied', async () => {
      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .updateLecture(
              null,
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'A lecture ID is required to update a lecture.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'A lecture ID is required to update a lecture.',
      )

      expect(
        getAuthenticatedUser,
      ).toHaveBeenCalledTimes(1)

      expect(
        updateLectureRecord,
      ).not.toHaveBeenCalled()
    })

    it('rejects an update when the lecture cannot be found', async () => {
      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .updateLecture(
              999,
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Lecture could not be found.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Lecture could not be found.',
      )

      expect(
        updateLectureRecord,
      ).not.toHaveBeenCalled()
    })

    it('handles a lecture update failure', async () => {
      updateLectureRecord
        .mockRejectedValue(
          new Error(
            'Unable to update lecture.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .updateLecture(
              1,
              lectureFormData,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to update lecture.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Unable to update lecture.',
      )

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)
    })
  })

  describe('toggling lecture completion', () => {
    it('toggles a lecture and its timetable block to completed', async () => {
      const completedLecture = {
        ...lectureRecords[0],
        completed: true,
      }

      const completedBlock = {
        ...lectureBlocks[0],
        completed: true,
      }

      const mergedCompletedLecture = {
        ...completedLecture,
        timeBlock: completedBlock,
      }

      updateLectureCompletion
        .mockResolvedValue(
          completedLecture,
        )

      updateLectureBlockCompletion
        .mockResolvedValue(
          completedBlock,
        )

      mergeLectureWithBlock
        .mockReturnValue(
          mergedCompletedLecture,
        )

      const { result } =
        await renderLoadedHook()

      let returnedLecture

      await act(async () => {
        returnedLecture =
          await result.current
            .toggleLectureComplete(1)
      })

      expect(
        updateLectureCompletion,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        lectureId: 1,
        completed: true,
      })

      expect(
        updateLectureBlockCompletion,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        blockId: 20,
        completed: true,
      })

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        completedLecture,
        completedBlock,
      )

      expect(
        result.current.lectures,
      ).toEqual([
        mergedCompletedLecture,
        mergedLectures[1],
      ])

      expect(
        returnedLecture,
      ).toEqual(
        mergedCompletedLecture,
      )
    })

    it('toggles a completed lecture back to incomplete', async () => {
      const incompleteLecture = {
        ...lectureRecords[1],
        completed: false,
      }

      const mergedIncompleteLecture = {
        ...incompleteLecture,
        timeBlock: null,
      }

      updateLectureCompletion
        .mockResolvedValue(
          incompleteLecture,
        )

      mergeLectureWithBlock
        .mockReturnValue(
          mergedIncompleteLecture,
        )

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .toggleLectureComplete(2)
      })

      expect(
        updateLectureCompletion,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        lectureId: 2,
        completed: false,
      })

      expect(
        updateLectureBlockCompletion,
      ).not.toHaveBeenCalled()

      expect(
        mergeLectureWithBlock,
      ).toHaveBeenCalledWith(
        incompleteLecture,
        null,
      )

      expect(
        result.current.lectures,
      ).toEqual([
        mergedLectures[0],
        mergedIncompleteLecture,
      ])
    })

    it('rejects completion toggling when the lecture cannot be found', async () => {
      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .toggleLectureComplete(
              999,
            )
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Lecture could not be found.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Lecture could not be found.',
      )

      expect(
        updateLectureCompletion,
      ).not.toHaveBeenCalled()
    })

    it('handles a lecture completion update failure', async () => {
      updateLectureCompletion
        .mockRejectedValue(
          new Error(
            'Unable to update completion.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .toggleLectureComplete(1)
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to update completion.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Unable to update completion.',
      )

      expect(
        updateLectureBlockCompletion,
      ).not.toHaveBeenCalled()

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)
    })

    it('handles a timetable block completion update failure', async () => {
      const completedLecture = {
        ...lectureRecords[0],
        completed: true,
      }

      updateLectureCompletion
        .mockResolvedValue(
          completedLecture,
        )

      updateLectureBlockCompletion
        .mockRejectedValue(
          new Error(
            'Unable to update timetable block.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .toggleLectureComplete(1)
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to update timetable block.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'Unable to update timetable block.',
      )

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)
    })
  })

  describe('deleting lectures', () => {
    it('deletes lecture blocks before deleting the lecture record', async () => {
      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .deleteLecture(1)
      })

      expect(
        deleteLectureBlocks,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        lectureId: 1,
      })

      expect(
        deleteLectureRecord,
      ).toHaveBeenCalledWith({
        supabase:
          expect.anything(),
        userId: 'user-1',
        lectureId: 1,
      })

      expect(
        deleteLectureBlocks.mock
          .invocationCallOrder[0],
      ).toBeLessThan(
        deleteLectureRecord.mock
          .invocationCallOrder[0],
      )

      expect(
        result.current.lectures,
      ).toEqual([
        mergedLectures[1],
      ])

      expect(
        result.current.error,
      ).toBeNull()
    })

    it('rejects deletion when no lecture ID is supplied', async () => {
      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .deleteLecture(null)
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'A lecture ID is required to delete a lecture.',
        ),
      )

      expect(
        result.current.error,
      ).toBe(
        'A lecture ID is required to delete a lecture.',
      )

      expect(
        deleteLectureBlocks,
      ).not.toHaveBeenCalled()

      expect(
        deleteLectureRecord,
      ).not.toHaveBeenCalled()
    })

    it('stops deletion when deleting lecture blocks fails', async () => {
      deleteLectureBlocks
        .mockRejectedValue(
          new Error(
            'Unable to delete lecture blocks.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .deleteLecture(1)
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to delete lecture blocks.',
        ),
      )

      expect(
        deleteLectureRecord,
      ).not.toHaveBeenCalled()

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)

      expect(
        result.current.error,
      ).toBe(
        'Unable to delete lecture blocks.',
      )
    })

    it('handles a lecture record deletion failure', async () => {
      deleteLectureRecord
        .mockRejectedValue(
          new Error(
            'Unable to delete lecture.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .deleteLecture(1)
        } catch (error) {
          caughtError = error
        }
      })

      expect(
        deleteLectureBlocks,
      ).toHaveBeenCalled()

      expect(caughtError).toEqual(
        new Error(
          'Unable to delete lecture.',
        ),
      )

      expect(
        result.current.lectures,
      ).toEqual(mergedLectures)

      expect(
        result.current.error,
      ).toBe(
        'Unable to delete lecture.',
      )
    })
  })

  describe('error state', () => {
    it('allows the error to be cleared manually', async () => {
      fetchLectureRecords
        .mockRejectedValue(
          new Error(
            'Unable to load lectures.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      expect(
        result.current.error,
      ).toBe(
        'Unable to load lectures.',
      )

      act(() => {
        result.current.setError(null)
      })

      expect(
        result.current.error,
      ).toBeNull()
    })

    it('uses the fallback error message when an error has no message', async () => {
      getErrorMessage
        .mockReturnValue(
          'Something went wrong while managing lectures.',
        )

      fetchLectureRecords
        .mockRejectedValue({})

      const { result } =
        await renderLoadedHook()

      expect(
        getErrorMessage,
      ).toHaveBeenCalledWith(
        {},
        'Something went wrong while managing lectures.',
      )

      expect(
        result.current.error,
      ).toBe(
        'Something went wrong while managing lectures.',
      )
    })
  })
})