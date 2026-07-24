const lectureFields = [
  {
    name: 'title',
    label: 'Lecture Title',
    type: 'text',
    placeholder: 'Introduction to React',
    required: true,
  },

  {
    name: 'week_number',
    label: 'Week Number',
    type: 'number',
    placeholder: '1',
    min: 1,
  },

  {
    name: 'lecture_url',
    label: 'Lecture Link',
    type: 'url',
    placeholder: 'https://...',
  },

  {
    name: 'estimated_minutes',
    label: 'Duration (minutes)',
    type: 'number',
    placeholder: '90',
    min: 1,
  },

  {
    name: 'block_date',
    label: 'Lecture Date',
    type: 'date',
    required: true,
  },

  {
    name: 'start_time',
    label: 'Start Time',
    type: 'time',
    required: true,
  },

  {
    name: 'end_time',
    label: 'End Time',
    type: 'time',
    required: true,
  },
]

export default lectureFields