import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getTimetableFields } from '../config/timetableFields'

const useTimetable = () => {
  const [classes, setClasses] = useState([])
  const [coursework, setCoursework] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [pageError, setPageError] = useState(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      setPageError(null)

      const [classesResult, courseworkResult] =
        await Promise.all([
          supabase
            .from('classes')
            .select('id, name, code')
            .order('name', { ascending: true }),

          supabase
            .from('assignments')
            .select('id, title, class_id')
            .order('title', { ascending: true }),
        ])

      if (classesResult.error) {
        setPageError(classesResult.error.message)
        setClasses([])
      } else {
        setClasses(classesResult.data || [])
      }

      if (courseworkResult.error) {
        setPageError((currentError) =>
          currentError
            ? `${currentError} ${courseworkResult.error.message}`
            : courseworkResult.error.message
        )

        setCoursework([])
      } else {
        setCoursework(courseworkResult.data || [])
      }

      setLoadingOptions(false)
    }

    fetchOptions()
  }, [])

  const timetableFields = useMemo(
    () => getTimetableFields(classes, coursework),
    [classes, coursework]
  )

  const createTimetableBlock = async (formData) => {
    setPageError(null)

    const title = formData.title.trim()

    if (!title) {
      throw new Error('Please enter an event title.')
    }

    if (!formData.block_date) {
      throw new Error('Please select a date.')
    }

    if (!formData.start_time || !formData.end_time) {
      throw new Error(
        'Please enter a start and end time.'
      )
    }

    if (formData.end_time <= formData.start_time) {
      throw new Error(
        'End time must be after the start time.'
      )
    }

    if (
      formData.is_recurring &&
      !formData.recurrence_type
    ) {
      throw new Error(
        'Please select a recurrence type.'
      )
    }

    if (
      formData.is_recurring &&
      !formData.recurrence_end_date
    ) {
      throw new Error(
        'Please select a recurrence end date.'
      )
    }

    if (
      formData.is_recurring &&
      formData.recurrence_end_date <
        formData.block_date
    ) {
      throw new Error(
        'Recurrence end date cannot be before the event date.'
      )
    }

    const { data, error } = await supabase
      .from('timetable_blocks')
      .insert({
        class_id: formData.class_id || null,
        coursework_id:
          formData.coursework_id || null,
        title,
        block_date: formData.block_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        block_type: formData.block_type,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring
          ? formData.recurrence_type
          : null,
        recurrence_end_date:
          formData.is_recurring
            ? formData.recurrence_end_date
            : null,
      })
      .select()
      .single()

    if (error) {
      setPageError(error.message)
      throw error
    }

    return data
  }

  return {
    classes,
    coursework,
    timetableFields,
    loadingOptions,
    pageError,
    setPageError,
    createTimetableBlock,
  }
}

export default useTimetable