import { useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import useClasses from '../hooks/useClasses'
import { classFields } from '../config/classFields'
import Folder from '../components/Folder'

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

      <section className="mx-auto grid max-w-8xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
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
  <Folder
    key={classItem.id}
    classItem={classItem}
  />
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