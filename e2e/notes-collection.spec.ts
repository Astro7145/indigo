import { test, expect } from '@playwright/test';

// 노트 모아보기 E2E — 드로어 라우팅(리스트 → 드로어 → 닫기)과 standalone 진입(직접 URL)을 검증한다.
// 인증은 auth.setup.ts에서 1회 로그인해 storageState로 공유한다(동시 로그인 409 회피).
// 테스트 계정(.env BACKEND_TEST_*) 미설정 시 스킵.
const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;

/** 대시보드에서 첫 번째 목표 카드를 클릭해 노트 모아보기 페이지로 진입하는 공통 헬퍼.
 * 목표나 노트가 없으면 이유와 함께 null을 반환한다. */
async function navigateToNotesCollection(
  page: import('@playwright/test').Page,
): Promise<{ reachedNotesPage: true } | { reachedNotesPage: false; reason: string }> {
  await page.goto('/');

  // 대시보드: "목표 별 할일" 섹션의 첫 번째 목표 카드를 찾는다(로드 넉넉히 대기)
  const section = page.getByRole('region', { name: '목표 별 할일' });
  await expect(section).toBeVisible({ timeout: 15_000 });

  // 진행바가 보이면 목표 카드가 렌더된 것 — 없으면 목표 0개
  // locator.isVisible() 은 대기 없이 즉시 반환하므로 expect().toBeVisible() + try/catch 패턴을 사용한다
  let hasGoals = false;
  try {
    await expect(section.getByRole('progressbar').first()).toBeVisible({ timeout: 10_000 });
    hasGoals = true;
  } catch {
    hasGoals = false;
  }

  if (!hasGoals) {
    return { reachedNotesPage: false, reason: '등록된 목표가 없어 노트 모아보기 진입 불가 — 데이터 필요' };
  }

  // 첫 번째 목표 카드(role=button)를 클릭해 목표 상세로 이동한다
  await section.getByRole('button').first().click();
  await expect(page).toHaveURL(/\/goals\/\d+$/, { timeout: 10_000 });

  // 목표 상세 페이지에서 "노트 모아보기" 카드를 클릭한다
  const notesCard = page.getByRole('button', { name: /노트 모아보기/ });
  await expect(notesCard).toBeVisible({ timeout: 10_000 });
  await notesCard.click();

  // 노트 목록 페이지: URL이 /goals/[id]/notes 형태
  await expect(page).toHaveURL(/\/goals\/\d+\/notes$/, { timeout: 10_000 });

  return { reachedNotesPage: true };
}

test.describe('노트 모아보기', () => {
  test.skip(!EMAIL || !PASSWORD, '테스트 계정(BACKEND_TEST_EMAIL/PASSWORD) 미설정 시 스킵');

  test.describe('노트 목록 페이지', () => {
    // 대시보드 → 목표 상세 → 노트 모아보기 카드 클릭으로 진입한다.
    // 목표가 하나도 없으면 이 단계에서 스킵한다.
    test('노트 목록 페이지로 진입할 수 있다', async ({ page }) => {
      const result = await navigateToNotesCollection(page);
      if (!result.reachedNotesPage) {
        test.skip(true, result.reason);
        return;
      }

      // 페이지 헤더가 보인다
      await expect(page.getByRole('heading', { name: '노트 모아보기', level: 1 })).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('드로어 라우팅', () => {
    test('노트 카드를 클릭하면 드로어가 열리고, 닫기를 누르면 목록으로 돌아온다', async ({ page }) => {
      const result = await navigateToNotesCollection(page);
      if (!result.reachedNotesPage) {
        test.skip(true, result.reason);
        return;
      }

      await expect(page.getByRole('heading', { name: '노트 모아보기', level: 1 })).toBeVisible({ timeout: 10_000 });

      // 노트 카드가 있는지 확인 — 없으면 드로어 검증 불가(스킵)
      // 로딩 완료 대기 (로딩 스피너 텍스트가 사라질 때까지)
      await expect(page.getByText('불러오는 중…')).toBeHidden({ timeout: 10_000 });
      const noteListItems = page.locator('ul li');
      const noteCount = await noteListItems.count();
      if (noteCount === 0) {
        test.skip(true, '이 목표에 노트가 없어 드로어 테스트 불가 — 노트가 있는 목표 필요');
        return;
      }

      // 첫 번째 노트 카드 클릭
      await noteListItems.first().click();

      // 드로어(role=dialog, aria-label="노트 상세")가 열린다
      const drawer = page.getByRole('dialog', { name: '노트 상세' });
      await expect(drawer).toBeVisible({ timeout: 10_000 });

      // URL이 /goals/[id]/notes/[noteId] 형태로 바뀐다
      await expect(page).toHaveURL(/\/goals\/\d+\/notes\/\d+$/, { timeout: 5_000 });

      // 드로어 안에 "닫기" 버튼이 존재한다
      await expect(drawer.getByRole('button', { name: '닫기' })).toBeVisible();

      // 드로어 닫기: Escape 키(NoteDetailDrawer의 keydown 핸들러)로 닫는다.
      // "닫기" 버튼 좌표 클릭은 dev 서버의 TanStack Query DevTools(tsqd-parent-container)가
      // 포인터 이벤트를 가로채므로 키보드 방법이 더 안정적이다.
      await page.keyboard.press('Escape');
      // router.back()이 발화한 뒤 Next.js가 @detail 슬롯을 default(null)로 교체할 때까지 대기
      await expect(page).toHaveURL(/\/goals\/\d+\/notes$/, { timeout: 10_000 });
      await expect(drawer).toBeHidden({ timeout: 5_000 });
    });
  });

  test.describe('standalone 진입', () => {
    test('노트 URL에 직접 진입하면 드로어 없이 노트 내용이 표시된다', async ({ page }) => {
      const result = await navigateToNotesCollection(page);
      if (!result.reachedNotesPage) {
        test.skip(true, result.reason);
        return;
      }

      await expect(page.getByRole('heading', { name: '노트 모아보기', level: 1 })).toBeVisible({ timeout: 10_000 });

      // 노트 카드가 있는지 확인
      await expect(page.getByText('불러오는 중…')).toBeHidden({ timeout: 10_000 });
      const noteListItems = page.locator('ul li');
      const noteCount = await noteListItems.count();
      if (noteCount === 0) {
        test.skip(true, '이 목표에 노트가 없어 standalone 테스트 불가 — 노트가 있는 목표 필요');
        return;
      }

      // 첫 번째 카드 클릭 → 드로어로 열림 → URL 확보
      await noteListItems.first().click();
      await expect(page).toHaveURL(/\/goals\/\d+\/notes\/\d+$/, { timeout: 5_000 });
      const noteUrl = page.url();

      // 같은 URL에 직접(하드) 진입: 드로어 없이 standalone 렌더
      await page.goto(noteUrl);

      // dialog(드로어)가 없어야 한다
      await expect(page.getByRole('dialog', { name: '노트 상세' })).toBeHidden();

      // 노트 내용이 보인다(NoteDetail — h2 제목이 포함된 노트 상세 본문)
      await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 10_000 });
    });
  });
});
