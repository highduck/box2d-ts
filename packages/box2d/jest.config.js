export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  globals: {
    B2_ENABLE_CONTROLLER: true,
    B2_ENABLE_PARTICLE: true,
    B2_ASSERT: true,
    B2_DEBUG: true,
    B2_ENABLE_PROFILER: false,
  },
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js|jsx)', '**/?(*.)+(spec|test).+(ts|tsx|js|jsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: ['^.+/node_modules/(?!(@eliasku/fast-math))/.+$'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  // coveragePathIgnorePatterns: [
  //     "<rootDir>/dist"
  // ],
  coverageReporters: ['json', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
