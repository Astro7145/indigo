/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { GET as proxyGet } from '@/app/api/[...path]/route';
import { COOKIE } from '@/src/api/server/server-fetcher';

const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;
const d = EMAIL && PASSWORD ? describe : describe.skip;

beforeAll(() => {
  process.env.BACKEND_API_BASE_URL ||= 'https://slid-to-do-api.vercel.app';
  process.env.BACKEND_TEAM_ID ||= 'indigo';
});

function cookieHeaderFrom(res: import('next/server').NextResponse): string {
  const a = res.cookies.get(COOKIE.ACCESS)?.value ?? '';
  const r = res.cookies.get(COOKIE.REFRESH)?.value ?? '';
  return `${COOKIE.ACCESS}=${a}; ${COOKIE.REFRESH}=${r}`;
}

d('BFF live (real SlidTodo API, teamId from env)', () => {
  jest.setTimeout(30000);

  it('login은 쿠키를 설정하고 토큰을 제거하며, 프록시된 GET이 동작한다', async () => {
    const loginRes = await loginPost(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      }),
    );
    expect(loginRes.status).toBe(200);
    const body = await loginRes.json();
    expect(body.user).toBeDefined();
    expect(body.accessToken).toBeUndefined();
    expect(loginRes.cookies.get(COOKIE.ACCESS)?.value).toBeTruthy();
    expect(loginRes.cookies.get(COOKIE.REFRESH)?.value).toBeTruthy();

    const meRes = await proxyGet(
      new NextRequest('http://localhost/api/users/me', {
        method: 'GET',
        headers: { cookie: cookieHeaderFrom(loginRes) },
      }),
      { params: Promise.resolve({ path: ['users', 'me'] }) },
    );
    expect(meRes.status).toBe(200);
  });

  // refresh 시나리오는 의도적으로 라이브에서 제외한다: 외부 SlidTodo refresh 토큰이
  // 단발성/grace-period 정책(스펙 명시)이라 공유 테스트 계정·반복 호출에서 409/401을
  // 비결정적으로 반환한다(백엔드 API 특성). refresh 라우트/refreshTokens 로직은
  // 결정적인 단위 테스트(backend.test.ts, auth/[action] route.test.ts, [...path] 401→retry)로
  // 이미 검증된다. 라이브는 결정적인 login·프록시·logout만 실API로 확인한다.

  it('logout은 쿠키를 삭제하고, 이후 프록시된 GET은 401이다', async () => {
    const loginRes = await loginPost(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      }),
    );
    const cookie = cookieHeaderFrom(loginRes);
    const logoutRes = await logoutPost(
      new NextRequest('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
      }),
    );
    expect(logoutRes.status).toBe(204);
    expect(logoutRes.cookies.get(COOKIE.ACCESS)?.value).toBe('');

    // cookies cleared by logout response → simulate the now-empty cookie jar
    const afterRes = await proxyGet(
      new NextRequest('http://localhost/api/users/me', {
        method: 'GET',
        headers: { cookie: `${COOKIE.ACCESS}=; ${COOKIE.REFRESH}=` },
      }),
      { params: Promise.resolve({ path: ['users', 'me'] }) },
    );
    expect(afterRes.status).toBe(401);
  });
});
