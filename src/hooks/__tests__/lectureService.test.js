import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  deleteLectureBlockById,
  deleteLectureBlocks,
  deleteLectureRecord,
  fetchLectureRecords,
  insertLectureBlock,
  insertLectureRecord,
  updateLectureBlock,
  updateLectureCompletion,
  updateLectureRecord,
} from '../lectureService'

const createQuery = ({
  data = null,
  error = null,
} = {}) => {
  const query = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    then: (
      resolve,
      reject,
    ) =>
      Promise.resolve({
        data,
        error,
      }).then(resolve, reject),
  }

  query.select.mockReturnValue(query)
  query.insert.mockReturnValue(query)
  query.update.mockReturnValue(query)
  query.delete.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.order.mockReturnValue(query)

  query.single.mockResolvedValue({
    data,
    error,
  })

  return query
}

const createSupabase = (
  queriesByTable,
) => ({
  from: vi.fn((table) => {
    const tableQueries =
      queriesByTable[table]

    if (!tableQueries?.length) {
      throw new Error(
        `No mocked query for table: ${table}`,
      )
    }

    return tableQueries.shift()
  }),
})

const lecture = {
  id: 1,
  user_id: 'user-1',
  class_id: 5,
  title: 'Demand',
  lecture_url:
    'https://example.com/demand',
  week_number: 1,
  estimated_minutes: 60,
  completed: false,
  completed_at: null,
  created_at:
    '2026-07-29T10:00:00.000Z',
}

const lectureBlock = {
  id: 20,
  user_id: 'user-1',
  class_id: 5,
  coursework_id: null,
  title: 'Demand',
  block_date: '2026-08-01',
  start_time: '10:00',
  end_time: '11:00',
  block_type: 'Lecture',
  is_recurring: false,
  recurrence_type: 'none',
  recurrence_end_date: null,
  auto_generated: false,
  lecture_id: 1,
  completed: false,
  created_at:
    '2026-07-29T10:00:00.000Z',
}

