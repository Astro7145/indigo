/** 커서 기반 페이지네이션 공통 쿼리 파라미터. 응답 envelope는 도메인마다 키가 다르므로 도메인 타입에서 개별 정의한다. */
export interface CursorParams {
  cursor?: number
  limit?: number
}

export interface ApiErrorInit {
  status: number
  code?: string
  message: string
  details?: unknown
}

/** 모든 API 실패는 이 타입으로 정규화된다 (axiosInstance 응답 인터셉터). */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(init: ApiErrorInit) {
    super(init.message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.details = init.details
  }
}

/** authSeam이 아직 BFF에 연결되지 않았음을 나타낸다. axiosInstance가 이 에러를 만나면 refresh를 시도하지 않는다. */
export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'NotImplementedError'
  }
}
