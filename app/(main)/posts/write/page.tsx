import { Suspense } from 'react';

import PostForm from '@/src/components/post/PostForm';

// PostForm이 useSearchParams를 호출하므로 Suspense로 감싸 CSR bailout이 셸까지 번지지 않게 한다
export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <PostForm mode="create" />
    </Suspense>
  );
}
