export default {
    type: "object",
    properties: {
      id: { type: 'string' },
      client: { type: 'string' },
    },
    required: ['id', 'client']
  } as const;
  