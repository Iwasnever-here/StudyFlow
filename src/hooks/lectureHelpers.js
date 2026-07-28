import {
  getNextLecture,
  sortLectures,
} from '../utils/lectureSchedule'

export const prepareLectureValues = (
  formData,
  fallbackEstimatedMinutes = 90,
) => {
  const title = formData.title?.trim()

  if (!title) {
    throw new Error(
      'Please enter a lecture title.',
    )
  }

  const weekNumber =
    formData.week_number === '' ||
    formData.week_number === null ||
    formData.week_number === undefined
      ? null
      : Number(formData.week_number)

  if (
    weekNumber !== null &&
    (
      Number.isNaN(weekNumber) ||
      weekNumber < 1
    )
  ) {
    throw new Error(
      'Week number must be at least 1.',
    )
  }

  const estimatedMinutes =
    formData.estimated_minutes === '' ||
    formData.estimated_minutes === null ||
    formData.estimated_minutes === undefined
      ? fallbackEstimatedMinutes
      : Number(formData.estimated_minutes)

  return {
    title,
    lectureUrl:
      formData.lecture_url?.trim() || null,
    weekNumber,
    estimatedMinutes,
  }
}

export const hasCompleteTimeBlock = (
  formData,
) =>
  Boolean(
    formData.block_date &&
      formData.start_time &&
      formData.end_time,
  )

export const mergeLecturesWithBlocks = (
  lectureRows,
  blockRows,
) => {
  const blocksByLectureId = new Map(
    (blockRows || [])
      .filter((block) => block.lecture_id)
      .map((block) => [
        block.lecture_id,
        block,
      ]),
  )

  const mergedLectures = (
    lectureRows || []
  ).map((lecture) => ({
    ...lecture,
    timeBlock:
      blocksByLectureId.get(
        lecture.id,
      ) || null,
  }))

  return sortLectures(mergedLectures)
}

export const mergeLectureWithBlock = (
  lecture,
  timeBlock,
) => ({
  ...lecture,
  timeBlock,
})

export const getLectureCollections = (
  lectures,
) => {
  const now = new Date()

  return {
    nextLecture: getNextLecture(lectures),
    completedLectures: lectures.filter(
      (lecture) => lecture.completed,
    ),
    upcomingLectures: lectures.filter(
      (lecture) => {
        const blockDate =
          lecture.timeBlock?.block_date

        const startTime =
          lecture.timeBlock?.start_time

        if (!blockDate || !startTime) {
          return false
        }

        const lectureDate = new Date(
          `${blockDate}T${startTime.slice(
            0,
            5,
          )}`,
        )

        return lectureDate >= now
      },
    ),
  }
}

export { sortLectures }
