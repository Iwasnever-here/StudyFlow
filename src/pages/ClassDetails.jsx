import {
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import FormModal from '../components/FormModal'
import LectureList from '../components/classes/LectureList'
import NextLectureCard from '../components/classes/NextLectureCard'

import useClassDetails from '../hooks/useClassDetails'

import { classFields } from '../config/classFields'
import lectureFields from '../config/lectureFields'

import {
  formatDateForDisplay,
} from '../utils/lectureSchedule'

const EMPTY_CLASS_VALUES = {
  name: '',
  code: '',
  lecturer: '',
  color: '#26371f',
  target_grade: '',
  credits: '',
}

const EMPTY_LECTURE_VALUES = {
  title: '',
  week_number: '',
  lecture_url: '',
  estimated_minutes: 90,
  block_date: '',
  start_time: '',
  end_time: '',
}

const ClassDetails = () => {
  const { classId } = useParams()

  const [
    isEditClassModalOpen,
    setIsEditClassModalOpen,
  ] = useState(false)

  const [
    isLectureModalOpen,
    setIsLectureModalOpen,
  ] = useState(false)

  const [
    selectedLecture,
    setSelectedLecture,
  ] = useState(null)

  const [
    updatingLectureId,
    setUpdatingLectureId,
  ] = useState(null)

  const [
    deletingLectureId,
    setDeletingLectureId,
  ] = useState(null)

  const [
    actionError,
    setActionError,
  ] = useState(null)

  const {
    classItem,

    lectures,
    nextLecture,
    lectureProgress,

    courseworkSummary,
    currentGrade,

    flashcardCount,

    loading,
    error,

    editClass,

    createLecture,
    updateLecture,
    toggleLectureComplete,
    deleteLecture,
  } = useClassDetails(classId)

  const editClassInitialValues =
    useMemo(() => {
      if (!classItem) {
        return EMPTY_CLASS_VALUES
      }

      return {
        name: classItem.name || '',
        code: classItem.code || '',
        lecturer:
          classItem.lecturer || '',
        color:
          classItem.color || '#26371f',
        target_grade:
          classItem.target_grade ?? '',
        credits:
          classItem.credits ?? '',
      }
    }, [classItem])

  const lectureInitialValues =
    useMemo(() => {
      if (!selectedLecture) {
        return EMPTY_LECTURE_VALUES
      }

      return {
        title:
          selectedLecture.title || '',

        week_number:
          selectedLecture.week_number ??
          '',

        lecture_url:
          selectedLecture.lecture_url ||
          '',

        estimated_minutes:
          selectedLecture
            .estimated_minutes ?? 90,

        block_date:
          selectedLecture.timeBlock
            ?.block_date || '',

        start_time:
          selectedLecture.timeBlock
            ?.start_time?.slice(0, 5) ||
          '',

        end_time:
          selectedLecture.timeBlock
            ?.end_time?.slice(0, 5) ||
          '',
      }
    }, [selectedLecture])

  const handleOpenEditClassModal =
    () => {
      setActionError(null)
      setIsEditClassModalOpen(true)
    }

  const handleCloseEditClassModal =
    () => {
      setIsEditClassModalOpen(false)
    }

  const handleUpdateClass = async (
    formData,
  ) => {
    await editClass(formData)
  }

  const handleOpenAddLecture = () => {
    setActionError(null)
    setSelectedLecture(null)
    setIsLectureModalOpen(true)
  }

  const handleOpenEditLecture = (
    lecture,
  ) => {
    setActionError(null)
    setSelectedLecture(lecture)
    setIsLectureModalOpen(true)
  }

  const handleCloseLectureModal =
    () => {
      setIsLectureModalOpen(false)
      setSelectedLecture(null)
    }

  const handleSaveLecture = async (
    formData,
  ) => {
    if (selectedLecture) {
      await updateLecture(
        selectedLecture.id,
        formData,
      )

      return
    }

    await createLecture(formData)
  }

  const handleToggleLecture =
    async (lectureId) => {
      setActionError(null)
      setUpdatingLectureId(lectureId)

      try {
        await toggleLectureComplete(
          lectureId,
        )
      } catch (toggleError) {
        setActionError(
          toggleError?.message ||
            'Failed to update lecture.',
        )
      } finally {
        setUpdatingLectureId(null)
      }
    }

  const handleDeleteLecture =
    async (lecture) => {
      const confirmed = window.confirm(
        `Delete "${lecture.title}"? This will also remove its timetable block.`,
      )

      if (!confirmed) {
        return
      }

      setActionError(null)
      setDeletingLectureId(lecture.id)

      try {
        await deleteLecture(lecture.id)
      } catch (deleteError) {
        setActionError(
          deleteError?.message ||
            'Failed to delete lecture.',
        )
      } finally {
        setDeletingLectureId(null)
      }
    }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-(--text-muted)">
          Loading class...
        </p>
      </main>
    )
  }

  if (error || !classItem) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
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

  const classColor =
    classItem.color || '#26371f'

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/classes"
        className="
          text-sm font-medium
          text-(--text-muted)
          transition
          hover:text-(--text-primary)
        "
      >
        ← Back to classes
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-16 w-2 rounded-full"
            style={{
              backgroundColor: classColor,
            }}
          />

          <div>
            <p
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: classColor,
              }}
            >
              {classItem.code || 'Class'}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-(--text-primary)">
              {classItem.name}
            </h1>

            {classItem.lecturer && (
              <p className="mt-2 text-sm text-(--text-muted)">
                Lecturer:{' '}
                {classItem.lecturer}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleOpenEditClassModal
          }
          className="
            rounded-xl border
            border-(--border)
            bg-(--bg-card)
            px-4 py-2.5
            text-sm font-semibold
            text-(--text-primary)
            transition
            hover:bg-(--bg-hover)
          "
        >
          Edit class
        </button>
      </header>

      {actionError && (
        <div className="mt-6 rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
          <p className="text-sm font-medium text-(--error-text)">
            {actionError}
          </p>
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current grade"
          value={
            currentGrade === null
              ? 'Not available'
              : `${currentGrade.toFixed(
                  1,
                )}%`
          }
        />

        <StatCard
          label="Target grade"
          value={
            classItem.target_grade ??
            'Not set'
          }
        />

        <StatCard
          label="Lecture progress"
          value={`${lectureProgress.completed}/${lectureProgress.total}`}
          description={`${lectureProgress.percentage}% completed`}
        />

        <StatCard
          label="Coursework left"
          value={
            courseworkSummary.active
          }
          description={`${courseworkSummary.completed} completed`}
        />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="min-w-0 space-y-6">
          <NextLectureCard
            lecture={nextLecture}
            onToggleComplete={
              handleToggleLecture
            }
            updating={
              nextLecture?.id ===
              updatingLectureId
            }
          />

          <LectureList
            lectures={lectures}
            nextLectureId={
              nextLecture?.id || null
            }
            onAdd={
              handleOpenAddLecture
            }
            onEdit={
              handleOpenEditLecture
            }
            onDelete={
              handleDeleteLecture
            }
            onToggleComplete={
              handleToggleLecture
            }
            updatingLectureId={
              updatingLectureId
            }
            deletingLectureId={
              deletingLectureId
            }
          />
        </div>

        <aside className="space-y-6">
          <CourseworkSummaryCard
            classId={classId}
            summary={
              courseworkSummary
            }
            flashcardCount={
              flashcardCount
            }
          />

          <ClassInformationCard
            classItem={classItem}
            lectureProgress={
              lectureProgress
            }
          />
        </aside>
      </div>

      <FormModal
        isOpen={
          isEditClassModalOpen
        }
        title="Edit Class"
        fields={classFields}
        initialValues={
          editClassInitialValues
        }
        onSubmit={handleUpdateClass}
        onClose={
          handleCloseEditClassModal
        }
      />

      <FormModal
        isOpen={isLectureModalOpen}
        title={
          selectedLecture
            ? 'Edit Lecture'
            : 'Add Lecture'
        }
        fields={lectureFields}
        initialValues={
          lectureInitialValues
        }
        onSubmit={handleSaveLecture}
        onClose={
          handleCloseLectureModal
        }
      />
    </main>
  )
}

const StatCard = ({
  label,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
    <p className="text-sm font-medium text-(--text-muted)">
      {label}
    </p>

    <p className="mt-2 text-2xl font-bold text-(--text-primary)">
      {value}
    </p>

    {description && (
      <p className="mt-1 text-xs text-(--text-muted)">
        {description}
      </p>
    )}
  </div>
)

const CourseworkSummaryCard = ({
  classId,
  summary,
  flashcardCount,
}) => {
  const nextAssignment =
    summary.nextAssignment

  const remainingPercentage =
    summary.total === 0
      ? 0
      : Math.round(
          (summary.active /
            summary.total) *
            100,
        )

  const completedPercentage =
    summary.total === 0
      ? 0
      : 100 - remainingPercentage

  return (
    <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-(--text-primary)">
          Coursework
        </h2>

        <span className="text-sm font-semibold text-(--text-muted)">
          {summary.total}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-(--text-muted)">
            Progress
          </p>

          <p className="text-sm font-semibold text-(--text-primary)">
            {remainingPercentage}% left
          </p>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-(--bg-input)">
          <div
            className="h-full rounded-full bg-(--color-primary) transition-[width] duration-300"
            style={{
              width: `${completedPercentage}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-(--text-muted)]">
          {summary.completed} of{' '}
          {summary.total} completed
        </p>
      </div>

      <dl className="mt-5">
        <InfoRow
          label="Next deadline"
          value={
            nextAssignment?.due_date
              ? formatDateForDisplay(
                  nextAssignment.due_date,
                  {
                    day: 'numeric',
                    month: 'short',
                  },
                )
              : 'None'
          }
        />
      </dl>

      {nextAssignment && (
        <div className="mt-5 rounded-xl border border-(--border)] bg-(--bg-input)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-(--text-muted)]">
            Up next
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-(--text-primary)]">
            {nextAssignment.title}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <Link
          to={`/coursework?classId=${classId}`}
          className="
            flex items-center
            justify-between
            rounded-xl border
            border-(--border)]
            px-4 py-3
            text-sm font-semibold
            text-(--text-secondary)]
            transition
            hover:bg-(--bg-hover)]
            hover:text-(--text-primary)]
          "
        >
          <span>View coursework</span>
          <span aria-hidden="true">
            →
          </span>
        </Link>

        <Link
          to={`/flashcards?classId=${classId}`}
          className="
            flex items-center
            justify-between
            rounded-xl border
            border-(--border)]
            px-4 py-3
            text-sm font-semibold
            text-(--text-secondary)]
            transition
            hover:bg-(--bg-hover)]
            hover:text-(--text-primary)]
          "
        >
          <span>
            View flashcards
            {flashcardCount > 0
              ? ` (${flashcardCount})`
              : ''}
          </span>

          <span aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </section>
  )
}

const ClassInformationCard = ({
  classItem,
  lectureProgress,
}) => (
  <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
    <h2 className="font-bold text-(--text-primary)">
      Class information
    </h2>

    <dl className="mt-5 space-y-4">
      <InfoRow
        label="Credits"
        value={
          classItem.credits ?? 'Not set'
        }
      />

      <InfoRow
        label="Lecturer"
        value={
          classItem.lecturer ||
          'Not set'
        }
      />

      <InfoRow
        label="Target grade"
        value={
          classItem.target_grade ??
          'Not set'
        }
      />

      <InfoRow
        label="Lectures"
        value={lectureProgress.total}
      />
    </dl>
  </section>
)

const InfoRow = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-sm text-(--text-muted)">
      {label}
    </dt>

    <dd className="max-w-[60%] truncate text-right text-sm font-semibold text-(--text-primary)">
      {value}
    </dd>
  </div>
)

export default ClassDetails