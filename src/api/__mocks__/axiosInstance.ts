// Jest 수동 목 — 도메인 테스트에서 jest.mock('@/src/api/axiosInstance') 시 사용된다.
// 실제 axiosInstance.ts(모듈 로드 시 NEXT_PUBLIC_API_BASE_URL 검사로 throw)를
// 로드하지 않도록 하여 도메인 테스트가 환경 변수에 의존하지 않게 한다.
const instance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
  request: jest.fn(),
}

export { instance }
export default instance
