export const initialTodoFields = (
  classes = []
) => [
  {
    name: 'title',
    label: 'Task',
    type: 'text',
    placeholder:
      'What do you need to do?',
    required: true,
  },
  {
    name: 'due_date',
    label: 'Due date',
    type: 'date',
    required: true,
  },
  {
    name: 'class_id',
    label: 'Class',
    type: 'select',
    required: false,
    options: [
      {
        label: 'No class',
        value: '',
      },
      ...classes.map(
        (classItem) => ({
          label: classItem.code
            ? `${classItem.name} (${classItem.code})`
            : classItem.name,
          value: classItem.id,
        })
      ),
    ],
  },
]