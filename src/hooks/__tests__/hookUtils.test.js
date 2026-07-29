import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  formatLocalDate,
  getAuthenticatedUser,
  getErrorMessage,
} from '../hookUtils'

const createSupabase = ({
  user = null,
  error = null,
} = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user,
      },
      error,
    }),
  },
})

describe('hookUtils', () => {
  it('returns the authenticated user', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
    }

    const supabase =
      createSupabase({ user })

    const result =
      await getAuthenticatedUser(
        supabase,
        'You must be signed in.',
      )

    expect(
      supabase.auth.getUser,
    ).toHaveBeenCalledOnce()

    expect(result).toEqual(user)
  })

  it('throws the Supabase authentication error', async () => {
    const authError =
      new Error(
        'Authentication failed.',
      )

    const supabase =
      createSupabase({
        error: authError,
      })

    await expect(
      getAuthenticatedUser(
        supabase,
        'You must be signed in.',
      ),
    ).rejects.toBe(authError)
  })

  it('throws the provided message when no user exists', async () => {
    const supabase =
      createSupabase()

    await expect(
      getAuthenticatedUser(
        supabase,
        'You must be signed in.',
      ),
    ).rejects.toThrow(
      'You must be signed in.',
    )
  })

  it('returns the error message when one exists', () => {
    expect(
      getErrorMessage(
        {
          message:
            'Unable to load data.',
        },
        'Fallback message.',
      ),
    ).toBe(
      'Unable to load data.',
    )
  })

  it('returns the fallback error message', () => {
    expect(
      getErrorMessage(
        null,
        'Fallback message.',
      ),
    ).toBe(
      'Fallback message.',
    )

    expect(
      getErrorMessage(
        {},
        'Fallback message.',
      ),
    ).toBe(
      'Fallback message.',
    )
  })

  it('formats a date using the local calendar date', () => {
    const date =
      new Date(2026, 6, 5)

    expect(
      formatLocalDate(date),
    ).toBe('2026-07-05')
  })
})