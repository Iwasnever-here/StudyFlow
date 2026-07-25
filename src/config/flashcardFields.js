export const flashcardFields = [
  {
    name: 'front',
    label: 'Question',
    type: 'textarea',
    placeholder:
      'Enter the question or prompt',
    required: true,
  },
  {
    name: 'back',
    label: 'Answer',
    type: 'textarea',
    placeholder:
      'Enter the answer',
    required: true,
  },
]

export const initialFlashcardValues = {
  front: '',
  back: '',
}