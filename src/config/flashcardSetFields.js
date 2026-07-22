  const flashcardSetFields = useMemo(
    () => [
      {
        name: 'class_id',
        label: 'Class',
        type: 'select',
        required: true,
        options: classes.map((classItem) => ({
          label: classItem.code
            ? `${classItem.code} — ${classItem.name}`
            : classItem.name,
          value: classItem.id,
        })),
      },
      {
        name: 'title',
        label: 'Set Title',
        type: 'text',
        placeholder: 'Example: Week 1 Key Terms',
        required: true,
      },
    ],
    [classes]
  )