'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { parseFavoritesTab } from '@/src/components/favorite/favoritesTab';
import { parseTodosTab, todosListParams } from '@/src/components/todo/todosTab';
import { useMe } from '@/src/hooks/user';
import { useTodoCount } from '@/src/hooks/todo';
import { useFavoriteCount } from '@/src/hooks/favorite';

type RouteKey =
  | 'dashboard'
  | 'todos'
  | 'notes-write'
  | 'notes-edit'
  | 'goal'
  | 'goal-notes'
  | 'posts'
  | 'posts-write'
  | 'posts-edit'
  | 'favorites'
  | 'calendar'
  | 'me';

function matchRoute(pathname: string): RouteKey | null {
  if (pathname === '/') return 'dashboard';
  if (pathname === '/todos') return 'todos';
  if (/^\/todos\/[^/]+\/notes\/write$/.test(pathname)) return 'notes-write';
  if (/^\/todos\/[^/]+\/notes\/edit$/.test(pathname)) return 'notes-edit';
  if (/^\/goals\/[^/]+\/notes$/.test(pathname)) return 'goal-notes';
  if (/^\/goals\/[^/]+$/.test(pathname)) return 'goal';
  if (pathname === '/posts/write') return 'posts-write';
  if (/^\/posts\/[^/]+\/edit$/.test(pathname)) return 'posts-edit';
  if (pathname === '/posts') return 'posts';
  // 게시물 상세(/posts/:id)도 메뉴 컨텍스트 유지를 위해 "소통 게시판"으로 표시
  if (/^\/posts\/[^/]+$/.test(pathname)) return 'posts';
  if (pathname === '/favorites') return 'favorites';
  if (pathname === '/calendar') return 'calendar';
  if (pathname === '/me') return 'me';
  return null;
}

export function usePageTitle(): string {
  const pathname = usePathname();
  const route = matchRoute(pathname);

  const { data: user } = useMe();
  const name = user?.name ?? '';

  // 카운트는 데스크탑/태블릿 헤더와 동일하게 현재 탭(?tab=) 기준 —
  // 페이지의 탭 셸로우 동기화(replaceState)를 Next가 useSearchParams에 반영해 탭 전환 시 함께 갱신된다.
  const tabParam = useSearchParams().get('tab') ?? undefined;
  const { data: todoCount } = useTodoCount(route === 'todos', { done: todosListParams(parseTodosTab(tabParam)).done });
  const { data: favoriteCount } = useFavoriteCount(route === 'favorites', parseFavoritesTab(tabParam));

  switch (route) {
    case 'dashboard':
      return `${name}님의 대시보드`;
    case 'todos':
      return todoCount != null ? `모든 할일 ${todoCount}` : '모든 할일';
    case 'notes-write':
      return '노트 작성하기';
    case 'notes-edit':
      return '노트 수정하기';
    case 'goal':
      return `${name}님의 목표`;
    case 'goal-notes':
      return '노트 모아보기';
    case 'posts-write':
      return '게시물 작성하기';
    case 'posts-edit':
      return '게시물 수정하기';
    case 'posts':
      return '소통 게시판';
    case 'favorites':
      return favoriteCount != null ? `찜한 할일 ${favoriteCount}` : '찜한 할일';
    case 'calendar':
      return `${name}님의 캘린더`;
    case 'me':
      return '내 정보 관리';
    default:
      return '';
  }
}
