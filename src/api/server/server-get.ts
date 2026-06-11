// SERVER-ONLY: RSC prefetch용 GET 헬퍼 — cookies()의 토큰으로 기존 callExternal을 호출한다.
import { cookies } from 'next/headers';

import { COOKIE, callExternal, refreshTokens } from '@/src/api/server/server-fetcher';

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
 * 서버 컴포넌트 prefetch 전용 GET. 401 + refresh 보유 시 1회 재시도 —
 * RSC는 쿠키를 set할 수 없어 새 토큰은 이번 렌더에만 쓰고, 브라우저의 첫 클라 호출이 재회전한다.
 * 실패는 throw → prefetchQuery가 삼켜 dehydrate에서 빠진다(해당 경계만 클라 재시도, SSR 무해).
 */
export async function serverGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const jar = await cookies();
  const access = jar.get(COOKIE.ACCESS)?.value;
  const refresh = jar.get(COOKIE.REFRESH)?.value;
  if (!access && !refresh) throw new Error(`serverGet ${path}: no auth cookies`);

  const search = toSearch(params);
  let r = await callExternal({ method: 'GET', path, search, accessToken: access });
  if (r.status === 401 && refresh) {
    const tokens = await refreshTokens(refresh);
    if (!tokens) throw new Error(`serverGet ${path}: refresh failed`);
    r = await callExternal({ method: 'GET', path, search, accessToken: tokens.accessToken });
  }
  if (r.status < 200 || r.status >= 300) throw new Error(`serverGet ${path}: ${r.status}`);
  return JSON.parse(r.body) as T;
}
