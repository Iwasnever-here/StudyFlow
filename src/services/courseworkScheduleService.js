import { supabase } from '../lib/supabaseClient'

const TIME_BLOCK_FIELDS = `
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

export const fetchCourseworkBlocks =
  async (userId) => {
    const { data, error } =
      await supabase
        .from('time_blocks')
        .select(TIME_BLOCK_FIELDS)
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
    blocks,
  }) => {
    const { error: deleteError } =
      await supabase
        .from('time_blocks')
        .delete()
        .eq('user_id', userId)
        .eq('auto_generated', true)
        .eq(
          'block_type',
          'Coursework',
        )
        .gte('block_date', fromDate)

    if (deleteError) {
      throw deleteError
    }

    if (blocks.length === 0) {
      return []
    }

    const { data, error } =
      await supabase
        .from('time_blocks')
        .insert(blocks)
        .select(TIME_BLOCK_FIELDS)

    if (error) {
      throw error
    }

    return data || []
  }
