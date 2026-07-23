import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FormModal from '../components/FormModal'
import useClassDetails from '../hooks/useClassDetails'
import { classFields } from '../config/classFields'

const EMPTY_CLASS_VALUES = {
  name: '',
  code: '',
  lecturer: '',
  color: '#26371f',
  target_grade: '',
  credits: '',
}

const ClassDetails = () => {
  const { classId } = useParams()
  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false)

  const {
    classItem,
    assignments,
    completedAssignments,
    remainingAssignments,
    currentGrade,
    loading,
    error,
    editClass,
  } = useClassDetails(classId)

  const editInitialValues = useMemo(() => {
    if (!classItem) {
      return EMPTY_CLASS_VALUES
    }

    return {
      name: classItem.name || '',
      code: classItem.code || '',
      lecturer: classItem.lecturer || '',
      color: classItem.color || '#26371f',
      target_grade: classItem.target_grade ?? '',
      credits: classItem.credits ?? '',
    }
  }, [classItem])

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleUpdateClass = async (formData) => {
    await editClass(formData)
    setIsEditModalOpen(false)
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-(--text-muted)">
          Loading class...
        </p>
      </main>
    )
  }

  if (error || !classItem) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/classes"
          className="text-sm font-medium text-(--color-secondary)"
        >
          ← Back to classes
        </Link>

        <div className="mt-6 rounded-xl border border-(--error-border) bg-(--error-bg) p-4">
          <p className="text-sm text-(--error-text)">
            {error || 'Class not found.'}
          </p>
        </div>
      </main>
    )
  }

  const classColor = classItem.color || '#26371f'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/classes"
        className="
          text-sm font-medium
          text-(--text-muted)
          hover:text-(--text-primary)
        "
      >
        ← Back to classes
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-14 w-2 rounded-full"
            style={{ backgroundColor: classColor }}
          />

          <div>
            <p
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: classColor }}
            >
              {classItem.code || 'Class'}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-(--text-primary)">
              {classItem.name}
            </h1>

            {classItem.lecturer && (
              <p className="mt-2 text-sm text-(--text-muted)">
                Lecturer: {classItem.lecturer}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenEditModal}
          className="
            rounded-xl border
            border-(--border)
            bg-(--bg-card)
            px-4 py-2
            text-sm font-semibold
            text-(--text-primary)
            transition-colors
            hover:bg-(--bg-hover)
          "
        >
          Edit class
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current grade"
          value={
            currentGrade === null
              ? 'Not available'
              : `${currentGrade.toFixed(1)}%`
          }
        />

        <StatCard
          label="Target grade"
          value={classItem.target_grade ?? 'Not set'}
        />

        <StatCard
          label="Assignments left"
          value={remainingAssignments.length}
        />

        <StatCard
          label="Completed"
          value={completedAssignments.length}
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-(--text-primary)">
                Assignments
              </h2>

              <p className="mt-1 text-sm text-(--text-muted)">
                Upcoming and completed coursework.
              </p>
            </div>

            <button
              type="button"
              className="
                rounded-lg px-3 py-2
                text-sm font-semibold
                text-white
              "
              style={{ backgroundColor: classColor }}
            >
              Add assignment
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {assignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-(--border) px-6 py-10 text-center">
                <h3 className="font-semibold text-(--text-primary)">
                  No assignments yet
                </h3>

                <p className="mt-2 text-sm text-(--text-muted)">
                  Add your first assignment to track grades
                  and deadlines.
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <AssignmentRow
                  key={assignment.id}
                  assignment={assignment}
                  color={classColor}
                />
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
            <h2 className="font-bold text-(--text-primary)">
              Class information
            </h2>

            <dl className="mt-4 space-y-4">
              <InfoRow
                label="Credits"
                value={classItem.credits ?? 'Not set'}
              />

              <InfoRow
                label="Lecturer"
                value={classItem.lecturer || 'Not set'}
              />

              <InfoRow
                label="Total assignments"
                value={assignments.length}
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
            <h2 className="font-bold text-(--text-primary)">
              Class resources
            </h2>

            <div className="mt-4 grid gap-2">
              {[
                'Flashcards',
                'Notes',
                'Attendance',
                'Study sessions',
              ].map((resource) => (
                <button
                  key={resource}
                  type="button"
                  className="
                    flex items-center
                    justify-between
                    rounded-lg border
                    border-(--border)
                    px-3 py-2
                    text-left text-sm
                    font-medium
                    text-(--text-secondary)
                    transition-colors
                    hover:bg-(--bg-hover)
                    hover:text-(--text-primary)
                  "
                >
                  <span>{resource}</span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <FormModal
        isOpen={isEditModalOpen}
        title="Edit Class"
        fields={classFields}
        initialValues={editInitialValues}
        onSubmit={handleUpdateClass}
        onClose={handleCloseEditModal}
      />
    </main>
  )
}

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
    <p className="text-sm font-medium text-(--text-muted)">
      {label}
    </p>

    <p className="mt-2 text-2xl font-bold text-(--text-primary)">
      {value}
    </p>
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-sm text-(--text-muted)">
      {label}
    </dt>

    <dd className="text-sm font-semibold text-(--text-primary)">
      {value}
    </dd>
  </div>
)

const AssignmentRow = ({ assignment, color }) => {
  const isCompleted =
    assignment.status === 'completed'

  return (
    <article className="flex items-center justify-between gap-4 rounded-xl border border-(--border) p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: isCompleted
              ? color
              : 'var(--text-muted)',
          }}
        />

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-(--text-primary)">
            {assignment.title}
          </h3>

          <p className="mt-1 text-xs text-(--text-muted)">
            {assignment.due_date
              ? `Due ${new Date(
                  assignment.due_date,
                ).toLocaleDateString()}`
              : 'No deadline'}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-(--text-primary)">
          {assignment.grade !== null &&
          assignment.grade !== ''
            ? `${assignment.grade}%`
            : isCompleted
              ? 'Completed'
              : 'Pending'}
        </p>

        {assignment.weight !== null &&
          assignment.weight !== '' && (
            <p className="mt-1 text-xs text-(--text-muted)">
              {assignment.weight}% weight
            </p>
          )}
      </div>
    </article>
  )
}

export default ClassDetails