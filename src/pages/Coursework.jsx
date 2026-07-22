import { useEffect, useMemo, useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import { supabase } from '../lib/supabaseClient'

const initialCourseworkValues = {
  class_id: '',
  title: '',
  description: '',
  due_date: '',
  status: 'not_started',
  hours: '',
  grade: '',
}

const Coursework = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coursework, setCoursework] = useState([])
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [pageError, setPageError] = useState(null)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true)
      setPageError(null)

      const { data, error } = await supabase
        .from('classes')
        .select('id, name, code')
        .order('name', { ascending: true })

      if (error) {
        setPageError(error.message)
        setClasses([])
      } else {
        setClasses(data || [])
      }

      setLoadingClasses(false)
    }

    fetchClasses()
  }, [])

  const courseworkFields = useMemo(
    () => [
      {
        name: 'class_id',
        label: 'Class',
        type: 'select',
        required: true,
        options: classes.map((classItem) => ({
          label: classItem.code
            ? `${classItem.code} — ${classItem.name}`
            : classItem.name,
          value: classItem.id,
        })),
      },
      {
        name: 'title',
        label: 'Coursework Title',
        type: 'text',
        placeholder: 'Enter coursework title',
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter coursework details',
      },
      {
        name: 'due_date',
        label: 'Due Date',
        type: 'date',
        required: true,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          {
            label: 'Not Started',
            value: 'not_started',
          },
          {
            label: 'In Progress',
            value: 'in_progress',
          },
          {
            label: 'Completed',
            value: 'completed',
          },
        ],
      },
      {
        name: 'hours',
        label: 'Estimated Hours',
        type: 'number',
        placeholder: 'Enter estimated hours',
      },
      {
        name: 'grade',
        label: 'Grade (%)',
        type: 'number',
        placeholder: 'Leave blank until marked',
      },
    ],
    [classes]
  )

  const createCoursework = async (formData) => {
    const title = formData.title.trim()

    if (!title) {
      throw new Error('Please enter an assignment title.')
    }

    if (!formData.class_id) {
      throw new Error('Please select a class.')
    }

    const hours =
      formData.hours === '' ? null : Number(formData.hours)

    const grade =
      formData.grade === '' ? null : Number(formData.grade)

    if (hours !== null && hours < 0) {
      throw new Error('Estimated hours cannot be negative.')
    }

    if (grade !== null && (grade < 0 || grade > 100)) {
      throw new Error('Grade must be between 0 and 100.')
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        class_id: formData.class_id,
        title,
        description: formData.description.trim() || null,
        due_date: formData.due_date,
        status: formData.status,
        hours,
        grade,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    setCoursework((previousCoursework) => [
      data,
      ...previousCoursework,
    ])
  }

  const handleOpenModal = () => {
    if (loadingClasses) {
      return
    }

    if (classes.length === 0) {
      setPageError(
        'Create a class before adding coursework.'
      )
      return
    }

    setPageError(null)
    setIsModalOpen(true)
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Coursework"
        title="Your Coursework"
        description="Keep on track with your coursework in one place."
        buttonText={
          loadingClasses ? 'Loading Classes...' : 'Add Coursework'
        }
        onButtonClick={handleOpenModal}
      />

      {pageError && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <div className="rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
            <p className="text-sm font-medium text-(--error-text)">
              {pageError}
            </p>
          </div>
        </div>
      )}

      {coursework.length > 0 && (
        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {coursework.map((assignment) => {
            const linkedClass = classes.find(
              (classItem) =>
                classItem.id === assignment.class_id
            )

            return (
              <article
                key={assignment.id}
                className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 shadow-sm"
              >
                <div className="mb-4">
                  <p className="text-sm font-semibold text-(--color-secondary)">
                    {linkedClass?.code ||
                      linkedClass?.name ||
                      'Class'}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-(--text-primary)">
                    {assignment.title}
                  </h2>
                </div>

                {assignment.description && (
                  <p className="mb-4 text-sm text-(--text-secondary)">
                    {assignment.description}
                  </p>
                )}

                <div className="space-y-1 text-sm text-(--text-muted)">
                  <p>
                    Due:{' '}
                    {new Date(
                      `${assignment.due_date}T00:00:00`
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    Status:{' '}
                    {assignment.status
                      .replaceAll('_', ' ')
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )}
                  </p>

                  {assignment.hours !== null && (
                    <p>
                      Estimated hours: {assignment.hours}
                    </p>
                  )}

                  {assignment.grade !== null && (
                    <p>Grade: {assignment.grade}%</p>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      <FormModal
        isOpen={isModalOpen}
        title="Add Assignment"
        fields={courseworkFields}
        initialValues={initialCourseworkValues}
        onSubmit={createCoursework}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Coursework