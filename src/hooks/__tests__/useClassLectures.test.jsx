import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const serviceMocks = vi.hoisted(() => ({
  deleteLectureBlockById: vi.fn(),
  deleteLectureBlocks: vi.fn(),
  deleteLectureRecord: vi.fn(),
  fetchLectureRecords: vi.fn(),
  insertLectureBlock: vi.fn(),
  insertLectureRecord: vi.fn(),
  updateLectureBlock: vi.fn(),
  updateLectureBlockCompletion: vi.fn(),
  updateLectureCompletion: vi.fn(),
  updateLectureRecord: vi.fn(),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: { auth: { getUser: vi.fn() } },
}))

vi.mock('../hookUtils', () => ({
  getAuthenticatedUser: vi
    .fn()
    .mockResolvedValue({ id: 'user-1' }),
  getErrorMessage: vi.fn(
    (error, fallback) => error?.message || fallback,
  ),
}))

vi.mock('../../utils/lectureSchedule', () => ({
  sortLectures: vi.fn((lectures) => lectures),
  getNextLecture: vi.fn((lectures) =>
    lectures.find((lecture) => !lecture.completed) || null,
  ),
}))

vi.mock('../lectureService', () => serviceMocks)

import useClassLectures from '../useClassLectures'

const baseLecture = {
  id: 'lecture-1',
  class_id: 'class-1',
  title: 'Lecture 1',
  week_number: 1,
  estimated_minutes: 90,
  completed: false,
  timeBlock: null,
}

describe('useClassLectures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviceMocks.fetchLectureRecords.mockResolvedValue({
      lectures: [],
      blocks: [],
    })
  })

  it('keeps its public API available when fetching is disabled', () => {
    const { result } = renderHook(() =>
      useClassLectures('class-1', {
        fetchOnMount: false,
      }),
    )

    expect(result.current).toEqual(
      expect.objectContaining({
        lectures: [],
        nextLecture: null,
        completedLectures: [],
        upcomingLectures: [],
        loading: false,
        error: null,
        setError: expect.any(Function),
        fetchLectures: expect.any(Function),
        createLecture: expect.any(Function),
        updateLecture: expect.any(Function),
        toggleLectureComplete: expect.any(Function),
        deleteLecture: expect.any(Function),
      }),
    )
  })

  it('reports a missing class ID without querying', async () => {
    const { result } = renderHook(() =>
      useClassLectures(null, {
        fetchOnMount: false,
      }),
    )

    await act(async () => {
      await expect(
        result.current.fetchLectures(),
      ).resolves.toEqual([])
    })

    expect(result.current.error).toBe(
      'A class ID is required.',
    )
    expect(
      serviceMocks.fetchLectureRecords,
    ).not.toHaveBeenCalled()
  })

  it('fetches and exposes lectures', async () => {
    serviceMocks.fetchLectureRecords.mockResolvedValue({
      lectures: [baseLecture],
      blocks: [],
    })

    const { result } = renderHook(() =>
      useClassLectures('class-1'),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.lectures).toHaveLength(1)
    })

    expect(
      serviceMocks.fetchLectureRecords,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        classId: 'class-1',
      }),
    )
  })

  it('creates a lecture without a timetable block', async () => {
    serviceMocks.insertLectureRecord.mockResolvedValue(
      baseLecture,
    )

    const { result } = renderHook(() =>
      useClassLectures('class-1', {
        fetchOnMount: false,
      }),
    )

    let created
    await act(async () => {
      created = await result.current.createLecture({
        title: ' Lecture 1 ',
        week_number: '1',
        estimated_minutes: '90',
      })
    })

    expect(created).toEqual({
      ...baseLecture,
      timeBlock: null,
    })
    expect(
      serviceMocks.insertLectureBlock,
    ).not.toHaveBeenCalled()
    expect(result.current.lectures).toHaveLength(1)
  })

  it('rolls back the lecture when block creation fails', async () => {
    const blockError = new Error('Block insert failed')
    serviceMocks.insertLectureRecord.mockResolvedValue(
      baseLecture,
    )
    serviceMocks.insertLectureBlock.mockRejectedValue(
      blockError,
    )
    serviceMocks.deleteLectureRecord.mockResolvedValue()

    const { result } = renderHook(() =>
      useClassLectures('class-1', {
        fetchOnMount: false,
      }),
    )

    await act(async () => {
      await expect(
        result.current.createLecture({
          title: 'Lecture 1',
          block_date: '2026-07-30',
          start_time: '10:00',
          end_time: '11:00',
        }),
      ).rejects.toBe(blockError)
    })

    expect(
      serviceMocks.deleteLectureRecord,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        lectureId: 'lecture-1',
      }),
    )
    expect(result.current.error).toBe(
      'Block insert failed',
    )
  })

  it('synchronises lecture and block completion', async () => {
    const block = {
      id: 'block-1',
      completed: false,
      block_date: '2026-07-30',
      start_time: '10:00:00',
    }
    serviceMocks.fetchLectureRecords.mockResolvedValue({
      lectures: [baseLecture],
      blocks: [
        {
          ...block,
          lecture_id: 'lecture-1',
        },
      ],
    })
    serviceMocks.updateLectureCompletion.mockResolvedValue({
      ...baseLecture,
      completed: true,
    })
    serviceMocks.updateLectureBlockCompletion.mockResolvedValue({
      ...block,
      completed: true,
    })

    const { result } = renderHook(() =>
      useClassLectures('class-1'),
    )

    await waitFor(() => {
      expect(result.current.lectures).toHaveLength(1)
    })

    await act(async () => {
      await result.current.toggleLectureComplete(
        'lecture-1',
      )
    })

    expect(
      serviceMocks.updateLectureCompletion,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true }),
    )
    expect(
      serviceMocks.updateLectureBlockCompletion,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        blockId: 'block-1',
        completed: true,
      }),
    )
    expect(result.current.lectures[0].completed).toBe(
      true,
    )
    expect(
      result.current.lectures[0].timeBlock.completed,
    ).toBe(true)
  })

  it('deletes linked blocks before deleting the lecture', async () => {
    serviceMocks.fetchLectureRecords.mockResolvedValue({
      lectures: [baseLecture],
      blocks: [],
    })

    const callOrder = []
    serviceMocks.deleteLectureBlocks.mockImplementation(
      async () => callOrder.push('blocks'),
    )
    serviceMocks.deleteLectureRecord.mockImplementation(
      async () => callOrder.push('lecture'),
    )

    const { result } = renderHook(() =>
      useClassLectures('class-1'),
    )

    await waitFor(() => {
      expect(result.current.lectures).toHaveLength(1)
    })

    await act(async () => {
      await result.current.deleteLecture('lecture-1')
    })

    expect(callOrder).toEqual(['blocks', 'lecture'])
    expect(result.current.lectures).toEqual([])
  })
})
