import type { AxiosAdapter, AxiosError } from 'axios';
import instance, { shouldRedirectToLogin } from '@/src/api/axiosInstance';

afterEach(() => {
  // restore default adapter so per-test overrides don't leak
  delete (instance.defaults as { adapter?: unknown }).adapter;
  window.history.pushState({}, '', '/');
});

// 401 응답을 흉내내는 최소 AxiosError (shouldRedirectToLogin 판정용).
function err(status: number, url: string): AxiosError {
  return { isAxiosError: true, config: { url }, response: { status } } as unknown as AxiosError;
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

it('데이터 요청 401은 /login 리다이렉트 대상이다', () => {
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err(401, '/todos/1'))).toBe(true);
});

it('로그인 요청 401(잘못된 자격)은 리다이렉트하지 않는다', () => {
  // /login이 아닌 경로에서 판정해야 /iauth/* 제외 로직 자체가 검증된다
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err(401, '/iauth/login'))).toBe(false);
});

it('이미 /login 페이지면 401이어도 리다이렉트하지 않는다', () => {
  window.history.pushState({}, '', '/login');
  expect(shouldRedirectToLogin(err(401, '/todos/1'))).toBe(false);
});

it('401이 아니면 리다이렉트하지 않는다', () => {
  window.history.pushState({}, '', '/dashboard');
  expect(shouldRedirectToLogin(err(404, '/todos/1'))).toBe(false);
});
