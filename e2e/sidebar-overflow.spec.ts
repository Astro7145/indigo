import { test, expect } from '@playwright/test';

// #191 회귀: 세로 해상도가 부족할 때 상단 내비(로고~로그아웃)는 스크롤되고,
// 새할일/프로필 푸터는 하단에 고정되어 잘리지 않아야 한다.
test('세로 공간이 부족하면 상단 내비는 스크롤되고 새할일 푸터는 고정된다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 360 }); // >1280 → 펼친 사이드바, 짧은 세로
  await page.goto('/');

  // 푸터(새할일)는 잘리지 않고 뷰포트에 보인다(하단 고정)
  await expect(page.getByRole('button', { name: '새 할일' })).toBeInViewport();

  // 상단 내비 영역이 스크롤된다 (버그였을 땐 스크롤 불가 → 하단 내용 잘림)
  const scrollArea = page.locator('aside div.overflow-y-auto');
  const overflows = await scrollArea.evaluate((el) => el.scrollHeight > el.clientHeight + 1);
  expect(overflows).toBe(true);
  await scrollArea.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  expect(await scrollArea.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
