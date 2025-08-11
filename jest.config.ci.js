const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

/**
 * CI-Specific Jest Configuration
 * 
 * This configuration is designed specifically for GitHub Actions CI environment
 * to completely prevent Jest from discovering or interacting with Playwright tests.
 * 
 * Features:
 * - Ultra-aggressive exclusion patterns
 * - CI-optimized performance settings
 * - Bulletproof test isolation
 */
const ciJestConfig = {
  // CI environment setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  
  // ABSOLUTE RESTRICTION: Only src/ directory
  roots: ['<rootDir>/src'],
  
  // CI-specific test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/?(*.)+(test).{js,jsx,ts,tsx}',
  ],
  
  // ULTRA-AGGRESSIVE EXCLUSION
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/tests/',
    '<rootDir>/playwright.config.ts',
    '<rootDir>/playwright-report/',
    '<rootDir>/test-results/',
    '\\.spec\\.',
    'tests/',
    '/tests/',
  ],
  
  // MODULE EXCLUSION
  modulePathIgnorePatterns: [
    '<rootDir>/tests/',
    '<rootDir>/playwright.config.ts',
    '<rootDir>/playwright-report/',
    '<rootDir>/test-results/',
    '\\.spec\\.',
    'tests/',
    '/tests/',
  ],
  
  // MODULE NAME MAPPING
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // TRANSFORM IGNORE
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$))',
    '^.+\\.module\\.(css|sass|scss)$',
    '<rootDir>/tests/',
    'tests/',
    '/tests/',
  ],
  
  // Coverage - only src/
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/tests/',
    '\\.spec\\.',
    'tests/',
    '/tests/',
  ],
  
  // CI-optimized settings
  testTimeout: 15000,
  maxWorkers: '50%',
  verbose: false,
  silent: false,
  
  // Clear everything between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Fail fast in CI
  bail: 1,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: ['next/babel']
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// Export the config
module.exports = createJestConfig(ciJestConfig);