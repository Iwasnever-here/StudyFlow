export const initialTodoFields = (classes = []) => [
  {
    name: 'title',
    label: 'Task',
    type: 'text',
    placeholder: 'What do you need to do?',
    required: true,
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
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
      ...classes.map((classItem) => ({
        label: classItem.code
          ? `${classItem.name} (${classItem.code})`
          : classItem.name,
        value: classItem.id,
      })),
    ],
  },
]