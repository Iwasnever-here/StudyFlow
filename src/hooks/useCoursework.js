import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'

const ASSIGNMENT_FIELDS = `
  id,
  class_id,
  title,
  description,
  due_date,
  status,
  hours,
  grade
`

const sortCourseworkByDueDate = (
  coursework,
) =>
  [...coursework].sort(
    (
      firstAssignment,
      secondAssignment,
    ) =>
      firstAssignment.due_date.localeCompare(
        secondAssignment.due_date,
      ),
  )

const prepareCourseworkData = (
  formData,
) => {
  const title =
    formData.title.trim()

  if (!title) {
    throw new Error(
      'Please enter an assignment title.',
    )
  }

  if (!formData.class_id) {
    throw new Error(
      'Please select a class.',
    )
  }

  if (!formData.due_date) {
    throw new Error(
      'Please select a due date.',
    )
  }

  const hours =
    formData.hours === '' ||
    formData.hours === null
      ? null
      : Number(formData.hours)

  const grade =
    formData.grade === '' ||
    formData.grade === null
      ? null
      : Number(formData.grade)

  if (
    hours !== null &&
    (Number.isNaN(hours) ||
      hours < 0)
  ) {
    throw new Error(
      'Estimated hours cannot be negative.',
    )
  }

  if (
    grade !== null &&
    (Number.isNaN(grade) ||
      grade < 0 ||
      grade > 100)
  ) {
    throw new Error(
      'Grade must be between 0 and 100.',
    )
  }

  return {
    class_id: formData.class_id,
    title,
    description:
      formData.description?.trim() ||
      null,
    due_date: formData.due_date,
    status:
      formData.status ||
      'not_started',
    hours,
    grade,
  }
}

const useCoursework = () => {
  const [coursework, setCoursework] =
    useState([])
  const [classes, setClasses] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)
  const [
    deletingId,
    setDeletingId,
  ] = useState(null)
  const [error, setError] =
    useState(null)

  const getUser = useCallback(
    async () => {
      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser()

      if (authError) {
        throw authError
      }

      if (!user) {
        throw new Error(
          'You must be signed in to view coursework.',
        )
      }

      return user
    },
    [],
  )

  const fetchData =
    useCallback(async () => {
      setLoading(true)
      setError(null)

      try {
        const user =
          await getUser()

        const [
          classesResult,
          courseworkResult,
        ] = await Promise.all([
          supabase
            .from('classes')
            .select(
              'id, name, code, color',
            )
            .eq(
              'user_id',
              user.id,
            )
            .order('name', {
              ascending: true,
            }),

          supabase
            .from('assignments')
            .select(
              ASSIGNMENT_FIELDS,
            )
            .eq(
              'user_id',
              user.id,
            )
            .order('due_date', {
              ascending: true,
            }),
        ])

        if (classesResult.error) {
          throw classesResult.error
        }

        if (
          courseworkResult.error
        ) {
          throw courseworkResult.error
        }

        setClasses(
          classesResult.data || [],
        )

        setCoursework(
          courseworkResult.data || [],
        )
      } catch (fetchError) {
        setError(fetchError.message)
        setClasses([])
        setCoursework([])
      } finally {
        setLoading(false)
      }
    }, [getUser])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createCoursework =
    async (formData) => {
      setSaving(true)
      setError(null)

      try {
        const user =
          await getUser()

        const courseworkData =
          prepareCourseworkData(
            formData,
          )

        const {
          data,
          error: insertError,
        } = await supabase
          .from('assignments')
          .insert({
            ...courseworkData,
            user_id: user.id,
          })
          .select(
            ASSIGNMENT_FIELDS,
          )
          .single()

        if (insertError) {
          throw insertError
        }

        setCoursework(
          (previousCoursework) =>
            sortCourseworkByDueDate([
              ...previousCoursework,
              data,
            ]),
        )

        return data
      } catch (createError) {
        setError(
          createError.message,
        )
        throw createError
      } finally {
        setSaving(false)
      }
    }

  const updateCoursework =
    async (
      courseworkId,
      formData,
    ) => {
      setSaving(true)
      setError(null)

      try {
        const user =
          await getUser()

        const courseworkData =
          prepareCourseworkData(
            formData,
          )

        const {
          data,
          error: updateError,
        } = await supabase
          .from('assignments')
          .update(courseworkData)
          .eq('id', courseworkId)
          .eq(
            'user_id',
            user.id,
          )
          .select(
            ASSIGNMENT_FIELDS,
          )
          .single()

        if (updateError) {
          throw updateError
        }

        setCoursework(
          (previousCoursework) =>
            sortCourseworkByDueDate(
              previousCoursework.map(
                (assignment) =>
                  assignment.id ===
                  courseworkId
                    ? data
                    : assignment,
              ),
            ),
        )

        return data
      } catch (updateError) {
        setError(
          updateError.message,
        )
        throw updateError
      } finally {
        setSaving(false)
      }
    }

  const deleteCoursework =
    async (courseworkId) => {
      setDeletingId(
        courseworkId,
      )
      setError(null)

      try {
        const user =
          await getUser()

        const {
          error: timeBlocksError,
        } = await supabase
          .from('time_blocks')
          .delete()
          .eq(
            'coursework_id',
            courseworkId,
          )
          .eq(
            'user_id',
            user.id,
          )

        if (timeBlocksError) {
          throw timeBlocksError
        }

        const {
          error: deleteError,
        } = await supabase
          .from('assignments')
          .delete()
          .eq('id', courseworkId)
          .eq(
            'user_id',
            user.id,
          )

        if (deleteError) {
          throw deleteError
        }

        setCoursework(
          (previousCoursework) =>
            previousCoursework.filter(
              (assignment) =>
                assignment.id !==
                courseworkId,
            ),
        )
      } catch (deleteError) {
        setError(
          deleteError.message,
        )
        throw deleteError
      } finally {
        setDeletingId(null)
      }
    }

  return {
    coursework,
    classes,
    loading,
    saving,
    deletingId,
    error,
    setError,
    fetchData,
    createCoursework,
    updateCoursework,
    deleteCoursework,
  }
}

export default useCoursework
