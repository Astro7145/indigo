import type { AxiosAdapter } from 'axios';
import instance from '@/src/api/axiosInstance';

afterEach(() => {
  // restore default adapter so per-test overrides don't leak
  delete (instance.defaults as { adapter?: unknown }).adapter;
});

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