describe('lectureService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches lecture records and timetable blocks', async () => {
    const lectureQuery =
      createQuery({
        data: [lecture],
      })

    const blockQuery =
      createQuery({
        data: [lectureBlock],
      })

    const supabase =
      createSupabase({
        lectures: [lectureQuery],
        time_blocks: [blockQuery],
      })

    const result =
      await fetchLectureRecords({
        supabase,
        userId: 'user-1',
        classId: 5,
      })

    expect(
      supabase.from,
    ).toHaveBeenCalledWith(
      'lectures',
    )

    expect(
      supabase.from,
    ).toHaveBeenCalledWith(
      'time_blocks',
    )

    expect(
      lectureQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'user_id',
      'user-1',
    )

    expect(
      lectureQuery.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'class_id',
      5,
    )

    expect(
      blockQuery.eq,
    ).toHaveBeenCalledWith(
      'block_type',
      'Lecture',
    )

    expect(result).toEqual({
      lectures: [lecture],
      blocks: [lectureBlock],
    })
  })

  it('throws when fetching lectures or blocks fails', async () => {
    const lectureError =
      new Error(
        'Unable to fetch lectures.',
      )

    const supabase =
      createSupabase({
        lectures: [
          createQuery({
            error: lectureError,
          }),
        ],
        time_blocks: [
          createQuery({
            data: [],
          }),
        ],
      })

    await expect(
      fetchLectureRecords({
        supabase,
        userId: 'user-1',
        classId: 5,
      }),
    ).rejects.toThrow(
      'Unable to fetch lectures.',
    )
  })

  it('inserts and returns a lecture record', async () => {
    const query =
      createQuery({
        data: lecture,
      })

    const supabase =
      createSupabase({
        lectures: [query],
      })

    const result =
      await insertLectureRecord({
        supabase,
        userId: 'user-1',
        classId: 5,
        title: 'Demand',
        lectureUrl:
          'https://example.com/demand',
        weekNumber: 1,
        estimatedMinutes: 60,
      })

    expect(
      query.insert,
    ).toHaveBeenCalledWith({
      user_id: 'user-1',
      class_id: 5,
      title: 'Demand',
      lecture_url:
        'https://example.com/demand',
      week_number: 1,
      estimated_minutes: 60,
      completed: false,
      completed_at: null,
    })

    expect(result).toEqual(lecture)
  })

  it('updates and returns a lecture record', async () => {
    const updatedLecture = {
      ...lecture,
      title: 'Updated demand',
      week_number: 2,
      estimated_minutes: 90,
    }

    const query =
      createQuery({
        data: updatedLecture,
      })

    const supabase =
      createSupabase({
        lectures: [query],
      })

    const result =
      await updateLectureRecord({
        supabase,
        userId: 'user-1',
        lectureId: 1,
        title: 'Updated demand',
        lectureUrl:
          'https://example.com/updated',
        weekNumber: 2,
        estimatedMinutes: 90,
      })

    expect(
      query.update,
    ).toHaveBeenCalledWith({
      title: 'Updated demand',
      lecture_url:
        'https://example.com/updated',
      week_number: 2,
      estimated_minutes: 90,
    })

    expect(
      query.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      1,
    )

    expect(
      query.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )

    expect(result).toEqual(
      updatedLecture,
    )
  })

  it('updates lecture completion and completed_at', async () => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(
        '2026-07-29T12:00:00.000Z',
      ),
    )

    const completedLecture = {
      ...lecture,
      completed: true,
      completed_at:
        '2026-07-29T12:00:00.000Z',
    }

    const query =
      createQuery({
        data: completedLecture,
      })

    const supabase =
      createSupabase({
        lectures: [query],
      })

    const result =
      await updateLectureCompletion({
        supabase,
        userId: 'user-1',
        lectureId: 1,
        completed: true,
      })

    expect(
      query.update,
    ).toHaveBeenCalledWith({
      completed: true,
      completed_at:
        '2026-07-29T12:00:00.000Z',
    })

    expect(result).toEqual(
      completedLecture,
    )
  })

  it('inserts a linked lecture timetable block', async () => {
    const query =
      createQuery({
        data: lectureBlock,
      })

    const supabase =
      createSupabase({
        time_blocks: [query],
      })

    const formData = {
      block_date: '2026-08-01',
      start_time: '10:00',
      end_time: '11:00',
    }

    const result =
      await insertLectureBlock({
        supabase,
        userId: 'user-1',
        classId: 5,
        lectureId: 1,
        title: 'Demand',
        formData,
        completed: false,
        autoGenerated: true,
      })

    expect(
      query.insert,
    ).toHaveBeenCalledWith({
      user_id: 'user-1',
      class_id: 5,
      coursework_id: null,
      title: 'Demand',
      block_date: '2026-08-01',
      start_time: '10:00',
      end_time: '11:00',
      block_type: 'Lecture',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_end_date: null,
      auto_generated: true,
      lecture_id: 1,
      completed: false,
    })

    expect(result).toEqual(
      lectureBlock,
    )
  })

  it('updates an existing lecture timetable block', async () => {
    const updatedBlock = {
      ...lectureBlock,
      title: 'Updated demand',
      block_date: '2026-08-02',
      start_time: '13:00',
      end_time: '14:00',
    }

    const query =
      createQuery({
        data: updatedBlock,
      })

    const supabase =
      createSupabase({
        time_blocks: [query],
      })

    const result =
      await updateLectureBlock({
        supabase,
        userId: 'user-1',
        blockId: 20,
        title: 'Updated demand',
        formData: {
          block_date: '2026-08-02',
          start_time: '13:00',
          end_time: '14:00',
        },
      })

    expect(
      query.update,
    ).toHaveBeenCalledWith({
      title: 'Updated demand',
      block_date: '2026-08-02',
      start_time: '13:00',
      end_time: '14:00',
    })

    expect(
      query.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      20,
    )

    expect(
      query.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )

    expect(result).toEqual(
      updatedBlock,
    )
  })

  it('deletes lecture blocks and lecture records with user filtering', async () => {
    const blockByIdQuery =
      createQuery()

    const blocksQuery =
      createQuery()

    const lectureQuery =
      createQuery()

    const supabase =
      createSupabase({
        time_blocks: [
          blockByIdQuery,
          blocksQuery,
        ],
        lectures: [
          lectureQuery,
        ],
      })

    await deleteLectureBlockById({
      supabase,
      userId: 'user-1',
      blockId: 20,
    })

    await deleteLectureBlocks({
      supabase,
      userId: 'user-1',
      lectureId: 1,
    })

    await deleteLectureRecord({
      supabase,
      userId: 'user-1',
      lectureId: 1,
    })

    expect(
      blockByIdQuery.delete,
    ).toHaveBeenCalled()

    expect(
      blockByIdQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      20,
    )

    expect(
      blocksQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'lecture_id',
      1,
    )

    expect(
      lectureQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      1,
    )

    expect(
      lectureQuery.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )
  })
})