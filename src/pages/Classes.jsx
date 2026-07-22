import { useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import useClasses from '../hooks/useClasses'
import { classFields } from '../config/classFields'

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

  const {
    classes,
    loading,
    error,
    createClass,
  } = useClasses()

  const handleCreateClass = async (formData) => {
    await createClass(formData)
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Classes"
        title="Your Classes"
        description="Manage your classes and stay organized with ease."
        buttonText={
          loading ? 'Loading Classes...' : 'Add Class'
        }
        onButtonClick={() => {
          if (!loading) {
            setIsModalOpen(true)
          }
        }}
      />

      {error && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
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
            Loading classes...
          </p>
        ) : classes.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-(--border) bg-(--bg-card) p-8 text-center">
            <h2 className="text-lg font-bold text-(--text-primary)">
              No classes yet
            </h2>

            <p className="mt-2 text-sm text-(--text-muted)">
              Add your first class to get started.
            </p>
          </div>
        ) : (
          classes.map((classItem) => (
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
                  style={{
                    backgroundColor:
                      classItem.color || '#26371f',
                  }}
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
          ))
        )}
      </section>

      <FormModal
        isOpen={isModalOpen}
        title="Add Class"
        fields={classFields}
        initialValues={initialClassValues}
        onSubmit={handleCreateClass}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Classes