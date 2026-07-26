export const normaliseTime = (time = '') => {
  if (!time) return ''
  return time.length === 5 ? `${time}:00` : time
}

export const timeToMinutes = (time) => {
  const [hours = 0, minutes = 0] =
    normaliseTime(time)
      .split(':')
      .map(Number)

  return hours * 60 + minutes
}

export const minutesToTime = (minutes) => {
  const safeMinutes = Math.max(
    0,
    Math.round(minutes),
  )

  const hours = Math.floor(
    safeMinutes / 60,
  )

  const mins = safeMinutes % 60

  return `${String(hours).padStart(
    2,
    '0',
  )}:${String(mins).padStart(2, '0')}:00`
}

export const formatTime = (time) => {
  if (!time) return ''
  return normaliseTime(time).slice(0, 5)
}

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseDate = (dateString) => {
  return new Date(
    `${dateString}T00:00:00`,
  )
}

export const addDays = (
  date,
  amount,
) => {
  const nextDate = new Date(date)
  nextDate.setDate(
    nextDate.getDate() + amount,
  )
  return nextDate
}

export const startOfWeek = (
  date,
  weekStartsOn = 1,
) => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  const day = result.getDay()
  const difference =
    (day - weekStartsOn + 7) % 7

  result.setDate(
    result.getDate() - difference,
  )

  return result
}

export const getWeekDays = (
  anchorDate,
) => {
  const firstDay =
    startOfWeek(anchorDate)

  return Array.from(
    { length: 7 },
    (_, index) =>
      addDays(firstDay, index),
  )
}

export const daysBetween = (
  startDate,
  endDate,
) => {
  const milliseconds =
    parseDate(endDate) -
    parseDate(startDate)

  return Math.ceil(
    milliseconds / 86400000,
  )
}

export const isSameDate = (
  firstDate,
  secondDate,
) => {
  return (
    formatDate(firstDate) ===
    formatDate(secondDate)
  )
}

export const formatDayHeading = (
  date,
) => {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      weekday: 'short',
      day: 'numeric',
    },
  ).format(date)
}

export const formatMonthHeading = (
  date,
) => {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
}

export const getNowMinutes = () => {
  const now = new Date()

  return (
    now.getHours() * 60 +
    now.getMinutes()
  )
}

export const rangesOverlap = (
  firstStart,
  firstEnd,
  secondStart,
  secondEnd,
) => {
  return (
    firstStart < secondEnd &&
    firstEnd > secondStart
  )
}
