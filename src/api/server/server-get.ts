// SERVER-ONLY: RSC prefetch용 GET 헬퍼 — cookies()의 토큰으로 기존 callExternal을 호출한다.
import { cookies } from 'next/headers';

import { COOKIE, callExternal } from '@/src/api/server/server-fetcher';

function toSearch(params?: Record<string, unknown>): string | undefined {
  if (!params) return undefined;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : undefined;
}

/**
 * 서버 컴포넌트 prefetch 전용 GET. 401이어도 **refresh를 시도하지 않는다** —
 * 백엔드 refresh는 rotation 방식(grace period 밖에선 새 refresh 토큰 발급)인데 RSC는 쿠키를
 * set할 수 없어 새 토큰이 유실되고 세션이 끊길 수 있다. 만료 시 prefetch만 실패하고,
 * 클라 첫 호출이 BFF(라우트 핸들러)의 silent refresh로 쿠키까지 안전하게 회전시킨다.
 * 실패는 throw → prefetchQuery가 삼켜 dehydrate에서 빠진다(해당 경계만 클라 재시도, SSR 무해).
 */
export async function serverGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const jar = await cookies();
  const access = jar.get(COOKIE.ACCESS)?.value;
  if (!access) throw new Error(`serverGet ${path}: no access token`);

  const r = await callExternal({ method: 'GET', path, search: toSearch(params), accessToken: access });
  if (r.status < 200 || r.status >= 300) throw new Error(`serverGet ${path}: ${r.status}`);
  return JSON.parse(r.body) as T;
}
