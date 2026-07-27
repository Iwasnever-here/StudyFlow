import {
  supabase,
} from '../lib/supabaseClient'

export const TIME_BLOCK_FIELDS = `
  id,
  user_id,
  class_id,
  coursework_id,
  lecture_id,
  title,
  block_date,
  start_time,
  end_time,
  block_type,
  is_recurring,
  recurrence_type,
  recurrence_end_date,
  auto_generated,
  completed,
  created_at
`

export const fetchAllTimeBlocks =
  async (userId) => {
    if (!userId) {
      throw new Error(
        'A user ID is required to fetch timetable blocks.',
      )
    }

    const { data, error } =
      await supabase
        .from('time_blocks')
        .select(
          TIME_BLOCK_FIELDS,
        )
        .eq('user_id', userId)
        .order('block_date', {
          ascending: true,
        })
        .order('start_time', {
          ascending: true,
        })

    if (error) {
      throw error
    }

    return data || []
  }

export const replaceGeneratedCourseworkBlocks =
  async ({
    userId,
    fromDate,
    blocks = [],
  }) => {
    if (!userId) {
      throw new Error(
        'A user ID is required to rebuild the schedule.',
      )
    }

    if (!fromDate) {
      throw new Error(
        'A start date is required to rebuild the schedule.',
      )
    }

    const { error: deleteError } =
      await supabase
        .from('time_blocks')
        .delete()
        .eq('user_id', userId)
        .eq(
          'auto_generated',
          true,
        )
        .eq(
          'block_type',
          'Coursework',
        )
        .gte(
          'block_date',
          fromDate,
        )

    if (deleteError) {
      throw deleteError
    }

    if (
      !Array.isArray(blocks) ||
      blocks.length === 0
    ) {
      return []
    }

    const validBlocks =
      blocks.filter(
        (block) =>
          block &&
          block.block_date &&
          block.start_time &&
          block.end_time,
      )

    if (
      validBlocks.length === 0
    ) {
      return []
    }

    const { data, error } =
      await supabase
        .from('time_blocks')
        .insert(validBlocks)
        .select(
          TIME_BLOCK_FIELDS,
        )

    if (error) {
      throw error
    }

    return data || []
  }