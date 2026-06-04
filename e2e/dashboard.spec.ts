import { test, expect } from '@playwright/test';

// 대시보드 E2E — 기존 jest 라이브 통합 테스트(dashboard.live.test.ts)를 대체한다.
// 대시보드가 데이터를 렌더하는지, 그리고 무한 스크롤이 다음 목표 페이지를 실제로
// 불러오는지(스크롤·뷰포트 기반 — jsdom에선 못 보는 동작)를 검증한다.
// 인증은 auth.setup.ts에서 1회 로그인해 storageState로 공유한다(동시 로그인 409 회피).
// 테스트 계정(.env BACKEND_TEST_*) 미설정 시 스킵.
const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;

test.describe('대시보드', () => {
  test.skip(!EMAIL || !PASSWORD, '테스트 계정(BACKEND_TEST_EMAIL/PASSWORD) 미설정 시 스킵');

  test.describe('렌더', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
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
      await page.goto('/');
    });

    test('목표를 끝까지 스크롤하면 다음 페이지를 추가로 불러온다', async ({ page }) => {
      const section = page.getByRole('region', { name: '목표 별 할일' });
      // 각 목표 카드의 진행바 1개씩 → 진행바 개수 = 렌더된 목표 수 (dev 서버+실제 백엔드라 넉넉히 대기)
      await expect(section.getByRole('progressbar').first()).toBeVisible({ timeout: 15_000 });
      const initial = await section.getByRole('progressbar').count();

      // 스크롤 컨테이너는 <main>(overflow-y-auto). webkit headless에선 프로그램적 scrollTo만으론
      // IntersectionObserver(sentinel)가 안정적으로 발화하지 않으므로 실제 스크롤 제스처를 섞어 반복한다:
      // 마지막 목표 카드를 뷰로 들이고(native scroll) 휠로 한 번 더 민 뒤 <main> 바닥까지 보낸다.
      // 페이지가 길어질 수 있어 toPass로 재시도(여유 타임아웃).
      await expect(async () => {
        await section
          .getByRole('progressbar')
          .last()
          .scrollIntoViewIfNeeded()
          .catch(() => {}); // 재렌더로 일시 분리되면 다음 회차에 재시도
        await page.mouse.move(800, 200);
        await page.mouse.wheel(0, 1500);
        await page.locator('main').evaluate((el) => el.scrollTo(0, el.scrollHeight));
        expect(await section.getByRole('progressbar').count()).toBeGreaterThan(initial);
      }).toPass({ timeout: 20_000 });
    });
  });
});
