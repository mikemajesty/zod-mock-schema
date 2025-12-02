module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    'node_modules/@faker-js/faker/.+\\.js$': 'ts-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@faker-js/faker|randexp)/)'
  ],
  moduleNameMapper: {
    '^@faker-js/faker$': '<rootDir>/node_modules/@faker-js/faker/dist/index.js'
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json']
};