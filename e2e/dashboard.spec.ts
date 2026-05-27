import { test, expect, type Page } from '@playwright/test';

// 대시보드 E2E — 기존 jest 라이브 통합 테스트(dashboard.live.test.ts)를 대체한다.
// 테스트 계정으로 로그인해 대시보드가 데이터를 렌더하는지, 그리고 무한 스크롤이 다음 목표
// 페이지를 실제로 불러오는지(스크롤·뷰포트 기반 — jsdom에선 못 보는 동작)를 검증한다.
// 테스트 계정(.env BACKEND_TEST_*) 미설정 시 스킵.
const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;

// 테스트 계정으로 로그인 → 대시보드 진입. useLogin은 별도 네비게이션을 하지 않으므로 직접 이동.
async function loginAndGoDashboard(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('이메일을 입력해주세요').fill(EMAIL!);
  const pw = page.getByPlaceholder('비밀번호를 입력해주세요');
  await pw.fill(PASSWORD!);
  await pw.blur(); // onBlur 검증 → 로그인 버튼 활성화
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/iauth/login') && r.request().method() === 'POST'),
    page.getByRole('button', { name: '로그인하기' }).click(),
  ]);
  await page.goto('/');
}

test.describe('대시보드', () => {
  test.skip(!EMAIL || !PASSWORD, '테스트 계정(BACKEND_TEST_EMAIL/PASSWORD) 미설정 시 스킵');
  // 같은 테스트 계정에 동시 로그인하면 백엔드가 409를 반환하므로(→쿠키 없음→쿼리 401) 순차 실행한다.
  test.describe.configure({ mode: 'serial' });

  test.describe('렌더', () => {
    test.beforeEach(async ({ page }) => {
      await loginAndGoDashboard(page);
    });

    test('사용자 데이터를 렌더한다', async ({ page }) => {
      // users/me — "{name}님의 대시보드" 헤더
      await expect(page.getByRole('heading', { name: /님의 대시보드/ })).toBeVisible();
      // goals — "목표 별 할일" 섹션은 목표가 있을 때만 렌더되므로 데이터 로드의 신호다
      await expect(page.getByRole('heading', { name: '목표 별 할일' })).toBeVisible();
      // 최근 등록한 할일 카드 헤더
      await expect(page.getByRole('heading', { name: '최근 등록한 할일' })).toBeVisible();
    });
  });

  test.describe('무한 스크롤', () => {
    // 짧은 뷰포트(높이만 축소): sentinel이 처음엔 화면 밖에 있어 페이지2가 자동 로드되지 않는다.
    // "실제 스크롤"을 해야 다음 페이지가 로드되므로 스크롤 동작 자체를 검증할 수 있다.
    test.use({ viewport: { width: 1280, height: 400 } });

    test.beforeEach(async ({ page }) => {
      await loginAndGoDashboard(page);
    });

    test('목표를 끝까지 스크롤하면 다음 페이지를 추가로 불러온다', async ({ page }) => {
      const section = page.getByRole('region', { name: '목표 별 할일' });
      // 각 목표 카드의 진행바 1개씩 → 진행바 개수 = 렌더된 목표 수 (dev 서버+실제 백엔드라 넉넉히 대기)
      await expect(section.getByRole('progressbar').first()).toBeVisible({ timeout: 15_000 });
      const initial = await section.getByRole('progressbar').count();

      // (main) 레이아웃은 min-h-screen이라 윈도우가 스크롤 컨테이너다(IO root=뷰포트).
      // 끝까지 스크롤 → sentinel 교차 → fetchNextPage. 페이지가 길어질 수 있어 toPass로 재시도.
      await expect(async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        expect(await section.getByRole('progressbar').count()).toBeGreaterThan(initial);
      }).toPass({ timeout: 10_000 });
    });
  });
});
