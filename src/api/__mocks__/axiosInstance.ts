// Jest 수동 목 — 도메인 테스트에서 jest.mock('@/src/api/axiosInstance') 시 사용된다.
// 실제 axiosInstance.ts(및 그 인터셉터)를 로드하지 않고 HTTP 메서드 스텁만 제공한다.
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
