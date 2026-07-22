import { useMemo, useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import useCoursework from '../hooks/useCoursework'
import {
  getCourseworkFields,
  initialCourseworkValues,
} from '../config/courseworkFields'

const Coursework = () => {
  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const {
    coursework,
    classes,
    loading,
    error,
    setError,
    createCoursework,
  } = useCoursework()

  const courseworkFields = useMemo(
    () => getCourseworkFields(classes),
    [classes]
  )

  const handleOpenModal = () => {
    if (loading) {
      return
    }

    if (classes.length === 0) {
      setError(
        'Create a class before adding coursework.'
      )
      return
    }

    setError(null)
    setIsModalOpen(true)
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Coursework"
        title="Your Coursework"
        description="Keep on track with your coursework in one place."
        buttonText={
          loading
            ? 'Loading Coursework...'
            : 'Add Coursework'
        }
        onButtonClick={handleOpenModal}
      />

      {error && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <div className="rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
            <p className="text-sm font-medium text-(--error-text)">
              {error}
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-sm text-(--text-muted)">
            Loading coursework...
          </p>
        ) : coursework.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-(--border) bg-(--bg-card) p-8 text-center">
            <h2 className="text-lg font-bold text-(--text-primary)">
              No coursework yet
            </h2>

            <p className="mt-2 text-sm text-(--text-muted)">
              Add your first assignment to get started.
            </p>
          </div>
        ) : (
          coursework.map((assignment) => {
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
                      Estimated hours:{' '}
                      {assignment.hours}
                    </p>
                  )}

                  {assignment.grade !== null && (
                    <p>
                      Grade: {assignment.grade}%
                    </p>
                  )}
                </div>
              </article>
            )
          })
        )}
      </section>

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