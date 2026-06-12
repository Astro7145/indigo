// 수동 목(ko 메시지 조회) 대신 "네임스페이스.키"를 그대로 돌려주는 t로 오버라이드한다.
// 결과가 번역 키와 일치하면 타이틀이 하드코딩이 아니라 카탈로그를 경유한다는 뜻이다.
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => (namespace ? `${namespace}.${key}` : key),
  useLocale: () => 'ko',
}));

let mockPathname = '/';
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));
jest.mock('@/src/hooks/user', () => ({ useMe: () => ({ data: { name: '체다치즈' } }) }));
jest.mock('@/src/hooks/todo', () => ({ useTodoCount: () => ({ data: undefined }) }));
jest.mock('@/src/hooks/favorite', () => ({ useFavoriteCount: () => ({ data: undefined }) }));

import { renderHook } from '@testing-library/react';

import { usePageTitle } from '@/src/hooks/usePageTitle';

describe('usePageTitle', () => {
  it('/me 경로면 me 카탈로그의 title 키로 타이틀을 만든다', () => {
    mockPathname = '/me';
    const { result } = renderHook(() => usePageTitle());
    expect(result.current).toBe('me.title');
  });

  it('다른 경로의 타이틀은 기존 문구를 유지한다', () => {
    mockPathname = '/todos';
    const { result } = renderHook(() => usePageTitle());
    expect(result.current).toBe('모든 할일');
  });
});
