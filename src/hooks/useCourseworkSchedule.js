import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  buildCourseworkSchedule,
  getCourseworkScheduleSummary,
} from '../utils/courseworkScheduler'
import {
  fetchCourseworkBlocks,
  replaceGeneratedCourseworkBlocks,
} from '../services/courseworkScheduleService'
import {
  formatDate,
} from '../utils/datetime'

const useCourseworkSchedule = (
  assignments = [],
) => {
  const [blocks, setBlocks] =
    useState([])

  const [
    loadingSchedule,
    setLoadingSchedule,
  ] = useState(true)

  const [
    scheduling,
    setScheduling,
  ] = useState(false)

  const [
    scheduleError,
    setScheduleError,
  ] = useState(null)

  const [
    unscheduledAssignments,
    setUnscheduledAssignments,
  ] = useState([])

  const getUser = useCallback(
    async () => {
      const {
        data: { user },
        error,
      } =
        await supabase.auth.getUser()

      if (error) {
        throw error
      }

      if (!user) {
        throw new Error(
          'You must be signed in to schedule coursework.',
        )
      }

      return user
    },
    [],
  )

  const fetchSchedule =
    useCallback(async () => {
      setLoadingSchedule(true)
      setScheduleError(null)

      try {
        const user =
          await getUser()

        const timetableBlocks =
          await fetchCourseworkBlocks(
            user.id,
          )

        setBlocks(
          Array.isArray(
            timetableBlocks,
          )
            ? timetableBlocks
            : [],
        )

        return timetableBlocks
      } catch (error) {
        setScheduleError(
          error.message,
        )

        setBlocks([])

        throw error
      } finally {
        setLoadingSchedule(false)
      }
    }, [getUser])

  useEffect(() => {
    fetchSchedule().catch(
      () => {},
    )
  }, [fetchSchedule])

  const scheduleSummaryByCoursework =
    useMemo(() => {
      return getCourseworkScheduleSummary({
        assignments:
          assignments || [],
        blocks: blocks || [],
      })
    }, [assignments, blocks])

  const rebuildCourseworkSchedule =
    useCallback(async () => {
      setScheduling(true)
      setScheduleError(null)
      setUnscheduledAssignments([])

      try {
        const user =
          await getUser()

        /*
         * Always fetch fresh blocks first.
         * This prevents scheduling against
         * stale page state.
         */
        const currentBlocks =
          await fetchCourseworkBlocks(
            user.id,
          )

        const result =
          buildCourseworkSchedule({
            assignments,
            existingBlocks:
              currentBlocks,
            userId: user.id,
          })

        await replaceGeneratedCourseworkBlocks({
          userId: user.id,
          fromDate:
            formatDate(new Date()),
          blocks:
            result.generatedBlocks,
        })

        /*
         * Re-fetch from Supabase rather
         * than guessing what was saved.
         */
        const refreshedBlocks =
          await fetchCourseworkBlocks(
            user.id,
          )

        setBlocks(
          refreshedBlocks || [],
        )

        setUnscheduledAssignments(
          result.unscheduledAssignments ||
            [],
        )

        return {
          ...result,
          savedBlocks:
            refreshedBlocks,
        }
      } catch (error) {
        setScheduleError(
          error.message,
        )

        throw error
      } finally {
        setScheduling(false)
      }
    }, [
      assignments,
      getUser,
    ])

  return {
    blocks,
    loadingSchedule,
    scheduling,
    scheduleError,
    setScheduleError,
    unscheduledAssignments,
    scheduleSummaryByCoursework,
    fetchSchedule,
    rebuildCourseworkSchedule,
  }
}

export default useCourseworkSchedule