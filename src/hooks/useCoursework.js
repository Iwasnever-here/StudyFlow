import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const useCoursework = () => {
  const [coursework, setCoursework] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const [classesResult, courseworkResult] =
        await Promise.all([
          supabase
            .from('classes')
            .select('id, name, code')
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

      if (classesResult.error) {
        setError(classesResult.error.message)
        setClasses([])
      } else {
        setClasses(classesResult.data || [])
      }

      if (courseworkResult.error) {
        setError((currentError) =>
          currentError
            ? `${currentError} ${courseworkResult.error.message}`
            : courseworkResult.error.message
        )

        setCoursework([])
      } else {
        setCoursework(courseworkResult.data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const createCoursework = async (formData) => {
    setError(null)

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
      formData.hours === ''
        ? null
        : Number(formData.hours)

    const grade =
      formData.grade === ''
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

    const { data, error: insertError } = await supabase
      .from('assignments')
      .insert({
        class_id: formData.class_id,
        title,
        description:
          formData.description.trim() || null,
        due_date: formData.due_date,
        status: formData.status,
        hours,
        grade,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      throw insertError
    }

    setCoursework((previousCoursework) =>
      [...previousCoursework, data].sort(
        (firstAssignment, secondAssignment) =>
          firstAssignment.due_date.localeCompare(
            secondAssignment.due_date
          )
      )
    )

    return data
  }

  return {
    coursework,
    classes,
    loading,
    error,
    setError,
    createCoursework,
  }
}

export default useCoursework