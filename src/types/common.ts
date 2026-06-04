/** 커서 기반 페이지네이션 공통 쿼리 파라미터. 응답 envelope는 도메인마다 키가 다르므로 도메인 타입에서 개별 정의한다. */
export interface CursorParams {
  cursor?: number;
  limit?: number;
}

export interface ApiErrorInit {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
}

/** 모든 API 실패는 이 타입으로 정규화된다 (client-fetcher 응답 인터셉터). */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
  }
}

/** 단순 메시지 응답 (logout, 비밀번호 변경 등 본문이 메시지만 있는 엔드포인트). */
export interface MessageResponse {
  message: string;
}

export interface ErrorBody {
  message?: string;
  code?: string;
}
