import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const sortCourseworkByDueDate = (coursework) =>
  [...coursework].sort((firstAssignment, secondAssignment) =>
    firstAssignment.due_date.localeCompare(
      secondAssignment.due_date
    )
  )

const prepareCourseworkData = (formData) => {
  const title = formData.title.trim()

  if (!title) {
    throw new Error('Please enter an assignment title.')
  }

  if (!formData.class_id) {
    throw new Error('Please select a class.')
  }

  if (!formData.due_date) {
    throw new Error('Please select a due date.')
  }

  const hours =
    formData.hours === '' || formData.hours === null
      ? null
      : Number(formData.hours)

  const grade =
    formData.grade === '' || formData.grade === null
      ? null
      : Number(formData.grade)

  if (
    hours !== null &&
    (Number.isNaN(hours) || hours < 0)
  ) {
    throw new Error(
      'Estimated hours cannot be negative.'
    )
  }

  if (
    grade !== null &&
    (Number.isNaN(grade) || grade < 0 || grade > 100)
  ) {
    throw new Error(
      'Grade must be between 0 and 100.'
    )
  }

  return {
    class_id: formData.class_id,
    title,
    description:
      formData.description?.trim() || null,
    due_date: formData.due_date,
    status: formData.status || 'not_started',
    hours,
    grade,
  }
}

const useCoursework = () => {
  const [coursework, setCoursework] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const [classesResult, courseworkResult] =
        await Promise.all([
          supabase
            .from('classes')
            .select('id, name, code, color')
            .order('name', { ascending: true }),

          supabase
            .from('assignments')
            .select(`
              id,
              class_id,
              title,
              description,
              due_date,
              status,
              hours,
              grade
            `)
            .order('due_date', { ascending: true }),
        ])

      const errors = []

      if (classesResult.error) {
        errors.push(classesResult.error.message)
        setClasses([])
      } else {
        setClasses(classesResult.data || [])
      }

      if (courseworkResult.error) {
        errors.push(courseworkResult.error.message)
        setCoursework([])
      } else {
        setCoursework(courseworkResult.data || [])
      }

      if (errors.length > 0) {
        setError(errors.join(' '))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const createCoursework = async (formData) => {
    setSaving(true)
    setError(null)

    try {
      const courseworkData =
        prepareCourseworkData(formData)

      const { data, error: insertError } =
        await supabase
          .from('assignments')
          .insert(courseworkData)
          .select(`
            id,
            class_id,
            title,
            description,
            due_date,
            status,
            hours,
            grade
          `)
          .single()

      if (insertError) {
        throw insertError
      }

      setCoursework((previousCoursework) =>
        sortCourseworkByDueDate([
          ...previousCoursework,
          data,
        ])
      )

      return data
    } catch (createError) {
      setError(createError.message)
      throw createError
    } finally {
      setSaving(false)
    }
  }

  const updateCoursework = async (
    courseworkId,
    formData
  ) => {
    setSaving(true)
    setError(null)

    try {
      if (!courseworkId) {
        throw new Error(
          'No coursework item was selected.'
        )
      }

      const courseworkData =
        prepareCourseworkData(formData)

      const { data, error: updateError } =
        await supabase
          .from('assignments')
          .update(courseworkData)
          .eq('id', courseworkId)
          .select(`
            id,
            class_id,
            title,
            description,
            due_date,
            status,
            hours,
            grade
          `)
          .single()

      if (updateError) {
        throw updateError
      }

      setCoursework((previousCoursework) =>
        sortCourseworkByDueDate(
          previousCoursework.map((assignment) =>
            assignment.id === courseworkId
              ? data
              : assignment
          )
        )
      )

      return data
    } catch (updateError) {
      setError(updateError.message)
      throw updateError
    } finally {
      setSaving(false)
    }
  }

  const deleteCoursework = async (courseworkId) => {
    setDeletingId(courseworkId)
    setError(null)

    try {
      const { error: timeBlocksError } =
        await supabase
          .from('time_blocks')
          .delete()
          .eq('coursework_id', courseworkId)

      if (timeBlocksError) {
        throw timeBlocksError
      }

      const { error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .eq('id', courseworkId)

      if (deleteError) {
        throw deleteError
      }

      setCoursework((previousCoursework) =>
        previousCoursework.filter(
          (assignment) =>
            assignment.id !== courseworkId
        )
      )
    } catch (deleteError) {
      setError(deleteError.message)
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
    createCoursework,
    updateCoursework,
    deleteCoursework,
  }
}

export default useCoursework