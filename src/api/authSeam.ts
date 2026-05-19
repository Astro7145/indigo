//
// 인증 시임 — 유일한 인증 확장 지점.
//
// 규칙(절대 위반 금지):
//  - 토큰을 localStorage/sessionStorage/window/Zustand 등 클라이언트 스토리지에서
//    읽거나 쓰지 않는다. CLAUDE.md 인증 규칙(HttpOnly 쿠키 + Next.js 서버 경유).
//  - 추후 auth 이슈에서 이 두 함수 본문만 BFF(Route Handler) 연동으로 교체한다.
//    호출 시그니처는 변경하지 않는다.
import { NotImplementedError } from '@/src/types/common'

/**
 * 현재 액세스 토큰을 반환. 미연동 상태에서는 항상 null.
 * null은 에러가 아니라 "Authorization 헤더를 생략한다"는 의도된 계약이다 —
 * axiosInstance 요청 인터셉터가 이 계약에 의존하므로 호출자는 null을 실패로 다루지 않는다.
 */
export async function getAccessToken(): Promise<string | null> {
  return null
}

/** 토큰 재발급을 트리거. 미연동 상태에서는 NotImplementedError를 던진다. */
export async function refreshAccessToken(): Promise<void> {
  throw new NotImplementedError('authSeam.refreshAccessToken is not wired to the BFF yet')
}
