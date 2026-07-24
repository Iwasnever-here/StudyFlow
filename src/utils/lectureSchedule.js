const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export const parseLocalDate = (dateString) => {
  if (!dateString) {
    return null
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number)

  if (!year || !month || !day) {
    return null
  }

  const date = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  )

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

export const formatDateLocal = (date) => {
  if (!(date instanceof Date)) {
    return ''
  }

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const formatDateForDisplay = (
  dateString,
  options = {},
) => {
  const date = parseLocalDate(dateString)

  if (!date) {
    return 'Date not set'
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export const formatTime = (timeString) => {
  if (!timeString) {
    return ''
  }

  return timeString.slice(0, 5)
}

export const getDaysBetween = (
  startDate,
  currentDate,
) => {
  if (
    !(startDate instanceof Date) ||
    !(currentDate instanceof Date)
  ) {
    return 0
  }

  const startUtc = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  )

  const currentUtc = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  )

  return Math.round(
    (currentUtc - startUtc) /
      (1000 * 60 * 60 * 24),
  )
}

export const generateWeeklyLectures = ({
  semesterStart,
  semesterEnd,
  weeklySchedules,
}) => {
  if (
    !semesterStart ||
    !semesterEnd ||
    !Array.isArray(weeklySchedules)
  ) {
    return []
  }

  const startDate =
    parseLocalDate(semesterStart)
  const endDate =
    parseLocalDate(semesterEnd)

  if (!startDate || !endDate) {
    return []
  }

  if (endDate < startDate) {
    return []
  }

  const generatedLectures = []

  weeklySchedules.forEach((schedule) => {
    const targetDay =
      DAY_INDEX[schedule.day_of_week]

    if (targetDay === undefined) {
      return
    }

    if (
      !schedule.start_time ||
      !schedule.end_time
    ) {
      return
    }

    const currentDate = new Date(startDate)

    while (
      currentDate.getDay() !== targetDay
    ) {
      currentDate.setDate(
        currentDate.getDate() + 1,
      )
    }

    while (currentDate <= endDate) {
      const daysFromStart = getDaysBetween(
        startDate,
        currentDate,
      )

      const weekNumber =
        Math.floor(daysFromStart / 7) + 1

      generatedLectures.push({
        block_date:
          formatDateLocal(currentDate),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        week_number: weekNumber,
        day_of_week: schedule.day_of_week,
        session_type:
          schedule.session_type ||
          'Lecture',
        location:
          schedule.location?.trim() ||
          null,
        lecture_url:
          schedule.lecture_url?.trim() ||
          null,
      })

      currentDate.setDate(
        currentDate.getDate() + 7,
      )
    }
  })

  return generatedLectures.sort(
    (firstLecture, secondLecture) => {
      const dateComparison =
        firstLecture.block_date.localeCompare(
          secondLecture.block_date,
        )

      if (dateComparison !== 0) {
        return dateComparison
      }

      return firstLecture.start_time.localeCompare(
        secondLecture.start_time,
      )
    },
  )
}

export const sortLectures = (lectures) => {
  return [...lectures].sort(
    (firstLecture, secondLecture) => {
      const firstDate =
        firstLecture.timeBlock?.block_date ||
        '9999-12-31'

      const secondDate =
        secondLecture.timeBlock?.block_date ||
        '9999-12-31'

      const dateComparison =
        firstDate.localeCompare(secondDate)

      if (dateComparison !== 0) {
        return dateComparison
      }

      const firstStartTime =
        firstLecture.timeBlock?.start_time ||
        '23:59'

      const secondStartTime =
        secondLecture.timeBlock?.start_time ||
        '23:59'

      return firstStartTime.localeCompare(
        secondStartTime,
      )
    },
  )
}

export const getLectureStartDate = (
  lecture,
) => {
  const blockDate =
    lecture?.timeBlock?.block_date
  const startTime =
    lecture?.timeBlock?.start_time

  if (!blockDate || !startTime) {
    return null
  }

  const date = new Date(
    `${blockDate}T${formatTime(startTime)}`,
  )

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

export const getNextLecture = (
  lectures,
  currentDate = new Date(),
) => {
  const sortedLectures =
    sortLectures(lectures)

  return (
    sortedLectures.find((lecture) => {
      const lectureStart =
        getLectureStartDate(lecture)

      if (!lectureStart) {
        return false
      }

      return lectureStart >= currentDate
    }) || null
  )
}

export const isPastLecture = (
  lecture,
  currentDate = new Date(),
) => {
  const lectureStart =
    getLectureStartDate(lecture)

  if (!lectureStart) {
    return false
  }

  return lectureStart < currentDate
}