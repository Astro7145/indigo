/**
 * @jest-environment node
 *
 * client-fetcher는 브라우저 전용이다. node 환경(typeof window === 'undefined')은 SSR 중
 * prefetch 누락/실패로 client-fetcher가 Node에서 실행되는 경로를 실제로 재현한다.
 */
import instance from '@/src/api/client-fetcher';

it('서버(node)에서 호출되면 명시적 에러로 거부한다', async () => {
  // 상대 baseURL의 우연한 "Invalid URL"이 아니라, 의도된 명시적 에러로 reject돼야 한다.
  // (reject 자체는 동일하게 Suspense 경계를 클라 폴백시키므로 동작은 유지된다.)
  await expect(instance.get('todos')).rejects.toThrow(/must not be used on the server/i);
});
