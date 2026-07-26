export const shuffleArray = (items = []) => {
  const shuffledItems = [...items]

  for (
    let index = shuffledItems.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    )

    const currentItem =
      shuffledItems[index]

    shuffledItems[index] =
      shuffledItems[randomIndex]

    shuffledItems[randomIndex] =
      currentItem
  }

  return shuffledItems
}

export const buildQuizQuestions = (
  cards = [],
) => {
  if (!Array.isArray(cards)) {
    return []
  }

  const validCards = cards.filter(
    (card) =>
      card?.front?.trim() &&
      card?.back?.trim(),
  )

  return shuffleArray(validCards).map(
    (card) => {
      const correctAnswer =
        card.back.trim()

      const incorrectAnswers =
        shuffleArray(
          validCards
            .filter(
              (otherCard) =>
                String(otherCard.id) !==
                String(card.id),
            )
            .map((otherCard) =>
              otherCard.back.trim(),
            )
            .filter(
              (answer) =>
                answer !== correctAnswer,
            )
            .filter(
              (
                answer,
                index,
                answers,
              ) =>
                answers.indexOf(answer) ===
                index,
            ),
        ).slice(0, 3)

      return {
        id: card.id,
        question: card.front.trim(),
        correctAnswer,
        options: shuffleArray([
          correctAnswer,
          ...incorrectAnswers,
        ]),
      }
    },
  )
}

export const calculatePercentage = (
  value,
  total,
) => {
  if (!total) {
    return 0
  }

  return Math.round(
    (value / total) * 100,
  )
}