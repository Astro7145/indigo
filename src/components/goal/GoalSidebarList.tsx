'use client';

import { usePathname, useRouter } from 'next/navigation';

import SidebarGoalRow from '@/src/components/common/sidebar/SidebarGoalRow';
import { useCreateGoal, useInfiniteGoalList } from '@/src/hooks/goal';
import { useToast } from '@/src/hooks/useToast';

export interface GoalSidebarListProps {
  collapsed?: boolean;
  onExpand?: () => void;
  /** 항목 선택 후 셸이 오버레이/메뉴를 닫을 때 호출 */
  onSelected?: () => void;
}

/**
 * 사이드바 "목표" 섹션의 데이터 컨테이너 — 목록(무한스크롤)·생성·선택을 실제 API에 연동하고
 * 공용 프레젠테이션 컴포넌트 `SidebarGoalRow`에 주입한다. 데스크톱(Sidebar)·모바일(Topbar) 공유.
 */
export default function GoalSidebarList({ collapsed, onExpand, onSelected }: GoalSidebarListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteGoalList();
  const create = useCreateGoal();

  const goals = data?.pages.flatMap((p) => p.goals) ?? [];

  // /goals/[id] 경로에서 현재 목표 id 도출(목록 항목 강조용)
  const match = pathname?.match(/^\/goals\/(\d+)/);
  const currentGoalId = match ? Number(match[1]) : undefined;

  const handleCreate = (title: string) => {
    create.mutate({ title }, { onError: () => showToast('목표 생성에 실패했어요') });
  };

  const handleSelect = (id: number) => {
    router.push(`/goals/${id}`);
    onSelected?.();
  };

  return (
    <SidebarGoalRow
      goals={goals}
      collapsed={collapsed}
      current={currentGoalId != null}
      currentGoalId={currentGoalId}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      onLoadMore={() => {
        if (!isFetchingNextPage) fetchNextPage();
      }}
      onCreateGoal={handleCreate}
      onSelectGoal={handleSelect}
      onExpand={onExpand}
    />
  );
}
