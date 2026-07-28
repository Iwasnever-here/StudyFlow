import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  supabase,
} from '../lib/supabaseClient'
import { getAuthenticatedUser } from './hookUtils'

import {
  buildCourseworkSchedule,
  getCourseworkScheduleSummary,
} from '../utils/courseworkScheduler'

import {
  fetchAllTimeBlocks,
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
    () =>
      getAuthenticatedUser(
        supabase,
        'You must be signed in to schedule coursework.',
      ),
    [],
  )

  const fetchSchedule =
    useCallback(async () => {
      setLoadingSchedule(true)
      setScheduleError(null)

      try {
        const user =
          await getUser()

        const currentBlocks =
          await fetchAllTimeBlocks(
            user.id,
          )

        setBlocks(
          currentBlocks,
        )

        return currentBlocks
      } catch (error) {
        setBlocks([])

        setScheduleError(
          error.message ||
            'Unable to load the coursework schedule.',
        )

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

        blocks:
          blocks || [],
      })
    }, [
      assignments,
      blocks,
    ])

  const rebuildCourseworkSchedule =
    useCallback(async () => {
      setScheduling(true)
      setScheduleError(null)
      setUnscheduledAssignments([])

      try {
        const user =
          await getUser()

        const currentBlocks =
          await fetchAllTimeBlocks(
            user.id,
          )

      
        const result =
          buildCourseworkSchedule({
            assignments:
              assignments || [],

            existingBlocks:
              currentBlocks,

            userId:
              user.id,
          })

        await replaceGeneratedCourseworkBlocks({
          userId:
            user.id,

          fromDate:
            formatDate(
              new Date(),
            ),

          blocks:
            result.generatedBlocks ||
            [],
        })

        const refreshedBlocks =
          await fetchAllTimeBlocks(
            user.id,
          )

        setBlocks(
          refreshedBlocks,
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
          error.message ||
            'Unable to rebuild the coursework schedule.',
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