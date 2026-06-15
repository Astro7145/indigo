'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const tCalendar = useTranslations('calendar');
  const tDashboard = useTranslations('dashboard');
  const tFavorites = useTranslations('favorites');
  const tGoals = useTranslations('goals');
  const tMe = useTranslations('me');
  const tTodos = useTranslations('todos');

  const { data: user } = useMe();
  const name = user?.name ?? '';

  const { data: todoCount } = useTodoCount(route === 'todos');
  const { data: favoriteCount } = useFavoriteCount(route === 'favorites');

  switch (route) {
    case 'dashboard':
      // DashboardTitle과 동일하게 이름 + 접미사(title) 조합
      return `${name}${tDashboard('title')}`;
    case 'todos':
      return todoCount != null ? `${tTodos('title')} ${todoCount}` : tTodos('title');
    case 'notes-write':
      return '노트 작성하기';
    case 'notes-edit':
      return '노트 수정하기';
    case 'goal':
      return tGoals('title', { name });
    case 'goal-notes':
      return '노트 모아보기';
    case 'posts-write':
      return '게시물 작성하기';
    case 'posts-edit':
      return '게시물 수정하기';
    case 'posts':
      return '소통 게시판';
    case 'favorites':
      return favoriteCount != null ? `${tFavorites('title')} ${favoriteCount}` : tFavorites('title');
    case 'calendar':
      return tCalendar('title', { name });
    case 'me':
      return tMe('title');
    default:
      return '';
  }
}
