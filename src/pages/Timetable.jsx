import { useEffect, useMemo, useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import { supabase } from '../lib/supabaseClient'
import { timetableFields } from '../config/timetableFields'
const initialTimetableValues = {
  class_id: '',
  coursework_id: '',
  title: '',
  block_date: '',
  start_time: '',
  end_time: '',
  block_type: 'study',
  is_recurring: false,
  recurrence_type: '',
  recurrence_end_date: '',
}

const Timetable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classes, setClasses] = useState([])
  const [coursework, setCoursework] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [pageError, setPageError] = useState(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      setPageError(null)

      const [classesResult, courseworkResult] = await Promise.all([
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



  const createTimetableBlock = async (formData) => {
    const title = formData.title.trim()

    if (!title) {
      throw new Error('Please enter an event title.')
    }

    if (!formData.block_date) {
      throw new Error('Please select a date.')
    }

    if (!formData.start_time || !formData.end_time) {
      throw new Error('Please enter a start and end time.')
    }

    if (formData.end_time <= formData.start_time) {
      throw new Error('End time must be after the start time.')
    }

    if (formData.is_recurring && !formData.recurrence_type) {
      throw new Error('Please select a recurrence type.')
    }

    if (
      formData.is_recurring &&
      !formData.recurrence_end_date
    ) {
      throw new Error('Please select a recurrence end date.')
    }

    if (
      formData.is_recurring &&
      formData.recurrence_end_date < formData.block_date
    ) {
      throw new Error(
        'Recurrence end date cannot be before the event date.'
      )
    }

    const { error } = await supabase
      .from('timetable_blocks')
      .insert({
        class_id: formData.class_id || null,
        coursework_id: formData.coursework_id || null,
        title,
        block_date: formData.block_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        block_type: formData.block_type,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring
          ? formData.recurrence_type
          : null,
        recurrence_end_date: formData.is_recurring
          ? formData.recurrence_end_date
          : null,
      })

    if (error) {
      throw error
    }
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Timetable"
        title="Your Timetable"
        description="Organize your schedule and manage your time effectively."
        buttonText={
          loadingOptions ? 'Loading...' : 'Add Event'
        }
        onButtonClick={() => {
          if (!loadingOptions) {
            setPageError(null)
            setIsModalOpen(true)
          }
        }}
      />

      {pageError && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--error-text)]">
              {pageError}
            </p>
          </div>
        </div>
      )}

      <FormModal
        isOpen={isModalOpen}
        title="Add Timetable Event"
        fields={timetableFields}
        initialValues={initialTimetableValues}
        onSubmit={createTimetableBlock}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Timetable