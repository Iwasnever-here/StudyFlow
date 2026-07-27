export const getLocalDateString = (
  date = new Date(),
) => {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const timeToMinutes = (
  time,
) => {
  if (!time) {
    return 0
  }

  const [
    hours,
    minutes,
  ] = time
    .slice(0, 5)
    .split(':')
    .map(Number)

  return (
    hours * 60 +
    minutes
  )
}

export const formatTime = (
  time,
) => {
  if (!time) {
    return ''
  }

  const [
    hours,
    minutes,
  ] = time
    .slice(0, 5)
    .split(':')
    .map(Number)

  const date = new Date()

  date.setHours(
    hours,
    minutes,
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)
}

export const formatDashboardDate = (
  date,
) =>
  new Intl.DateTimeFormat(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    },
  ).format(date)

export const formatDeadline = (
  dateString,
) => {
  if (!dateString) {
    return 'No deadline'
  }

  const todayString =
    getLocalDateString()

  const tomorrow =
    new Date()

  tomorrow.setDate(
    tomorrow.getDate() + 1,
  )

  const tomorrowString =
    getLocalDateString(
      tomorrow,
    )

  if (
    dateString === todayString
  ) {
    return 'Due today'
  }

  if (
    dateString === tomorrowString
  ) {
    return 'Due tomorrow'
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
    },
  ).format(
    new Date(
      `${dateString}T00:00:00`,
    ),
  )
}

export const getGreeting = (
  hour,
) => {
  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

export const getClassMap = (
  classLists,
) => {
  const classMap = {}

  classLists
    .flat()
    .forEach((classItem) => {
      if (!classItem?.id) {
        return
      }

      classMap[
        String(classItem.id)
      ] = classItem
    })

  return classMap
}

export const getClassForItem = (
  item,
  classMap,
) => {
  if (!item?.class_id) {
    return null
  }

  return (
    classMap[
      String(item.class_id)
    ] || null
  )
}