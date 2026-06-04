import { Suspense } from 'react';

import PostList from '@/src/components/post/PostList';

// 라우팅 전용 셸. useSearchParams를 호출하는 본문(PostList)을 Suspense로 감싸
// prerender 시 CSR bailout이 셸까지 번지지 않게 한다. 헤더는 검색 파라미터와 무관하므로
// 서버 컴포넌트에 남겨 초기 HTML에 즉시 포함시킨다.
export default function PostsPage() {
  return (
    <div>
      {/* 모바일은 (main) layout의 Topbar가 페이지명을 표시하므로 중복을 피해 sm 이상에서만 노출 */}
      <header className="mx-auto mb-6 hidden max-w-[1200px] sm:block">
        <h1 className="text-xl font-bold text-slate-900 xl:text-2xl">소통 게시판</h1>
      </header>
      <Suspense fallback={<div />}>
        <PostList />
      </Suspense>
    </div>
  );
}
