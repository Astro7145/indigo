/** @jest-environment node */
// 서버(노드) 환경에서 클라 fetcher가 실행되면 prefetch 커버 누락 invariant가 발화해야 한다 (#136).
import instance from '@/src/api/client-fetcher';

it('서버(window 없음)에서 요청하면 prefetch 커버 누락 invariant 에러를 던진다', async () => {
  await expect(instance.get('/todos')).rejects.toThrow(/SSR.*prefetch/i);
});
