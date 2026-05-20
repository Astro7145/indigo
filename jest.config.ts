import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // 테스트 전에 실행할 설정 파일을 지정
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Playwright(e2e/)는 별도 러너로 실행 — Jest 수집 대상에서 제외
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  // 테스트 파일은 *.test.{ts,tsx}만 — __tests__/ 폴더의 헬퍼 모듈(예: test-utils.tsx)을 테스트로 오인하지 않도록 기본 testMatch를 좁힌다
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
  // tsconfig paths를 jest.mock() 호이스팅에서도 인식하도록 매핑
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
