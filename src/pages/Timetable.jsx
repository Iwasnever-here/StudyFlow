import { useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import useTimetable from '../hooks/useTimetable'
import { initialTimetableValues } from '../config/timetableFields'

const Timetable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    timetableFields,
    loadingOptions,
    pageError,
    setPageError,
    createTimetableBlock,
  } = useTimetable()

  const handleOpenModal = () => {
    if (loadingOptions) {
      return
    }

    setPageError(null)
    setIsModalOpen(true)
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