const store = { get: jest.fn(), set: jest.fn() };
jest.mock('next/headers', () => ({ cookies: async () => store }));

import { getUserLocale, setUserLocale } from './locale';

afterEach(() => {
  jest.clearAllMocks();
});

describe('setUserLocale', () => {
  it('선택 언어를 1년 만료의 영속 쿠키로 저장한다', async () => {
    await setUserLocale('en');

    expect(store.set).toHaveBeenCalledWith(
      'NEXT_LOCALE',
      'en',
      expect.objectContaining({ maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' }),
    );
  });
});

describe('getUserLocale', () => {
  it('저장된 유효한 locale을 그대로 반환한다', async () => {
    store.get.mockReturnValue({ value: 'jp' });

    await expect(getUserLocale()).resolves.toBe('jp');
  });

  it('쿠키가 없으면 기본 locale(ko)을 반환한다', async () => {
    store.get.mockReturnValue(undefined);

    await expect(getUserLocale()).resolves.toBe('ko');
  });

  it('유효하지 않은 값이면 기본 locale(ko)을 반환한다', async () => {
    store.get.mockReturnValue({ value: 'fr' });

    await expect(getUserLocale()).resolves.toBe('ko');
  });
});
