// 수동 목(ko 메시지 조회) 대신 "네임스페이스.키"(보간 값은 뒤에 이어붙임)를 돌려주는 t로 오버라이드한다.
// 결과가 번역 키와 일치하면 타이틀이 하드코딩이 아니라 카탈로그를 경유한다는 뜻이다.
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, unknown>) => {
    const id = namespace ? `${namespace}.${key}` : key;
    return values ? `${id} ${Object.values(values).join(' ')}` : id;
  },
  useLocale: () => 'ko',
}));

let mockPathname = '/';
let mockTodoCount: number | undefined;
let mockFavoriteCount: number | undefined;
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));
jest.mock('@/src/hooks/user', () => ({ useMe: () => ({ data: { name: '체다치즈' } }) }));
jest.mock('@/src/hooks/todo', () => ({ useTodoCount: () => ({ data: mockTodoCount }) }));
jest.mock('@/src/hooks/favorite', () => ({ useFavoriteCount: () => ({ data: mockFavoriteCount }) }));

import { renderHook } from '@testing-library/react';

import { usePageTitle } from '@/src/hooks/usePageTitle';

function titleFor(pathname: string): string {
  mockPathname = pathname;
  return renderHook(() => usePageTitle()).result.current;
}

beforeEach(() => {
  mockTodoCount = undefined;
  mockFavoriteCount = undefined;
});

describe('usePageTitle', () => {
  it('/ 경로면 이름 뒤에 dashboard.title을 붙인다', () => {
    expect(titleFor('/')).toBe('체다치즈dashboard.title');
  });

  it('/todos 경로면 todos.title에 카운트를 붙인다', () => {
    mockTodoCount = 5;
    expect(titleFor('/todos')).toBe('todos.title 5');
  });

  it('/todos 카운트 로드 전이면 todos.title만 돌려준다', () => {
    expect(titleFor('/todos')).toBe('todos.title');
  });

  it('/favorites 경로면 favorites.title에 카운트를 붙인다', () => {
    mockFavoriteCount = 3;
    expect(titleFor('/favorites')).toBe('favorites.title 3');
  });

  it('/goals/:id 경로면 이름이 보간된 goals.title을 돌려준다', () => {
    expect(titleFor('/goals/1')).toBe('goals.title 체다치즈');
  });

  it('/calendar 경로면 이름이 보간된 calendar.title을 돌려준다', () => {
    expect(titleFor('/calendar')).toBe('calendar.title 체다치즈');
  });

  it('타 담당 경로의 타이틀은 기존 문구를 유지한다', () => {
    expect(titleFor('/posts')).toBe('소통 게시판');
    expect(titleFor('/me')).toBe('내 정보 관리');
  });
});
