'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/src/utils/cn';
import { IcDashboard, IcMoon } from '@/src/components/common/icons';
import GraphView from '@/src/components/common/graph/GraphView';

type View = 'dashboard' | 'graph';

interface DashboardViewProps {
  /** 헤더 좌측 타이틀 노드(예: "{name}님의 대시보드"). 모바일에선 보통 숨김 처리된 노드. */
  title?: ReactNode;
  /** 서버에서 렌더된 기존 대시보드 섹션들. */
  dashboard: ReactNode;
}

const TAB_BASE = 'rounded-full p-1.5 transition-colors';

/**
 * 대시보드 ↔ 3D 그래프 인플레이스 토글. 타이틀과 같은 행 우측에 아이콘 토글을 둔다.
 * 토글은 두 화면 모두에서 항상 보이며, 그래프 선택 시에만 GraphView(three.js 지연 로드)가 마운트된다.
 */
export default function DashboardView({ title, dashboard }: DashboardViewProps) {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:my-3 sm:gap-8">
      <div className="flex items-center">
        {title}
        <div
          role="group"
          aria-label="화면 전환"
          className="ml-auto inline-flex shrink-0 gap-1 rounded-full bg-slate-200 p-1"
        >
          <button
            type="button"
            aria-label="대시보드"
            aria-pressed={view === 'dashboard'}
            onClick={() => setView('dashboard')}
            className={cn(TAB_BASE, view === 'dashboard' && 'bg-white shadow-sm')}
          >
            <IcDashboard aria-hidden state={view === 'dashboard' ? 'active' : 'default'} className="size-5" />
          </button>
          <button
            type="button"
            aria-label="우주"
            aria-pressed={view === 'graph'}
            onClick={() => setView('graph')}
            className={cn(TAB_BASE, view === 'graph' && 'bg-white shadow-sm')}
          >
            <IcMoon aria-hidden className={cn('size-5', view === 'graph' ? 'text-indigo-600' : 'text-slate-300')} />
          </button>
        </div>
      </div>

      {view === 'dashboard' ? dashboard : <GraphView />}
    </div>
  );
}
