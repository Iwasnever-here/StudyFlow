import {
  useMemo,
  useState,
} from 'react'
import {
  LuBookOpen,
  LuCalendarClock,
} from 'react-icons/lu'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import CourseworkCard from '../components/coursework/CourseworkCard'
import useCoursework from '../hooks/useCoursework'
import useCourseworkSchedule from '../hooks/useCourseworkSchedule'
import {
  getCourseworkFields,
  initialCourseworkValues,
} from '../config/courseworkFields'

const getEditValues = (
  assignment,
) => ({
  class_id:
    assignment.class_id || '',
  title: assignment.title || '',
  description:
    assignment.description || '',
  due_date:
    assignment.due_date || '',
  status:
    assignment.status ||
    'not_started',
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
  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false)

  const [
    editingCoursework,
    setEditingCoursework,
  ] = useState(null)

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

  const {
    scheduling,
    scheduleError,
    unscheduledAssignments,
    scheduleSummaryByCoursework,
    rebuildCourseworkSchedule,
  } =
    useCourseworkSchedule(
      coursework,
    )

  const courseworkFields =
    useMemo(
      () =>
        getCourseworkFields(
          classes,
        ),
      [classes],
    )

  const classesById =
    useMemo(
      () =>
        Object.fromEntries(
          classes.map(
            (classItem) => [
              classItem.id,
              classItem,
            ],
          ),
        ),
      [classes],
    )

  const modalInitialValues =
    useMemo(() => {
      if (!editingCoursework) {
        return initialCourseworkValues
      }

      return getEditValues(
        editingCoursework,
      )
    }, [editingCoursework])

  const handleOpenCreateModal =
    () => {
      if (loading || saving) {
        return
      }

      if (classes.length === 0) {
        setError(
          'Create a class before adding coursework.',
        )
        return
      }

      setError(null)
      setEditingCoursework(null)
      setIsModalOpen(true)
    }

  const handleOpenEditModal = (
    assignment,
  ) => {
    setError(null)
    setEditingCoursework(
      assignment,
    )
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (saving) return

    setIsModalOpen(false)
    setEditingCoursework(null)
  }

  const handleSubmit =
    async (formData) => {
      if (editingCoursework) {
        await updateCoursework(
          editingCoursework.id,
          formData,
        )
      } else {
        await createCoursework(
          formData,
        )
      }

      setIsModalOpen(false)
      setEditingCoursework(null)
    }

  const handleDelete =
    async (assignment) => {
      const confirmed =
        window.confirm(
          `Delete "${assignment.title}"? This cannot be undone.`,
        )

      if (!confirmed) return

      try {
        await deleteCoursework(
          assignment.id,
        )
      } catch {
        // Hook handles the error.
      }
    }

  const handleRebuildSchedule =
    async () => {
      try {
        await rebuildCourseworkSchedule()
      } catch {
        // Hook handles the error.
      }
    }

  const displayedError =
    error || scheduleError

  return (
    <div>
      <HeaderSection
        eyebrow="Coursework"
        title="Your Coursework"
        description="Track assignments and automatically plan study sessions around your timetable."
        buttonText={
          loading
            ? 'Loading Coursework...'
            : 'Add Coursework'
        }
        onButtonClick={
          handleOpenCreateModal
        }
      />

      <main className="mx-auto max-w-8xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-(--border) bg-(--bg-card) p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
              Smart planning
            </p>

            <h2 className="mt-1 text-lg font-bold text-(--text-primary)">
              Build your coursework schedule
            </h2>

            <p className="mt-1 text-sm text-(--text-muted)">
              Sessions are placed around lectures and existing timetable events.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRebuildSchedule
            }
            disabled={
              scheduling ||
              loading ||
              coursework.length === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 text-sm font-bold text-(--text-light) disabled:bg-(--disabled)"
          >
            <LuCalendarClock
              size={18}
            />

            {scheduling
              ? 'Scheduling...'
              : 'Rebuild Schedule'}
          </button>
        </div>

        {displayedError && (
          <div className="mb-6 rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
            <p className="text-sm font-medium text-(--error-text)">
              {displayedError}
            </p>
          </div>
        )}

        {unscheduledAssignments.length >
          0 && (
          <div className="mb-6 rounded-xl border border-(--border-accent) bg-(--bg-card) px-4 py-3">
            <p className="text-sm font-bold text-(--text-primary)">
              Some work could not fit before its deadline.
            </p>

            <p className="mt-1 text-sm text-(--text-muted)">
              {unscheduledAssignments
                .map(
                  (item) =>
                    `${item.title} (${Math.ceil(
                      item.remainingMinutes /
                        60,
                    )}h left)`,
                )
                .join(', ')}
            </p>
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-sm text-(--text-muted)">
              Loading coursework...
            </p>
          ) : coursework.length ===
            0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-(--border) bg-(--bg-card) px-6 py-14 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-(--bg-input) text-(--color-primary)">
                <LuBookOpen
                  size={22}
                />
              </div>

              <h2 className="mt-4 text-lg font-bold text-(--text-primary)">
                No coursework yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--text-muted)">
                Add an assignment with a due date and estimated hours to generate a study plan.
              </p>
            </div>
          ) : (
            coursework.map(
              (assignment) => (
                <CourseworkCard
                  key={
                    assignment.id
                  }
                  assignment={
                    assignment
                  }
                  linkedClass={
                    classesById[
                      assignment
                        .class_id
                    ]
                  }
                  scheduleSummary={
                    scheduleSummaryByCoursework[
                      assignment.id
                    ]
                  }
                  saving={saving}
                  isDeleting={
                    deletingId ===
                    assignment.id
                  }
                  onEdit={
                    handleOpenEditModal
                  }
                  onDelete={
                    handleDelete
                  }
                />
              ),
            )
          )}
        </section>
      </main>

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
        fields={
          courseworkFields
        }
        initialValues={
          modalInitialValues
        }
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Coursework
