/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^n8n-workflow$': '<rootDir>/tests/__mocks__/n8n-workflow.ts',
  },
};
