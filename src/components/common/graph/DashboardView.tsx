'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/src/utils/cn';
import { IcDashboard, IcMoon } from '@/src/components/common/icons';
import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import GraphView from '@/src/components/common/graph/GraphView';

type View = 'dashboard' | 'graph';

interface DashboardViewProps {
  /** 헤더 좌측 타이틀 노드(예: "{name}님의 대시보드"). 대시보드 뷰에서만 노출. */
  title?: ReactNode;
  /** 서버에서 렌더된 기존 대시보드 섹션들. */
  dashboard: ReactNode;
}

const TAB_BASE = 'rounded-full p-1.5 transition-colors';

/**
 * 대시보드 ↔ 3D 그래프 인플레이스 토글.
 * - 대시보드 뷰: 타이틀과 같은 행 우측에 아이콘 토글.
 * - 그래프 뷰: main 패딩을 상쇄해 콘텐츠 영역(사이드바 제외)을 캔버스로 꽉 채우고, 토글만 위에 띄운다.
 * 그래프 선택 시에만 GraphView(three.js 지연 로드)가 마운트된다.
 */
export default function DashboardView({ title, dashboard }: DashboardViewProps) {
  const [view, setView] = useState<View>('dashboard');

  const toggle = (
    <div
      role="group"
      aria-label="화면 전환"
      className="inline-flex shrink-0 gap-1 rounded-full bg-slate-200 p-1 shadow-sm"
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
  );

  // 그래프 뷰 — main 패딩을 음수 마진으로 상쇄해 콘텐츠 영역을 꽉 채운다(라운드 없음, 가로 스크롤 차단).
  // 높이: 모바일/태블릿(<md)은 56px 탑바 스페이서만큼 빼고, md+는 뷰포트 전체.
  if (view === 'graph') {
    return (
      <div
        className="relative -mx-4 -my-6 h-[calc(100dvh-56px)] overflow-hidden sm:-mx-6 sm:-my-12 md:h-dvh xl:-mx-10 xl:-my-20"
        style={{ background: GRAPH_COLORS.background }}
      >
        <GraphView />
        <div className="absolute top-4 right-4 z-10">{toggle}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:my-3 sm:gap-8">
      <div className="flex items-center">
        {title}
        <span className="ml-auto">{toggle}</span>
      </div>
      {dashboard}
    </div>
  );
}
