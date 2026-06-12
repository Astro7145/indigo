// 서버 page(파싱)와 클라 FavoritesView가 공유 — 'use client' 모듈에 두면 서버에서 호출할 수 없다.
export type FavoritesTab = 'all' | 'todo' | 'done';

/** ?tab= 파싱 — 잘못된 값은 all */
export function parseFavoritesTab(raw: string | undefined): FavoritesTab {
  return raw === 'todo' || raw === 'done' ? raw : 'all';
}
