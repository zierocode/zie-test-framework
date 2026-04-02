export default {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  coverage: {
    provider: 'v8',
    reportOn: ['text', 'html'],
  },
};
