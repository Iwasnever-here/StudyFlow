import { describe, expect, it, vi } from 'vitest'
import {
  formatLocalDate,
  getAuthenticatedUser,
  getErrorMessage,
} from '../hookUtils'

describe('hookUtils', () => {
  describe('getAuthenticatedUser', () => {
    it('returns the authenticated user', async () => {
      const user = { id: 'user-1' }
      const supabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user },
            error: null,
          }),
        },
      }

      await expect(
        getAuthenticatedUser(supabase, 'Sign in.'),
      ).resolves.toEqual(user)
    })

    it('throws the Supabase auth error', async () => {
      const authError = new Error('Auth failed')
      const supabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: authError,
          }),
        },
      }

      await expect(
        getAuthenticatedUser(supabase, 'Sign in.'),
      ).rejects.toBe(authError)
    })

    it('throws the supplied message when no user exists', async () => {
      const supabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      }

      await expect(
        getAuthenticatedUser(
          supabase,
          'You must be signed in.',
        ),
      ).rejects.toThrow('You must be signed in.')
    })
  })

  it('uses an error message before the fallback', () => {
    expect(
      getErrorMessage(
        new Error('Specific error'),
        'Fallback error',
      ),
    ).toBe('Specific error')

    expect(
      getErrorMessage(null, 'Fallback error'),
    ).toBe('Fallback error')
  })

  it('formats a date using local calendar values', () => {
    const date = new Date(2026, 0, 5, 12, 0, 0)

    expect(formatLocalDate(date)).toBe('2026-01-05')
  })
})
