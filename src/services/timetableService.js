import { supabase } from '../lib/supabaseClient'

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

export const fetchTimetableData =
  async (userId) => {
    const [
      blocksResult,
      classesResult,
      assignmentsResult,
    ] = await Promise.all([
      supabase
        .from('time_blocks')
        .select(TIME_BLOCK_FIELDS)
        .eq('user_id', userId)
        .order('block_date', {
          ascending: true,
        })
        .order('start_time', {
          ascending: true,
        }),

      supabase
        .from('classes')
        .select(
          'id, name, code, color',
        )
        .eq('user_id', userId)
        .order('name'),

      supabase
        .from('assignments')
        .select(`
          id,
          class_id,
          title,
          due_date,
          status,
          hours,
          weight
        `)
        .eq('user_id', userId)
        .neq('status', 'Completed')
        .order('due_date'),
    ])

    if (blocksResult.error) {
      throw blocksResult.error
    }

    if (classesResult.error) {
      throw classesResult.error
    }

    if (assignmentsResult.error) {
      throw assignmentsResult.error
    }

    return {
      blocks:
        blocksResult.data || [],
      classes:
        classesResult.data || [],
      assignments:
        assignmentsResult.data || [],
    }
  }

export const insertTimeBlock =
  async (block) => {
    const { data, error } =
      await supabase
        .from('time_blocks')
        .insert(block)
        .select(TIME_BLOCK_FIELDS)
        .single()

    if (error) {
      throw error
    }

    return data
  }

export const updateTimeBlockRow =
  async (
    blockId,
    userId,
    updates,
  ) => {
    const { data, error } =
      await supabase
        .from('time_blocks')
        .update(updates)
        .eq('id', blockId)
        .eq('user_id', userId)
        .select(TIME_BLOCK_FIELDS)
        .single()

    if (error) {
      throw error
    }

    return data
  }

export const deleteTimeBlockRow =
  async (
    blockId,
    userId,
  ) => {
    const { error } =
      await supabase
        .from('time_blocks')
        .delete()
        .eq('id', blockId)
        .eq('user_id', userId)

    if (error) {
      throw error
    }
  }

export const replaceFutureAutoBlocks =
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
