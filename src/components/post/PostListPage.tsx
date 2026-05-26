'use client';

import PostListEmpty from '@/src/components/post/PostListEmpty';
import PostListItem from '@/src/components/post/PostListItem';
import PostSearchBar from '@/src/components/post/PostSearchBar';
import type { Post } from '@/src/types/post';

const BEST_POSTS: Post[] = [
  {
    id: 101,
    teamId: '1',
    userId: 1,
    title: '집중 잘 하는 환경 세팅 꿀팁 공유!',
    content: '책상 위 정리부터 조명까지, 집중력을 끌어올리는 작은 변화들.',
    image: null,
    viewCount: 353,
    createdAt: '2026-05-26T10:00:00Z',
    updatedAt: '2026-05-26T10:00:00Z',
    writer: { id: 1, name: '체다치즈', image: null },
    commentCount: 28,
  },
  {
    id: 102,
    teamId: '1',
    userId: 1,
    title: '하루 루틴 기록, 커피 한 잔과 함께',
    content: '매일 같은 시간에 커피를 내리면서 그날의 계획을 정리합니다.',
    image: null,
    viewCount: 297,
    createdAt: '2026-05-25T08:00:00Z',
    updatedAt: '2026-05-25T08:00:00Z',
    writer: { id: 1, name: '체다치즈', image: null },
    commentCount: 19,
  },
  {
    id: 103,
    teamId: '1',
    userId: 1,
    title: '작은 메모 하나가 큰 변화를 만든다',
    content: '하루의 핵심 메모 한 줄이 일주일을 바꾸는 경험.',
    image: null,
    viewCount: 155,
    createdAt: '2026-05-24T12:00:00Z',
    updatedAt: '2026-05-24T12:00:00Z',
    writer: { id: 1, name: '체다치즈', image: null },
    commentCount: 16,
  },
];

const POSTS: Post[] = [
  {
    id: 1,
    teamId: '1',
    userId: 2,
    title: '디지털 정리의 날: 불필요한 할 일 정리하기',
    content:
      '오래된 할 일 정리하면서 머릿속도 가벼워졌어요. 완료된 항목 지우고 시급도에 따라 분류하니 오늘 무엇이 진짜 중요한지 한눈에 보이네요.',
    image: null,
    viewCount: 6,
    createdAt: '2026-05-26T09:00:00Z',
    updatedAt: '2026-05-26T09:00:00Z',
    writer: { id: 2, name: '체다치즈', image: null },
    commentCount: 0,
  },
  {
    id: 2,
    teamId: '1',
    userId: 3,
    title: '다들 주간 회고해요? "이번 주 나는 얼마나 성장했을까"',
    content: '이번 주에 한 일을 돌아보며 잘한 점, 부족했던 점을 적어보고 있어요. 어떻게 한 주를 마무리하시나요?',
    image: null,
    viewCount: 12,
    createdAt: '2026-05-25T18:00:00Z',
    updatedAt: '2026-05-25T18:00:00Z',
    writer: { id: 3, name: '체다치즈', image: null },
    commentCount: 28,
  },
  {
    id: 3,
    teamId: '1',
    userId: 4,
    title: '데스크테어 공유합니다',
    content:
      '바쁜 일정 속에서도 책상 위 공간이 정돈되어 있으면 일 능률이 다르게 느껴져요. 초록색 식물 하나면 안정감이 확실히 달라집니다.',
    image: null,
    viewCount: 24,
    createdAt: '2026-05-25T11:00:00Z',
    updatedAt: '2026-05-25T11:00:00Z',
    writer: { id: 4, name: '체다치즈', image: null },
    commentCount: 5,
  },
  {
    id: 4,
    teamId: '1',
    userId: 5,
    title: '독서로 하루 시작하기',
    content: '아침 30분, 종이책을 읽는 습관이 한 주의 컨디션을 결정합니다. 어떤 책을 읽으시나요?',
    image: null,
    viewCount: 41,
    createdAt: '2026-05-24T07:00:00Z',
    updatedAt: '2026-05-24T07:00:00Z',
    writer: { id: 5, name: '체다치즈', image: null },
    commentCount: 8,
  },
  {
    id: 5,
    teamId: '1',
    userId: 6,
    title: '잠이 안 올 때 뭐하세요?',
    content: '머릿속이 복잡해서 잠 못 들 때 다들 어떻게 하시나요. 좋은 루틴 있으면 공유 부탁드려요.',
    image: null,
    viewCount: 18,
    createdAt: '2026-05-23T23:00:00Z',
    updatedAt: '2026-05-23T23:00:00Z',
    writer: { id: 6, name: '체다치즈', image: null },
    commentCount: 12,
  },
];

export default function PostListPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900">소통 게시판</h1>
      </header>

      {/* 베스트 게시글 영역 — 게시물이 있을 때만 노출. Task 6/15에서 PostCard로 교체 */}
      {POSTS.length > 0 && (
        <section className="mx-auto mb-6 max-w-5xl">
          <div className="grid grid-cols-3 gap-6">
            {BEST_POSTS.map((p) => (
              <div key={p.id} className="h-[250px] w-full rounded bg-slate-200 p-4 text-sm text-slate-600">
                {p.title}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 검색·정렬 */}
      <section className="mx-auto mb-4 max-w-5xl">
        <PostSearchBar />
      </section>

      {/* 목록 또는 빈 상태 */}
      <section className="mx-auto max-w-5xl">
        {POSTS.length === 0 ? (
          <PostListEmpty />
        ) : (
          <>
            <ul>
              {POSTS.map((p) => (
                <li key={p.id}>
                  <PostListItem post={p} />
                </li>
              ))}
            </ul>
            {/* 무한 스크롤 sentinel — #37에서 IntersectionObserver hook 연결 */}
            <div aria-hidden className="h-4 w-full" />
          </>
        )}
      </section>

      {/* FAB — 작성 페이지 라우팅은 에디터 작업 시점에 연결 */}
      <button
        type="button"
        className="fixed right-8 bottom-8 inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-600"
      >
        <span aria-hidden>+</span>
        <span>게시물 작성하기</span>
      </button>
    </div>
  );
}
