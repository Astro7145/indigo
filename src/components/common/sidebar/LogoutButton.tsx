'use client';

import { useRouter } from 'next/navigation';
import { useLogout } from '@/src/hooks/auth';
import SidebarRow from './SidebarRow';

/**
 * 사이드바/모바일 GNB 공용 로그아웃 행.
 *
 * onSettled에서 /login으로 보낸다 — 토큰 만료 등으로 서버 호출이 실패해도
 * 클라이언트 세션은 종료해야 하기 때문(useLogout 훅의 onSettled가 qc.clear() 담당).
 * 쿠키는 /api/auth/logout 응답에서 삭제되므로 이후 proxy도 /login을 통과시킨다.
 */
export default function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  const { mutate } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    mutate(undefined, { onSettled: () => router.replace('/login') });
  };

  return <SidebarRow type="logout" text="로그아웃" collapsed={collapsed} onClick={handleLogout} />;
}
