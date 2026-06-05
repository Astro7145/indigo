import type { AxiosAdapter, AxiosError } from 'axios';
import instance, { shouldRedirectToLogin } from '@/src/api/client-fetcher';
import type { ErrorBody } from '@/src/types/common';

afterEach(() => {
  // restore default adapter so per-test overrides don't leak
  delete (instance.defaults as { adapter?: unknown }).adapter;
  window.history.pushState({}, '', '/');
});

// shouldRedirectToLogin 판정용 최소 AxiosError. 리다이렉트는 status === 401에서만 트리거되므로 기본값을 401로 둔다.
function err(code: string | undefined, url: string, status: number = 401): AxiosError<ErrorBody> {
  return {
    isAxiosError: true,
    config: { url },
    response: { data: { code }, status },
  } as unknown as AxiosError<ErrorBody>;
}

it('same-origin BFF 프록시 baseURL을 사용한다', () => {
  expect(instance.defaults.baseURL).toBe('/api');
});

it('404 응답을 ApiError로 정규화한다', async () => {
  instance.defaults.adapter = (async (config) => {
    return Promise.reject({
      isAxiosError: true,
      message: 'Request failed',
      config,
      response: { data: { message: 'missing', code: 'NOT_FOUND' }, status: 404, statusText: '', headers: {}, config },
    });
  }) as AxiosAdapter;
  await expect(instance.get('/todos/1')).rejects.toMatchObject({
    name: 'ApiError',
    status: 404,
    code: 'NOT_FOUND',
    message: 'missing',
  });
});

it('네트워크 에러(응답 없음)를 status 0인 ApiError로 정규화한다', async () => {
  instance.defaults.adapter = (async () => {
    return Promise.reject({ isAxiosError: true, message: 'Network Error' });
  }) as AxiosAdapter;
  const err = await instance.get('/todos').catch((e) => e);
  expect(err.name).toBe('ApiError');
  expect(err.status).toBe(0);
});

it('TOKEN_INVALID 코드는 /login 리다이렉트 대상이다', () => {
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err('TOKEN_INVALID', '/todos/1'))).toBe(true);
});

it('TOKEN_INVALID 외 401 코드(TOKEN_EXPIRED 등)도 리다이렉트 대상이다', () => {
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err('TOKEN_EXPIRED', '/todos/1'))).toBe(true);
});

it('TOKEN_INVALID라도 /auth/* 요청은 리다이렉트하지 않는다', () => {
  // /login이 아닌 경로에서 판정해야 /auth/* 제외 로직 자체가 검증된다
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err('TOKEN_INVALID', '/auth/login'))).toBe(false);
});

it('이미 /login 페이지면 TOKEN_INVALID여도 리다이렉트하지 않는다', () => {
  window.history.pushState({}, '', '/login');
  expect(shouldRedirectToLogin(err('TOKEN_INVALID', '/todos/1'))).toBe(false);
});

it('INVALID_CREDENTIALS 코드는 리다이렉트하지 않는다', () => {
  // auth 경로가 아닌 곳에서 판정해 code 기반 제외 자체가 검증되도록 한다
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err('INVALID_CREDENTIALS', '/todos/1'))).toBe(false);
});

it('401이 아닌 응답(400/404 등)은 code와 무관하게 리다이렉트하지 않는다', () => {
  // 인증과 무관한 4xx가 자동 로그인 리다이렉트로 흘러들어가지 않도록 한다 — 각 도메인의 onError가 처리한다
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err('VALIDATION_FAILED', '/posts/1/comments', 400))).toBe(false);
  expect(shouldRedirectToLogin(err('NOT_FOUND', '/posts/1', 404))).toBe(false);
  expect(shouldRedirectToLogin(err(undefined, '/posts/1', 500))).toBe(false);
});

it('응답이 없는 네트워크 에러는 리다이렉트하지 않는다', () => {
  window.history.pushState({}, '', '/dashboard');
  const networkErr = { isAxiosError: true, config: { url: '/todos/1' } } as unknown as AxiosError<ErrorBody>;
  expect(shouldRedirectToLogin(networkErr)).toBe(false);
});
