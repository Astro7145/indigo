'use client';

import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import ProgressCard from '@/src/components/goal/ProgressCard';
import RecentTodos from '@/src/components/todo/RecentTodos';
import { useMe } from '@/src/hooks/user';

export default function DashboardPage() {
  const { data: me } = useMe();

  return (
    <>
      <div id="toast-portal" />
      <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:my-3 sm:gap-8">
        {/* 모바일(<sm)은 GNB가 타이틀을 담당 → sm+ 에서 노출. me.name 로드 전후 grid가 밀려나지 않도록 h-8(text-2xl 줄높이) 예약 */}
        <div className="hidden h-8 sm:block">
          <h1 className="pl-1 text-2xl font-semibold text-slate-800">
            <span data-testid="user-name" className="text-indigo-600">
              {me?.name}
            </span>
            님의 대시보드
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-3 xl:gap-8">
          <RecentTodos />
          <ProgressCard />
        </div>
        <GoalTodoSection />
      </div>
    </>
  );
}
