export const initialTimetableValues = {
  title: '',
  class_id: '',
  coursework_id: '',
  block_date: '',
  start_time: '',
  end_time: '',
  block_type: 'Personal',
  is_recurring: false,
  recurrence_type: 'none',
  recurrence_end_date: '',
}

export const getTimetableFields = ({
  classes,
  assignments,
}) => {
  return [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder:
        'e.g. Library study session',
    },
    {
      name: 'block_type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        {
          value: 'Personal',
          label: 'Personal',
        },
        {
          value: 'Study',
          label: 'Study',
        },
        {
          value: 'Revision',
          label: 'Revision',
        },
        {
          value: 'Coursework',
          label: 'Coursework',
        },
      ],
    },
    {
      name: 'class_id',
      label: 'Class',
      type: 'select',
      options: [
        {
          value: '',
          label: 'No class',
        },
        ...classes.map(
          (classItem) => ({
            value: classItem.id,
            label:
              classItem.code ||
              classItem.name,
          }),
        ),
      ],
    },
    {
      name: 'coursework_id',
      label: 'Coursework',
      type: 'select',
      options: [
        {
          value: '',
          label: 'No coursework',
        },
        ...assignments.map(
          (assignment) => ({
            value: assignment.id,
            label:
              assignment.title,
          }),
        ),
      ],
    },
    {
      name: 'block_date',
      label: 'Date',
      type: 'date',
      required: true,
    },
    {
      name: 'start_time',
      label: 'Start time',
      type: 'time',
      required: true,
    },
    {
      name: 'end_time',
      label: 'End time',
      type: 'time',
      required: true,
    },
    {
      name: 'is_recurring',
      label: 'Repeat this event',
      type: 'checkbox',
    },
    {
      name: 'recurrence_type',
      label: 'Repeat',
      type: 'select',
      options: [
        {
          value: 'none',
          label: 'Does not repeat',
        },
        {
          value: 'daily',
          label: 'Daily',
        },
        {
          value: 'weekly',
          label: 'Weekly',
        },
        {
          value: 'monthly',
          label: 'Monthly',
        },
      ],
    },
    {
      name: 'recurrence_end_date',
      label: 'Repeat until',
      type: 'date',
    },
  ]
}
