import { test, expect } from '@playwright/test';

// 대시보드 E2E — 기존 jest 라이브 통합 테스트(dashboard.live.test.ts)를 대체한다.
// 실제 백엔드 응답 shape 대신, "테스트 계정으로 로그인하면 대시보드가 사용자 데이터를 렌더하는가"를
// 브라우저에서 검증한다. 테스트 계정(.env BACKEND_TEST_*) 미설정 시 스킵.
const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;

test.describe('대시보드', () => {
  test.skip(!EMAIL || !PASSWORD, '테스트 계정(BACKEND_TEST_EMAIL/PASSWORD) 미설정 시 스킵');

  test('로그인하면 대시보드가 사용자 데이터를 렌더한다', async ({ page }) => {
    // 1) 로그인 — 폼 검증(onBlur) 통과 후 제출
    await page.goto('/login');
    await page.getByPlaceholder('이메일을 입력해주세요').fill(EMAIL!);
    const pw = page.getByPlaceholder('비밀번호를 입력해주세요');
    await pw.fill(PASSWORD!);
    await pw.blur();

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/iauth/login') && r.request().method() === 'POST'),
      page.getByRole('button', { name: '로그인하기' }).click(),
    ]);

    // 2) 대시보드 진입 (useLogin은 별도 네비게이션을 하지 않으므로 직접 이동)
    await page.goto('/');

    // 3) 사용자 데이터 렌더 검증
    // users/me — "{name}님의 대시보드" 헤더
    await expect(page.getByRole('heading', { name: /님의 대시보드/ })).toBeVisible();
    // goals — "목표 별 할일" 섹션은 목표가 있을 때만 렌더되므로 데이터 로드의 신호다
    await expect(page.getByRole('heading', { name: '목표 별 할일' })).toBeVisible();
    // 목표 카드의 진행바가 최소 1개 렌더된다
    await expect(page.getByRole('progressbar').first()).toBeVisible();
    // 최근 등록한 할일 카드 헤더
    await expect(page.getByRole('heading', { name: '최근 등록한 할일' })).toBeVisible();
  });
});
