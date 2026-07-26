import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  getTimetableFields,
} from '../config/timetableFields'
import {
  findBlockClash,
} from '../utils/timetable'
import {
  normaliseTime,
} from '../utils/datetime'
import {
  fetchTimetableData,
  insertTimeBlock,
  updateTimeBlockRow,
  deleteTimeBlockRow,
} from '../services/timetableService'

const useTimetable = () => {
  const [blocks, setBlocks] =
    useState([])
  const [classes, setClasses] =
    useState([])
  const [
    assignments,
    setAssignments,
  ] = useState([])
  const [loading, setLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)
  const [
    pageError,
    setPageError,
  ] = useState(null)

  const getUser = useCallback(
    async () => {
      const {
        data: { user },
        error,
      } =
        await supabase.auth.getUser()

      if (error) {
        throw error
      }

      if (!user) {
        throw new Error(
          'You must be signed in to view your timetable.',
        )
      }

      return user
    },
    [],
  )

  const fetchTimetable =
    useCallback(async () => {
      setLoading(true)
      setPageError(null)

      try {
        const user =
          await getUser()

        const data =
          await fetchTimetableData(
            user.id,
          )

        setBlocks(data.blocks)
        setClasses(data.classes)
        setAssignments(
          data.assignments,
        )

        return data
      } catch (error) {
        setPageError(error.message)
        throw error
      } finally {
        setLoading(false)
      }
    }, [getUser])

  useEffect(() => {
    fetchTimetable().catch(() => {})
  }, [fetchTimetable])

  const timetableFields = useMemo(
    () =>
      getTimetableFields({
        classes,
        assignments,
      }),
    [classes, assignments],
  )

  const createTimetableBlock =
    useCallback(
      async (formData) => {
        setSaving(true)
        setPageError(null)

        try {
          const user =
            await getUser()

          const title =
            formData.title?.trim()

          if (!title) {
            throw new Error(
              'Please enter an event title.',
            )
          }

          const startTime =
            normaliseTime(
              formData.start_time,
            )

          const endTime =
            normaliseTime(
              formData.end_time,
            )

          const clash =
            findBlockClash({
              blocks,
              blockDate:
                formData.block_date,
              startTime,
              endTime,
            })

          if (clash) {
            throw new Error(clash)
          }

          const createdBlock =
            await insertTimeBlock({
              user_id: user.id,
              title,
              class_id:
                formData.class_id ||
                null,
              coursework_id:
                formData.coursework_id ||
                null,
              lecture_id: null,
              block_date:
                formData.block_date,
              start_time: startTime,
              end_time: endTime,
              block_type:
                formData.block_type ||
                'Personal',
              is_recurring: Boolean(
                formData.is_recurring,
              ),
              recurrence_type:
                formData.is_recurring
                  ? formData.recurrence_type
                  : 'none',
              recurrence_end_date:
                formData.is_recurring
                  ? formData.recurrence_end_date ||
                    null
                  : null,
              auto_generated: false,
              completed: false,
            })

          setBlocks((current) => [
            ...current,
            createdBlock,
          ])

          return createdBlock
        } catch (error) {
          setPageError(error.message)
          throw error
        } finally {
          setSaving(false)
        }
      },
      [blocks, getUser],
    )

  const updateTimetableBlock =
    useCallback(
      async (
        blockId,
        formData,
      ) => {
        setSaving(true)
        setPageError(null)

        try {
          const user =
            await getUser()

          const currentBlock =
            blocks.find(
              (block) =>
                block.id === blockId,
            )

          if (!currentBlock) {
            throw new Error(
              'That event no longer exists.',
            )
          }

          if (
            currentBlock.lecture_id
          ) {
            throw new Error(
              'Edit lecture events from the class page.',
            )
          }

          const startTime =
            normaliseTime(
              formData.start_time,
            )

          const endTime =
            normaliseTime(
              formData.end_time,
            )

          const clash =
            findBlockClash({
              blocks,
              blockDate:
                formData.block_date,
              startTime,
              endTime,
              ignoreBlockId:
                blockId,
            })

          if (clash) {
            throw new Error(clash)
          }

          const updatedBlock =
            await updateTimeBlockRow(
              blockId,
              user.id,
              {
                title:
                  formData.title?.trim(),
                class_id:
                  formData.class_id ||
                  null,
                coursework_id:
                  formData.coursework_id ||
                  null,
                block_date:
                  formData.block_date,
                start_time:
                  startTime,
                end_time: endTime,
                block_type:
                  formData.block_type,
                is_recurring:
                  Boolean(
                    formData.is_recurring,
                  ),
                recurrence_type:
                  formData.is_recurring
                    ? formData.recurrence_type
                    : 'none',
                recurrence_end_date:
                  formData.is_recurring
                    ? formData.recurrence_end_date ||
                      null
                    : null,
              },
            )

          setBlocks((current) =>
            current.map((block) =>
              block.id === blockId
                ? updatedBlock
                : block,
            ),
          )

          return updatedBlock
        } catch (error) {
          setPageError(error.message)
          throw error
        } finally {
          setSaving(false)
        }
      },
      [blocks, getUser],
    )

  const deleteTimetableBlock =
    useCallback(
      async (block) => {
        setPageError(null)

        if (block.lecture_id) {
          setPageError(
            'Delete lecture events from the class page.',
          )
          return
        }

        try {
          const user =
            await getUser()

          await deleteTimeBlockRow(
            block.id,
            user.id,
          )

          setBlocks((current) =>
            current.filter(
              (item) =>
                item.id !== block.id,
            ),
          )
        } catch (error) {
          setPageError(error.message)
          throw error
        }
      },
      [getUser],
    )

  return {
    blocks,
    classes,
    assignments,
    timetableFields,
    loading,
    loadingOptions: loading,
    saving,
    pageError,
    setPageError,
    fetchTimetable,
    createTimetableBlock,
    updateTimetableBlock,
    deleteTimetableBlock,
  }
}

export default useTimetable
