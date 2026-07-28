export const getAuthenticatedUser = async (
  supabase,
  message,
) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error(message)
  }

  return user
}

export const getErrorMessage = (
  error,
  fallback,
) => error?.message || fallback

const padNumber = (value) => {
  return String(value).padStart(2, '0')
}

export const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = padNumber(
    date.getMonth() + 1,
  )
  const day = padNumber(date.getDate())

  return `${year}-${month}-${day}`
}
