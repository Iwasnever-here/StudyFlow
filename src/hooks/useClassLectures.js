import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  getNextLecture,
  sortLectures,
} from '../utils/lectureSchedule'

const LECTURE_FIELDS = `
  id,
  user_id,
  class_id,
  title,
  lecture_url,
  week_number,
  estimated_minutes,
  completed,
  completed_at,
  created_at
`

const TIME_BLOCK_FIELDS = `
  id,
  user_id,
  class_id,
  coursework_id,
  title,
  block_date,
  start_time,
  end_time,
  block_type,
  is_recurring,
  recurrence_type,
  recurrence_end_date,
  auto_generated,
  lecture_id,
  completed,
  created_at
`

const useClassLectures = (
  classId,
  { fetchOnMount = true } = {},
) => {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(
    fetchOnMount,
  )
  const [error, setError] = useState(null)

  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      throw new Error(
        'You must be signed in to manage lectures.',
      )
    }

    return user
  }, [])

  const handleError = useCallback(
    (caughtError) => {
      const message =
        caughtError?.message ||
        'Something went wrong while managing lectures.'

      setError(message)
      return caughtError
    },
    [],
  )

  const mergeLecturesWithBlocks = useCallback(
    (lectureRows, blockRows) => {
      const blocksByLectureId = new Map(
        (blockRows || [])
          .filter((block) => block.lecture_id)
          .map((block) => [
            block.lecture_id,
            block,
          ]),
      )

      const mergedLectures = (
        lectureRows || []
      ).map((lecture) => ({
        ...lecture,
        timeBlock:
          blocksByLectureId.get(
            lecture.id,
          ) || null,
      }))

      return sortLectures(mergedLectures)
    },
    [],
  )

  const fetchLectures = useCallback(async () => {
    if (!classId) {
      setLectures([])
      setLoading(false)
      setError('A class ID is required.')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const user = await getCurrentUser()

      const [
        lecturesResult,
        blocksResult,
      ] = await Promise.all([
        supabase
          .from('lectures')
          .select(LECTURE_FIELDS)
          .eq('user_id', user.id)
          .eq('class_id', classId)
          .order('week_number', {
            ascending: true,
          }),

        supabase
          .from('time_blocks')
          .select(TIME_BLOCK_FIELDS)
          .eq('user_id', user.id)
          .eq('class_id', classId)
          .eq('block_type', 'Lecture')
          .order('block_date', {
            ascending: true,
          })
          .order('start_time', {
            ascending: true,
          }),
      ])

      if (lecturesResult.error) {
        throw lecturesResult.error
      }

      if (blocksResult.error) {
        throw blocksResult.error
      }

      const mergedLectures =
        mergeLecturesWithBlocks(
          lecturesResult.data,
          blocksResult.data,
        )

      setLectures(mergedLectures)
      return mergedLectures
    } catch (fetchError) {
      setLectures([])
      handleError(fetchError)
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [
    classId,
    getCurrentUser,
    handleError,
    mergeLecturesWithBlocks,
  ])

  useEffect(() => {
    if (!fetchOnMount) {
      return
    }

    fetchLectures().catch(() => {
      // Error state is already handled.
    })
  }, [fetchOnMount, fetchLectures])

  const createLecture = useCallback(
    async (formData) => {
      setError(null)

      if (!classId) {
        const idError = new Error(
          'A class ID is required to create a lecture.',
        )

        handleError(idError)
        throw idError
      }

      try {
        const user = await getCurrentUser()

        const title = formData.title?.trim()

        if (!title) {
          throw new Error(
            'Please enter a lecture title.',
          )
        }

        const weekNumber =
          formData.week_number === '' ||
          formData.week_number === null ||
          formData.week_number === undefined
            ? null
            : Number(formData.week_number)

        if (
          weekNumber !== null &&
          (
            Number.isNaN(weekNumber) ||
            weekNumber < 1
          )
        ) {
          throw new Error(
            'Week number must be at least 1.',
          )
        }

        const {
          data: createdLecture,
          error: lectureError,
        } = await supabase
          .from('lectures')
          .insert({
            user_id: user.id,
            class_id: classId,
            title,
            lecture_url:
              formData.lecture_url?.trim() ||
              null,
            week_number: weekNumber,
            estimated_minutes:
              formData.estimated_minutes === '' ||
              formData.estimated_minutes === null ||
              formData.estimated_minutes === undefined
                ? 90
                : Number(
                    formData.estimated_minutes,
                  ),
            completed: false,
            completed_at: null,
          })
          .select(LECTURE_FIELDS)
          .single()

        if (lectureError) {
          throw lectureError
        }

        const hasCompleteTimeBlock =
          formData.block_date &&
          formData.start_time &&
          formData.end_time

        let createdBlock = null

        if (hasCompleteTimeBlock) {
          const {
            data: blockData,
            error: blockError,
          } = await supabase
            .from('time_blocks')
            .insert({
              user_id: user.id,
              class_id: classId,
              coursework_id: null,
              title,
              block_date:
                formData.block_date,
              start_time:
                formData.start_time,
              end_time: formData.end_time,
              block_type: 'Lecture',
              is_recurring: false,
              recurrence_type: 'none',
              recurrence_end_date: null,
              auto_generated:
                formData.auto_generated ||
                false,
              lecture_id:
                createdLecture.id,
              completed: false,
            })
            .select(TIME_BLOCK_FIELDS)
            .single()

          if (blockError) {
            await supabase
              .from('lectures')
              .delete()
              .eq('id', createdLecture.id)
              .eq('user_id', user.id)

            throw blockError
          }

          createdBlock = blockData
        }

        const mergedLecture = {
          ...createdLecture,
          timeBlock: createdBlock,
        }

        setLectures(
          (previousLectures) =>
            sortLectures([
              ...previousLectures,
              mergedLecture,
            ]),
        )

        return mergedLecture
      } catch (createError) {
        handleError(createError)
        throw createError
      }
    },
    [
      classId,
      getCurrentUser,
      handleError,
    ],
  )

  const updateLecture = useCallback(
    async (lectureId, formData) => {
      setError(null)

      if (!lectureId) {
        const idError = new Error(
          'A lecture ID is required to update a lecture.',
        )

        handleError(idError)
        throw idError
      }

      try {
        const user = await getCurrentUser()

        const currentLecture =
          lectures.find(
            (lecture) =>
              lecture.id === lectureId,
          )

        if (!currentLecture) {
          throw new Error(
            'Lecture could not be found.',
          )
        }

        const title =
          formData.title?.trim()

        if (!title) {
          throw new Error(
            'Please enter a lecture title.',
          )
        }

        const weekNumber =
          formData.week_number === '' ||
          formData.week_number === null ||
          formData.week_number === undefined
            ? null
            : Number(formData.week_number)

        if (
          weekNumber !== null &&
          (
            Number.isNaN(weekNumber) ||
            weekNumber < 1
          )
        ) {
          throw new Error(
            'Week number must be at least 1.',
          )
        }

        const {
          data: updatedLecture,
          error: lectureError,
        } = await supabase
          .from('lectures')
          .update({
            title,
            lecture_url:
              formData.lecture_url?.trim() ||
              null,
            week_number: weekNumber,
            estimated_minutes:
              formData.estimated_minutes === '' ||
              formData.estimated_minutes === null ||
              formData.estimated_minutes === undefined
                ? currentLecture.estimated_minutes
                : Number(
                    formData.estimated_minutes,
                  ),
          })
          .eq('id', lectureId)
          .eq('user_id', user.id)
          .select(LECTURE_FIELDS)
          .single()

        if (lectureError) {
          throw lectureError
        }

        const hasCompleteTimeBlock =
          formData.block_date &&
          formData.start_time &&
          formData.end_time

        let updatedBlock =
          currentLecture.timeBlock

        if (
          currentLecture.timeBlock &&
          hasCompleteTimeBlock
        ) {
          const {
            data: blockData,
            error: blockError,
          } = await supabase
            .from('time_blocks')
            .update({
              title,
              block_date:
                formData.block_date,
              start_time:
                formData.start_time,
              end_time: formData.end_time,
            })
            .eq(
              'id',
              currentLecture.timeBlock.id,
            )
            .eq('user_id', user.id)
            .select(TIME_BLOCK_FIELDS)
            .single()

          if (blockError) {
            throw blockError
          }

          updatedBlock = blockData
        } else if (
          !currentLecture.timeBlock &&
          hasCompleteTimeBlock
        ) {
          const {
            data: blockData,
            error: blockError,
          } = await supabase
            .from('time_blocks')
            .insert({
              user_id: user.id,
              class_id: classId,
              coursework_id: null,
              title,
              block_date:
                formData.block_date,
              start_time:
                formData.start_time,
              end_time: formData.end_time,
              block_type: 'Lecture',
              is_recurring: false,
              recurrence_type: 'none',
              recurrence_end_date: null,
              auto_generated: false,
              lecture_id: lectureId,
              completed:
                currentLecture.completed,
            })
            .select(TIME_BLOCK_FIELDS)
            .single()

          if (blockError) {
            throw blockError
          }

          updatedBlock = blockData
        } else if (
          currentLecture.timeBlock &&
          !hasCompleteTimeBlock
        ) {
          const { error: blockError } =
            await supabase
              .from('time_blocks')
              .delete()
              .eq(
                'id',
                currentLecture.timeBlock.id,
              )
              .eq('user_id', user.id)

          if (blockError) {
            throw blockError
          }

          updatedBlock = null
        }

        const mergedLecture = {
          ...updatedLecture,
          timeBlock: updatedBlock,
        }

        setLectures(
          (previousLectures) =>
            sortLectures(
              previousLectures.map(
                (lecture) =>
                  lecture.id === lectureId
                    ? mergedLecture
                    : lecture,
              ),
            ),
        )

        return mergedLecture
      } catch (updateError) {
        handleError(updateError)
        throw updateError
      }
    },
    [
      classId,
      getCurrentUser,
      handleError,
      lectures,
    ],
  )

  const toggleLectureComplete =
    useCallback(
      async (lectureId) => {
        setError(null)

        try {
          const user =
            await getCurrentUser()

          const currentLecture =
            lectures.find(
              (lecture) =>
                lecture.id === lectureId,
            )

          if (!currentLecture) {
            throw new Error(
              'Lecture could not be found.',
            )
          }

          const nextCompleted =
            !currentLecture.completed

          const {
            data: updatedLecture,
            error: lectureError,
          } = await supabase
            .from('lectures')
            .update({
              completed: nextCompleted,
              completed_at: nextCompleted
                ? new Date().toISOString()
                : null,
            })
            .eq('id', lectureId)
            .eq('user_id', user.id)
            .select(LECTURE_FIELDS)
            .single()

          if (lectureError) {
            throw lectureError
          }

          let updatedBlock =
            currentLecture.timeBlock

          if (currentLecture.timeBlock) {
            const {
              data: blockData,
              error: blockError,
            } = await supabase
              .from('time_blocks')
              .update({
                completed: nextCompleted,
              })
              .eq(
                'id',
                currentLecture.timeBlock.id,
              )
              .eq('user_id', user.id)
              .select(TIME_BLOCK_FIELDS)
              .single()

            if (blockError) {
              throw blockError
            }

            updatedBlock = blockData
          }

          const mergedLecture = {
            ...updatedLecture,
            timeBlock: updatedBlock,
          }

          setLectures(
            (previousLectures) =>
              previousLectures.map(
                (lecture) =>
                  lecture.id === lectureId
                    ? mergedLecture
                    : lecture,
              ),
          )

          return mergedLecture
        } catch (toggleError) {
          handleError(toggleError)
          throw toggleError
        }
      },
      [
        getCurrentUser,
        handleError,
        lectures,
      ],
    )

  const deleteLecture = useCallback(
    async (lectureId) => {
      setError(null)

      if (!lectureId) {
        const idError = new Error(
          'A lecture ID is required to delete a lecture.',
        )

        handleError(idError)
        throw idError
      }

      try {
        const user = await getCurrentUser()

        const { error: blockError } =
          await supabase
            .from('time_blocks')
            .delete()
            .eq('lecture_id', lectureId)
            .eq('user_id', user.id)

        if (blockError) {
          throw blockError
        }

        const { error: lectureError } =
          await supabase
            .from('lectures')
            .delete()
            .eq('id', lectureId)
            .eq('user_id', user.id)

        if (lectureError) {
          throw lectureError
        }

        setLectures(
          (previousLectures) =>
            previousLectures.filter(
              (lecture) =>
                lecture.id !== lectureId,
            ),
        )
      } catch (deleteError) {
        handleError(deleteError)
        throw deleteError
      }
    },
    [getCurrentUser, handleError],
  )

  const nextLecture = useMemo(
    () => getNextLecture(lectures),
    [lectures],
  )

  const completedLectures = useMemo(
    () =>
      lectures.filter(
        (lecture) => lecture.completed,
      ),
    [lectures],
  )

  const upcomingLectures = useMemo(() => {
    const now = new Date()

    return lectures.filter((lecture) => {
      const blockDate =
        lecture.timeBlock?.block_date

      const startTime =
        lecture.timeBlock?.start_time

      if (!blockDate || !startTime) {
        return false
      }

      const lectureDate = new Date(
        `${blockDate}T${startTime.slice(
          0,
          5,
        )}`,
      )

      return lectureDate >= now
    })
  }, [lectures])

  return {
    lectures,
    nextLecture,
    completedLectures,
    upcomingLectures,
    loading,
    error,
    setError,
    fetchLectures,
    createLecture,
    updateLecture,
    toggleLectureComplete,
    deleteLecture,
  }
}

export default useClassLectures