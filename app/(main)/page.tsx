'use client';

import { useRouter } from 'next/navigation';

import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import ProgressCard from '@/src/components/goal/ProgressCard';
import RecentTodos from '@/src/components/todo/RecentTodos';
import { useMe } from '@/src/hooks/user';

export default function DashboardPage() {
  const router = useRouter();
  const { data: me } = useMe();

  return (
    <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-8">
      {/* 모바일은 GNB가 타이틀을 담당 → md+ 에서만 노출 */}
      {me?.name && (
        <h1 className="hidden text-2xl font-semibold tracking-[-0.03em] text-slate-800 md:block">
          {me.name}님의 대시보드
        </h1>
      )}
      <div className="flex flex-col gap-8 lg:flex-row">
        <RecentTodos onSeeAll={() => router.push('/todos')} />
        <ProgressCard />
      </div>
      <GoalTodoSection />
    </div>
  );
}
