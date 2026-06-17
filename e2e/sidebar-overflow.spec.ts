import { test, expect } from '@playwright/test';

// #191 회귀: 세로 해상도가 부족할 때 — 헤더(로고+토글)와 새할일/프로필 푸터는 고정되고,
// 그 사이 내비(메뉴~로그아웃)만 스크롤되어 내용이 잘리지 않아야 한다. 데스크탑·모바일 동일.

test('데스크탑: 헤더·푸터는 고정되고 내비만 스크롤된다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 360 }); // >1280 → 펼친 사이드바, 짧은 세로
  await page.goto('/');

  // 푸터(새할일)는 잘리지 않고 뷰포트에 보인다(하단 고정)
  await expect(page.getByRole('button', { name: '새 할일' })).toBeInViewport();

  // 내비 스크롤 영역이 스크롤된다 (헤더·푸터는 영역 밖이라 스크롤에 영향받지 않음)
  const scrollArea = page.locator('aside div.overflow-y-auto');
  const overflows = await scrollArea.evaluate((el) => el.scrollHeight > el.clientHeight + 1);
  expect(overflows).toBe(true);
  await scrollArea.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  expect(await scrollArea.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});

test('모바일: 펼침 메뉴도 헤더·푸터는 고정되고 내비만 스크롤된다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 420 });
  await page.goto('/');
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  await expect(page.getByRole('button', { name: '새 할일' })).toBeInViewport(); // 푸터 고정
  await page.waitForTimeout(800); // 펼침 height 스프링 애니메이션 안정화

  const scrollArea = page.locator('.pb-12 div.overflow-y-auto');
  const overflows = await scrollArea.evaluate((el) => el.scrollHeight > el.clientHeight + 1);
  expect(overflows).toBe(true);
  await scrollArea.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  expect(await scrollArea.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
