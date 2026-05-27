import type { AxiosAdapter } from 'axios';
import instance from '@/src/api/axiosInstance';
import { redirectToLogin } from '@/src/api/redirectToLogin';

// jsdom의 location.replace는 잠겨 있어 직접 못 막는다 → 네비게이션 경계 모듈을 모킹한다.
jest.mock('@/src/api/redirectToLogin');
const redirectMock = redirectToLogin as jest.Mock;

afterEach(() => {
  // restore default adapter so per-test overrides don't leak
  delete (instance.defaults as { adapter?: unknown }).adapter;
  redirectMock.mockClear();
  window.history.pushState({}, '', '/');
});

// 주어진 상태코드로 거절하는 어댑터를 설치한다.
function rejectWith(status: number) {
  instance.defaults.adapter = (async (config) =>
    Promise.reject({
      isAxiosError: true,
      message: 'Request failed',
      config,
      response: { data: {}, status, statusText: '', headers: {}, config },
    })) as AxiosAdapter;
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

it('데이터 요청이 401이면 /login으로 보낸다', async () => {
  window.history.pushState({}, '', '/dashboard');
  rejectWith(401);
  await instance.get('/todos/1').catch(() => undefined);
  expect(redirectMock).toHaveBeenCalledTimes(1);
});

it('로그인 요청 401(잘못된 자격)은 redirect 하지 않는다', async () => {
  window.history.pushState({}, '', '/login');
  rejectWith(401);
  await instance.post('/iauth/login', {}).catch(() => undefined);
  expect(redirectMock).not.toHaveBeenCalled();
});

it('이미 /login 페이지면 401이어도 redirect 하지 않는다', async () => {
  window.history.pushState({}, '', '/login');
  rejectWith(401);
  await instance.get('/todos/1').catch(() => undefined);
  expect(redirectMock).not.toHaveBeenCalled();
});

it('401 redirect 시에도 ApiError로 reject 한다', async () => {
  window.history.pushState({}, '', '/dashboard');
  rejectWith(401);
  const err = await instance.get('/todos/1').catch((e) => e);
  expect(err.name).toBe('ApiError');
  expect(err.status).toBe(401);
});
