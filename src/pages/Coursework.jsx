import { useMemo, useState } from 'react'
import { LuBookOpen } from 'react-icons/lu'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import CourseworkCard from '../components/coursework/CourseworkCard'
import useCoursework from '../hooks/useCoursework'
import {
  getCourseworkFields,
  initialCourseworkValues,
} from '../config/courseworkFields'

const getEditValues = (assignment) => ({
  class_id: assignment.class_id || '',
  title: assignment.title || '',
  description: assignment.description || '',
  due_date: assignment.due_date || '',
  status: assignment.status || 'not_started',
  hours:
    assignment.hours === null ||
    assignment.hours === undefined
      ? ''
      : String(assignment.hours),
  grade:
    assignment.grade === null ||
    assignment.grade === undefined
      ? ''
      : String(assignment.grade),
})

const Coursework = () => {
  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingCoursework, setEditingCoursework] =
    useState(null)

  const {
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
  } = useCoursework()

  const courseworkFields = useMemo(
    () => getCourseworkFields(classes),
    [classes]
  )

  const classesById = useMemo(
    () =>
      Object.fromEntries(
        classes.map((classItem) => [
          classItem.id,
          classItem,
        ])
      ),
    [classes]
  )

  const modalInitialValues = useMemo(() => {
    if (!editingCoursework) {
      return initialCourseworkValues
    }

    return getEditValues(editingCoursework)
  }, [editingCoursework])

  const handleOpenCreateModal = () => {
    if (loading || saving) {
      return
    }

    if (classes.length === 0) {
      setError(
        'Create a class before adding coursework.'
      )
      return
    }

    setError(null)
    setEditingCoursework(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (assignment) => {
    setError(null)
    setEditingCoursework(assignment)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (saving) {
      return
    }

    setIsModalOpen(false)
    setEditingCoursework(null)
  }

  const handleSubmit = async (formData) => {
    if (editingCoursework) {
      await updateCoursework(
        editingCoursework.id,
        formData
      )
    } else {
      await createCoursework(formData)
    }

    setIsModalOpen(false)
    setEditingCoursework(null)
  }

  const handleDelete = async (assignment) => {
    const confirmed = window.confirm(
      `Delete "${assignment.title}"? This cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteCoursework(assignment.id)

      if (
        editingCoursework?.id === assignment.id
      ) {
        setIsModalOpen(false)
        setEditingCoursework(null)
      }
    } catch {
      // Error is handled by the hook.
    }
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
        onButtonClick={handleOpenCreateModal}
      />

      {error && (
        <div className="mx-auto mt-6 max-w-8xl px-4">
          <div className="rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
            <p className="text-sm font-medium text-(--error-text)">
              {error}
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-8xl gap-5 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-sm text-(--text-muted)">
            Loading coursework...
          </p>
        ) : coursework.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-(--border) bg-(--bg-card) px-6 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-(--color-primary)/10 text-(--color-primary)">
              <LuBookOpen size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-(--text-primary)">
              No coursework yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--text-muted)">
              Add your first assignment and start
              tracking deadlines, progress, and grades.
            </p>
          </div>
        ) : (
          coursework.map((assignment) => (
            <CourseworkCard
              key={assignment.id}
              assignment={assignment}
              linkedClass={
                classesById[assignment.class_id]
              }
              saving={saving}
              isDeleting={
                deletingId === assignment.id
              }
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))
        )}
      </section>

      <FormModal
        key={
          editingCoursework
            ? `edit-${editingCoursework.id}`
            : 'create-coursework'
        }
        isOpen={isModalOpen}
        title={
          editingCoursework
            ? 'Edit Assignment'
            : 'Add Assignment'
        }
        fields={courseworkFields}
        initialValues={modalInitialValues}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Coursework