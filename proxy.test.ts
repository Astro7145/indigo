/** @jest-environment node */
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { COOKIE } from '@/src/api/server/auth-cookies';

// next-intl은 ESM이라 Jest(next/jest)가 파싱하지 못한다(node_modules 미변환).
// 이 테스트의 관심사는 인증 가드이므로 라이브러리 모듈만 가볍게 스텁한다.
// - middleware: 통과(NextResponse.next())만 반환해 인증 통과 케이스를 격리.
// - routing(defineRouting): 입력 설정을 그대로 반환 → 실제 src/i18n/routing.ts의
//   locales·defaultLocale·isValidLocale 로직은 그대로 동작한다.
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: () => () => jest.requireActual('next/server').NextResponse.next(),
}));
jest.mock('next-intl/routing', () => ({
  __esModule: true,
  defineRouting: (config: unknown) => config,
}));

function req(pathname: string, cookie?: string) {
  return new NextRequest(`http://localhost${pathname}`, {
    headers: cookie ? { cookie } : {},
  });
}

const LOGGED_IN = `${COOKIE.REFRESH}=abc`;

it('비로그인 상태로 보호 페이지 접근 시 /login으로 리다이렉트하며 callbackUrl을 붙인다', () => {
  const res = proxy(req('/'));
  expect(res.headers.get('location')).toBe('http://localhost/login?callbackUrl=%2F');
});

it('callbackUrl에 원래 경로와 쿼리를 보존한다', () => {
  const res = proxy(req('/dashboard?tab=goals'));
  expect(res.headers.get('location')).toBe('http://localhost/login?callbackUrl=%2Fdashboard%3Ftab%3Dgoals');
});

it('비로그인 상태에서 인증 페이지(/login)는 통과시킨다', () => {
  const res = proxy(req('/login'));
  expect(res.headers.get('location')).toBeNull();
});

it('로그인 상태로 보호 페이지 접근 시 통과시킨다', () => {
  const res = proxy(req('/', LOGGED_IN));
  expect(res.headers.get('location')).toBeNull();
});

it('로그인 상태로 인증 페이지(/login) 접근 시 /로 리다이렉트한다', () => {
  const res = proxy(req('/login', LOGGED_IN));
  expect(res.headers.get('location')).toBe('http://localhost/');
});

it('로그인 상태로 회원가입 페이지(/signup) 접근 시 /로 리다이렉트한다', () => {
  const res = proxy(req('/signup', LOGGED_IN));
  expect(res.headers.get('location')).toBe('http://localhost/');
});
