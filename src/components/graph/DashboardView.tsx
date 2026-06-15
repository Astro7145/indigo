'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/src/utils/cn';
import GraphView from '@/src/components/graph/GraphView';

type View = 'dashboard' | 'graph';

interface DashboardViewProps {
  /** 서버에서 렌더된 기존 대시보드 섹션들. */
  dashboard: ReactNode;
}

const TAB_BASE = 'rounded-full px-4 py-1.5 text-sm font-medium transition-colors';

/** 대시보드 ↔ 3D 그래프 인플레이스 토글. 그래프 선택 시에만 GraphView(=three.js 지연 로드)가 마운트된다. */
export default function DashboardView({ dashboard }: DashboardViewProps) {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="mx-auto flex w-full max-w-328 flex-col gap-4">
      <div className="flex justify-end">
        <div role="group" aria-label="화면 전환" className="inline-flex gap-1 rounded-full bg-slate-200 p-1">
          <button
            type="button"
            aria-pressed={view === 'dashboard'}
            onClick={() => setView('dashboard')}
            className={cn(TAB_BASE, view === 'dashboard' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-500')}
          >
            대시보드
          </button>
          <button
            type="button"
            aria-pressed={view === 'graph'}
            onClick={() => setView('graph')}
            className={cn(TAB_BASE, view === 'graph' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-500')}
          >
            우주
          </button>
        </div>
      </div>

      {view === 'dashboard' ? dashboard : <GraphView />}
    </div>
  );
}
