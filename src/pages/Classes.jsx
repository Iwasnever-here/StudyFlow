import { useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import { supabase } from '../lib/supabaseClient'

const classFields = [
  {
    name: 'name',
    label: 'Class Name',
    type: 'text',
    placeholder: 'Enter class name',
    required: true,
  },
  {
    name: 'code',
    label: 'Class Code',
    type: 'text',
    placeholder: 'Enter class code',
    required: true,
  },
  {
    name: 'lecturer',
    label: 'Lecturer',
    type: 'text',
    placeholder: 'Enter lecturer name',
  },
  {
    name: 'color',
    label: 'Class Color',
    type: 'color',
  },
  {
    name: 'target_grade',
    label: 'Target Grade',
    type: 'number',
    placeholder: 'Enter target grade',
  },
  {
    name: 'credits',
    label: 'Credits',
    type: 'number',
    placeholder: 'Enter class credits',
  },
]

const initialClassValues = {
  name: '',
  code: '',
  lecturer: '',
  color: '#26371f',
  target_grade: '',
  credits: '',
}

const Classes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classes, setClasses] = useState([])
  const [error, setError] = useState(null)

  const createClass = async (formData) => {
    setError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      throw new Error('You must be signed in to add a class.')
    }

    const newClass = {
      user_id: user.id,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      lecturer: formData.lecturer.trim() || null,
      color: formData.color || '#26371f',
      target_grade:
        formData.target_grade === ''
          ? null
          : Number(formData.target_grade),
      credits:
        formData.credits === ''
          ? null
          : Number(formData.credits),
    }

    const { data, error: insertError } = await supabase
      .from('classes')
      .insert(newClass)
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    setClasses((previousClasses) => [
      data,
      ...previousClasses,
    ])
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Classes"
        title="Your Classes"
        description="Manage your classes and stay organized with ease."
        buttonText="Add Class"
        onButtonClick={() => setIsModalOpen(true)}
      />

      {error && (
        <p className="mx-auto mt-4 max-w-6xl text-sm text-(--error-text)">
          {error}
        </p>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <article
            key={classItem.id}
            className="rounded-2xl border border-(--border) bg-(--bg-card) p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-(--color-secondary)">
                  {classItem.code}
                </p>

                <h2 className="text-xl font-bold text-(--text-primary)">
                  {classItem.name}
                </h2>
              </div>

              <span
                className="h-5 w-5 shrink-0 rounded-full border border-(--border)"
                style={{ backgroundColor: classItem.color }}
              />
            </div>

            {classItem.lecturer && (
              <p className="text-sm text-(--text-secondary)">
                Lecturer: {classItem.lecturer}
              </p>
            )}

            {classItem.target_grade !== null && (
              <p className="mt-2 text-sm text-(--text-muted)">
                Target grade: {classItem.target_grade}
              </p>
            )}

            {classItem.credits !== null && (
              <p className="mt-1 text-sm text-(--text-muted)">
                Credits: {classItem.credits}
              </p>
            )}
          </article>
        ))}
      </section>

      <FormModal
        isOpen={isModalOpen}
        title="Add Class"
        fields={classFields}
        initialValues={initialClassValues}
        onSubmit={createClass}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Classes