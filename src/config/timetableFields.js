export const initialTimetableValues = {
  class_id: '',
  coursework_id: '',
  title: '',
  block_date: '',
  start_time: '',
  end_time: '',
  block_type: 'study',
  is_recurring: false,
  recurrence_type: '',
  recurrence_end_date: '',
}

export const getTimetableFields = (
  classes,
  coursework
) => [
  {
    name: 'class_id',
    label: 'Class',
    type: 'select',
    options: classes.map((classItem) => ({
      label: classItem.code
        ? `${classItem.code} — ${classItem.name}`
        : classItem.name,
      value: classItem.id,
    })),
  },
  {
    name: 'coursework_id',
    label: 'Coursework',
    type: 'select',
    options: coursework.map((assignment) => ({
      label: assignment.title,
      value: assignment.id,
    })),
  },
  {
    name: 'title',
    label: 'Event Title',
    type: 'text',
    placeholder: 'Enter event title',
    required: true,
  },
  {
    name: 'block_date',
    label: 'Date',
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
  {
    name: 'block_type',
    label: 'Block Type',
    type: 'select',
    required: true,
    options: [
      {
        label: 'Study',
        value: 'study',
      },
      {
        label: 'Class',
        value: 'class',
      },
      {
        label: 'Coursework',
        value: 'coursework',
      },
      {
        label: 'Revision',
        value: 'revision',
      },
      {
        label: 'Exam',
        value: 'exam',
      },
      {
        label: 'Personal',
        value: 'personal',
      },
    ],
  },
  {
    name: 'is_recurring',
    label: 'Recurring Event',
    checkboxLabel: 'Repeat this event',
    type: 'checkbox',
  },
  {
    name: 'recurrence_type',
    label: 'Recurrence Type',
    type: 'select',
    options: [
      {
        label: 'Daily',
        value: 'daily',
      },
      {
        label: 'Weekly',
        value: 'weekly',
      },
      {
        label: 'Monthly',
        value: 'monthly',
      },
    ],
  },
  {
    name: 'recurrence_end_date',
    label: 'Recurrence End Date',
    type: 'date',
  },
]