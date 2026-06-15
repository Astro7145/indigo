'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseFavoritesTab, parseGoalId } from '@/src/components/favorite/favoritesTab';
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
  const t = useTranslations('common');

  const { data: user } = useMe();
  const name = user?.name ?? '';

  // 카운트는 데스크탑/태블릿 헤더와 동일하게 현재 필터(?tab=·?goalId=) 기준 —
  // 페이지의 셸로우 동기화(replaceState)를 Next가 useSearchParams에 반영해 필터 전환 시 함께 갱신된다.
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') ?? undefined;
  const { data: todoCount } = useTodoCount(route === 'todos', { done: todosListParams(parseTodosTab(tabParam)).done });
  const { data: favoriteCount } = useFavoriteCount(
    route === 'favorites',
    parseFavoritesTab(tabParam),
    parseGoalId(searchParams.get('goalId')),
  );

  switch (route) {
    case 'dashboard':
      return t('pageTitle.dashboard', { name });
    case 'todos':
      return todoCount != null ? t('pageTitle.todosCount', { count: todoCount }) : t('pageTitle.todos');
    case 'notes-write':
      return t('pageTitle.notesWrite');
    case 'notes-edit':
      return t('pageTitle.notesEdit');
    case 'goal':
      return t('pageTitle.goal', { name });
    case 'goal-notes':
      return t('pageTitle.goalNotes');
    case 'posts-write':
      return t('pageTitle.postsWrite');
    case 'posts-edit':
      return t('pageTitle.postsEdit');
    case 'posts':
      return t('pageTitle.posts');
    case 'favorites':
      return favoriteCount != null ? t('pageTitle.favoritesCount', { count: favoriteCount }) : t('pageTitle.favorites');
    case 'calendar':
      return t('pageTitle.calendar', { name });
    case 'me':
      return t('pageTitle.me');
    default:
      return '';
  }
}
