import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import { getAuthenticatedUser } from './hookUtils'

const useFlashcards = (setId) => {
  const [cards, setCards] = useState([])
  const [loadingCards, setLoadingCards] =
    useState(true)
  const [cardError, setCardError] =
    useState(null)

  const fetchCards = useCallback(async () => {
    if (!setId) {
      setCards([])
      setLoadingCards(false)
      return
    }

    setLoadingCards(true)
    setCardError(null)

    const { data, error } = await supabase
      .from('flashcards')
      .select(`
        id,
        set_id,
        class_id,
        front,
        back,
        created_at
      `)
      .eq('set_id', setId)
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      setCards([])
      setCardError(error.message)
    } else {
      setCards(data || [])
    }

    setLoadingCards(false)
  }, [setId])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const createFlashcard = async ({
    front,
    back,
    classId,
  }) => {
    const trimmedFront = front?.trim()
    const trimmedBack = back?.trim()

    if (!trimmedFront) {
      throw new Error(
        'Please enter a question.'
      )
    }

    if (!trimmedBack) {
      throw new Error(
        'Please enter an answer.'
      )
    }

    if (!setId) {
      throw new Error(
        'Flashcard set could not be found.'
      )
    }

    const user = await getAuthenticatedUser(
      supabase,
      'You must be signed in.',
    )

    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: user.id,
        set_id: setId,
        class_id: classId,
        front: trimmedFront,
        back: trimmedBack,
      })
      .select(`
        id,
        set_id,
        class_id,
        front,
        back,
        created_at
      `)
      .single()

    if (error) {
      throw error
    }

    setCards((currentCards) => [
      ...currentCards,
      data,
    ])

    return data
  }

  const updateFlashcard = async (
    cardId,
    values
  ) => {
    const front = values.front?.trim()
    const back = values.back?.trim()

    if (!front) {
      throw new Error(
        'Please enter a question.'
      )
    }

    if (!back) {
      throw new Error(
        'Please enter an answer.'
      )
    }

    const { data, error } = await supabase
      .from('flashcards')
      .update({
        front,
        back,
      })
      .eq('id', cardId)
      .select(`
        id,
        set_id,
        class_id,
        front,
        back,
        created_at
      `)
      .single()

    if (error) {
      throw error
    }

    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? data : card
      )
    )

    return data
  }

  const deleteFlashcard = async (
    cardId
  ) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId)

    if (error) {
      throw error
    }

    setCards((currentCards) =>
      currentCards.filter(
        (card) => card.id !== cardId
      )
    )
  }

  return {
    cards,
    loadingCards,
    cardError,
    setCardError,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    refetchCards: fetchCards,
  }
}

export default useFlashcards