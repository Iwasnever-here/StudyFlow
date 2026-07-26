import {
  useMemo,
  useState,
} from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import CalendarSidebar from '../components/timetable/CalendarSidebar'
import WeeklyCalendar from '../components/timetable/WeeklyCalendar'
import useTimetable from '../hooks/useTimetable'
import {
  initialTimetableValues,
} from '../config/timetableFields'
import {
  addDays,
  formatDate,
} from '../utils/datetime'
import {
  filterBlocks,
  getBlocksForDate,
} from '../utils/timetable'

const Timetable = () => {
  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false)

  const [
    editingBlock,
    setEditingBlock,
  ] = useState(null)

  const [
    currentDate,
    setCurrentDate,
  ] = useState(new Date())

  const [
    activeTypes,
    setActiveTypes,
  ] = useState([
    'Lecture',
    'Coursework',
    'Study',
    'Revision',
    'Personal',
  ])

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState('')

  const {
    blocks,
    classes,
    assignments,
    timetableFields,
    loadingOptions,
    pageError,
    setPageError,
    createTimetableBlock,
    updateTimetableBlock,
    deleteTimetableBlock,
  } = useTimetable()

  const classesById = useMemo(
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

  const visibleBlocks = useMemo(
    () =>
      filterBlocks(
        blocks,
        activeTypes,
        selectedClassId,
      ),
    [
      blocks,
      activeTypes,
      selectedClassId,
    ],
  )

  const todayBlocks = useMemo(
    () =>
      getBlocksForDate(
        visibleBlocks,
        formatDate(new Date()),
      ),
    [visibleBlocks],
  )

  const modalValues = useMemo(
    () => {
      if (!editingBlock) {
        return initialTimetableValues
      }

      return {
        ...initialTimetableValues,
        ...editingBlock,
        start_time:
          editingBlock.start_time?.slice(
            0,
            5,
          ) || '',
        end_time:
          editingBlock.end_time?.slice(
            0,
            5,
          ) || '',
      }
    },
    [editingBlock],
  )

  const toggleType = (type) => {
    setActiveTypes((current) =>
      current.includes(type)
        ? current.filter(
            (item) =>
              item !== type,
          )
        : [...current, type],
    )
  }

  const openCreateModal = () => {
    if (loadingOptions) {
      return
    }

    setPageError(null)
    setEditingBlock(null)
    setIsModalOpen(true)
  }

  const openEditModal = (block) => {
    setPageError(null)
    setEditingBlock(block)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBlock(null)
  }

  const handleSubmit =
    async (formData) => {
      if (editingBlock) {
        await updateTimetableBlock(
          editingBlock.id,
          formData,
        )
      } else {
        await createTimetableBlock(
          formData,
        )
      }

      closeModal()
    }

  const handleDelete =
    async (block) => {
      const confirmed =
        window.confirm(
          `Delete "${block.title}"?`,
        )

      if (!confirmed) {
        return
      }

      await deleteTimetableBlock(
        block,
      )
    }

  return (
    <div>
      <HeaderSection
        eyebrow="Timetable"
        title="Your Timetable"
        description="See lectures, coursework and personal events in one weekly calendar."
        buttonText={
          loadingOptions
            ? 'Loading...'
            : 'Add Event'
        }
        onButtonClick={
          openCreateModal
        }
      />

      <main className="mx-auto max-w-[1700px] px-4 pb-12">
        {pageError && (
          <div className="mb-5 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--error-text)]">
              {pageError}
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
          <CalendarSidebar
            classes={classes}
            assignments={
              assignments
            }
            todayBlocks={
              todayBlocks
            }
            activeTypes={
              activeTypes
            }
            selectedClassId={
              selectedClassId
            }
            onToggleType={
              toggleType
            }
            onClassChange={
              setSelectedClassId
            }
          />

          <section className="min-w-0 space-y-4">
            {loadingOptions ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-20 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  Loading timetable...
                </p>
              </div>
            ) : (
              <WeeklyCalendar
                currentDate={
                  currentDate
                }
                blocks={
                  visibleBlocks
                }
                classesById={
                  classesById
                }
                onEdit={
                  openEditModal
                }
                onDelete={
                  handleDelete
                }
                onPrevious={() =>
                  setCurrentDate(
                    (date) =>
                      addDays(
                        date,
                        -7,
                      ),
                  )
                }
                onToday={() =>
                  setCurrentDate(
                    new Date(),
                  )
                }
                onNext={() =>
                  setCurrentDate(
                    (date) =>
                      addDays(
                        date,
                        7,
                      ),
                  )
                }
              />
            )}
          </section>
        </div>
      </main>

      <FormModal
        isOpen={isModalOpen}
        title={
          editingBlock
            ? 'Edit Timetable Event'
            : 'Add Timetable Event'
        }
        fields={
          timetableFields
        }
        initialValues={
          modalValues
        }
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  )
}

export default Timetable
