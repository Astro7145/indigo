import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// 모든 대시보드 e2e가 공유하는 인증 상태를 "1회 로그인"으로 만든다.
// 같은 테스트 계정에 여러 브라우저(chromium/firefox/webkit)가 동시 로그인하면 백엔드가
// 409를 반환하고(→쿠키 없음→쿼리 401→/login 리다이렉트), 프로젝트 간 병렬은 mode:serial로
// 막을 수 없다. 그래서 로그인은 여기서 한 번만 하고 storageState를 모든 프로젝트가 재사용한다.
const EMAIL = process.env.BACKEND_TEST_EMAIL;
const PASSWORD = process.env.BACKEND_TEST_PASSWORD;
const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');

setup('테스트 계정 로그인', async ({ page }) => {
  // 계정 미설정 시: 빈 storageState만 남긴다(대시보드 테스트는 자체적으로 skip된다).
  // 의존 프로젝트가 storageState 파일을 항상 읽을 수 있도록 파일은 반드시 존재해야 한다.
  if (!EMAIL || !PASSWORD) {
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  // useLogin은 별도 네비게이션을 하지 않으므로 폼으로 직접 로그인한다.
  await page.goto('/login');
  await page.getByPlaceholder('이메일을 입력해주세요').fill(EMAIL);
  const pw = page.getByPlaceholder('비밀번호를 입력해주세요');
  await pw.fill(PASSWORD);
  await pw.blur(); // onBlur 검증 → 로그인 버튼 활성화
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/iauth/login') && r.request().method() === 'POST'),
    page.getByRole('button', { name: '로그인하기' }).click(),
  ]);
  // 로그인 라우트는 성공 시 200으로 정규화하고 실패(동시 로그인 409 등)는 그대로 통과시킨다.
  // 여기서 명시적으로 실패를 잡아야 "쿠키 없는 채로 진행 → 대시보드 401" 증상을 가리지 않는다.
  expect(res.ok(), '로그인 응답이 2xx가 아님(동시 로그인 409 등)').toBeTruthy();

  // HttpOnly 인증 쿠키가 실제로 동작하는지 대시보드 진입으로 확인한 뒤 저장한다.
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /님의 대시보드/ })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
