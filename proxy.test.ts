/** @jest-environment node */
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { COOKIE } from '@/src/api/server/auth-cookies';

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
