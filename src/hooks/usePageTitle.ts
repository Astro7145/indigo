'use client';

import { usePathname } from 'next/navigation';
import { useMe } from '@/src/hooks/user';
import { useTodoList } from '@/src/hooks/todo';
import { useFavoriteTodoList } from '@/src/hooks/favorite';

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

  const { data: todoData } = useTodoList({}, route === 'todos');
  const { data: favoriteData } = useFavoriteTodoList({}, route === 'favorites');

  switch (route) {
    case 'dashboard':
      return `${name}님의 대시보드`;
    case 'todos':
      return todoData ? `모든 할일 ${todoData.totalCount}` : '모든 할일';
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
      return favoriteData ? `찜한 할일 ${favoriteData.totalCount}` : '찜한 할일';
    case 'calendar':
      return `${name}님의 캘린더`;
    case 'me':
      return '내 정보 관리';
    default:
      return '';
  }
}
