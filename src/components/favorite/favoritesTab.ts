import type { FavoriteTodo } from '@/src/types/favorite';

// 서버 page(파싱)와 클라 FavoritesView가 공유 — 'use client' 모듈에 두면 서버에서 호출할 수 없다.
export type FavoritesTab = 'all' | 'todo' | 'done';

/** ?tab= 파싱 — 잘못된 값은 all */
export function parseFavoritesTab(raw: string | undefined): FavoritesTab {
  return raw === 'todo' || raw === 'done' ? raw : 'all';
}

/** 클라이언트 필터 (favorites API가 done/goalId 미지원). FavoritesView의 카운트·목록과 GNB 카운트가 공유한다. */
export function filterFavorites(favorites: FavoriteTodo[], tab: FavoritesTab, goalId: number | null): FavoriteTodo[] {
  return favorites.filter((f) => {
    if (tab === 'todo' && f.todo.done) return false;
    if (tab === 'done' && !f.todo.done) return false;
    if (goalId !== null && f.todo.goal?.id !== goalId) return false;
    return true;
  });
}
