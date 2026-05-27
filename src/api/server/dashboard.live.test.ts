/** @jest-environment node */
// 대시보드가 의존하는 실제 SlidTodo API 응답을 테스트 계정으로 검증하는 라이브 통합 테스트.
// 단위 테스트(컴포넌트/훅)는 mock으로 동작·UI를 검증하지만, 여기서는 "실제 백엔드가
// 대시보드가 기대하는 shape(goals의 진행률 카운트, todos의 done/isFavorite 등)를
// 돌려주는가"를 확인한다. BACKEND_TEST_EMAIL/PASSWORD 미설정 시 전체 스킵.
import { NextRequest, type NextResponse } from 'next/server';
import { POST as authPost } from '@/app/api/iauth/[action]/route';
import { GET as proxyGet } from '@/app/api/[...path]/route';
import { COOKIE } from '@/src/api/server/bff';

const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;
const d = EMAIL && PASSWORD ? describe : describe.skip;

beforeAll(() => {
  process.env.BACKEND_API_BASE_URL ||= 'https://slid-to-do-api.vercel.app';
  process.env.BACKEND_TEAM_ID ||= 'indigo';
});

function cookieHeaderFrom(res: NextResponse): string {
  const a = res.cookies.get(COOKIE.ACCESS)?.value ?? '';
  const r = res.cookies.get(COOKIE.REFRESH)?.value ?? '';
  return `${COOKIE.ACCESS}=${a}; ${COOKIE.REFRESH}=${r}`;
}

async function login(): Promise<string> {
  // 공유 테스트 계정은 직전 세션이 남아 있으면 재로그인에 409(세션/토큰 충돌)를 반환할 수
  // 있다(연속 실행·pre-commit 재실행 등). 짧게 재시도해 충돌 윈도가 지나길 기다린다.
  for (let attempt = 1; ; attempt++) {
    const res = await authPost(
      new NextRequest('http://localhost/api/iauth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      }),
      { params: Promise.resolve({ action: 'login' }) },
    );
    if (res.status === 200) return cookieHeaderFrom(res);
    if (res.status === 409 && attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    expect(res.status).toBe(200); // 재시도 후에도 실패하면 명확히 단언 실패
    throw new Error('unreachable');
  }
}

async function logout(cookie: string): Promise<void> {
  // 세션(refresh 토큰)을 해제해 다음 실행의 로그인이 409로 충돌하지 않게 한다. best-effort.
  await authPost(
    new NextRequest('http://localhost/api/iauth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
    }),
    { params: Promise.resolve({ action: 'logout' }) },
  ).catch(() => {});
}

// `urlPath`는 쿼리스트링 포함 가능(프록시가 nextUrl.search를 외부 API로 포워딩), `segments`는 [...path]
function proxyGetJson(cookie: string, urlPath: string, segments: string[]) {
  return proxyGet(new NextRequest(`http://localhost/api/${urlPath}`, { method: 'GET', headers: { cookie } }), {
    params: Promise.resolve({ path: segments }),
  });
}

d('대시보드 데이터 라이브 (실 SlidTodo API, 테스트 계정)', () => {
  jest.setTimeout(30000);

  // 외부 SlidTodo API는 공유 테스트 계정의 반복 로그인에 409(세션/토큰 충돌)를 반환하므로
  // 한 번만 로그인하고 쿠키를 모든 테스트에서 재사용한다.
  let cookie = '';
  beforeAll(async () => {
    cookie = await login();
  }, 30000);

  // 세션을 해제해 연속 실행(특히 pre-commit 재실행) 시 로그인 409를 방지한다.
  afterAll(async () => {
    if (cookie) await logout(cookie);
  });

  it('내 진행 상황 헤더 — users/me가 name을 반환한다', async () => {
    const res = await proxyGetJson(cookie, 'users/me', ['users', 'me']);
    expect(res.status).toBe(200);
    const me = await res.json();
    expect(typeof me.name).toBe('string');
  });

  it('목표 별 할일 — goals가 진행률 카운트(todoCount/completedCount)를 포함해 반환된다', async () => {
    const res = await proxyGetJson(cookie, 'goals?limit=2', ['goals']);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.goals)).toBe(true);
    expect(body).toHaveProperty('totalCount');
    // limit=2가 외부 API로 포워딩되므로 페이지 크기는 2 이하
    expect(body.goals.length).toBeLessThanOrEqual(2);
    for (const g of body.goals) {
      expect(typeof g.id).toBe('number');
      expect(typeof g.title).toBe('string');
      expect(typeof g.todoCount).toBe('number');
      expect(typeof g.completedCount).toBe('number');
    }
  });

  it('최근 등록한 할일 — todos가 대시보드 필드(done/isFavorite/noteIds/goal)를 포함해 반환된다', async () => {
    const res = await proxyGetJson(cookie, 'todos?sort=latest', ['todos']);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.todos)).toBe(true);
    for (const t of body.todos) {
      expect(typeof t.id).toBe('number');
      expect(typeof t.title).toBe('string');
      expect(typeof t.done).toBe('boolean');
      expect(typeof t.isFavorite).toBe('boolean');
      expect(Array.isArray(t.noteIds)).toBe(true);
      // 속한 목표는 null이거나 { id, title }
      if (t.goal !== null) {
        expect(typeof t.goal.id).toBe('number');
        expect(typeof t.goal.title).toBe('string');
      }
    }
  });

  it('목표별 To Do/Done 분리 — goalId로 거른 todos는 모두 그 목표 소속이다', async () => {
    const goalsRes = await proxyGetJson(cookie, 'goals?limit=1', ['goals']);
    const goals = (await goalsRes.json()).goals as Array<{ id: number }>;
    if (goals.length === 0) return; // 계정에 목표가 없으면 검증 생략(no-op)

    const goalId = goals[0].id;
    const res = await proxyGetJson(cookie, `todos?goalId=${goalId}`, ['todos']);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.todos)).toBe(true);
    for (const t of body.todos) {
      expect(t.goalId).toBe(goalId);
    }
  });
});
