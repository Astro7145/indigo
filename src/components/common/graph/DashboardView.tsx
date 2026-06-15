'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/src/utils/cn';
import { IcDashboard, IcMoon } from '@/src/components/common/icons';
import { GRAPH_BACKGROUND_VAR } from '@/src/components/common/graph/palette';
import GraphView from '@/src/components/common/graph/GraphView';

type View = 'dashboard' | 'graph';

interface DashboardViewProps {
  /** 헤더 좌측 타이틀 노드(예: "{name}님의 대시보드"). 대시보드 뷰에서만 노출. */
  title?: ReactNode;
  /** 서버에서 렌더된 기존 대시보드 섹션들. */
  dashboard: ReactNode;
}

const TAB_BASE = 'rounded p-1.5 transition-colors';

/**
 * 대시보드 ↔ 3D 그래프 인플레이스 토글.
 * 토글은 두 뷰에서 동일하게 콘텐츠 영역(main) 우상단에 절대배치돼 전환 시 위치가 바뀌지 않는다.
 * - 그래프 뷰: main 패딩을 음수 마진으로 상쇄해 콘텐츠 영역(사이드바 제외)을 캔버스로 꽉 채운다(라운드 없음).
 * 그래프 선택 시에만 GraphView(three.js 지연 로드)가 마운트된다.
 */
export default function DashboardView({ title, dashboard }: DashboardViewProps) {
  const [view, setView] = useState<View>('dashboard');

  // 그래프 뷰에서는 html 배경을 캔버스 색(딥 인디고)으로 — scrollbar-gutter(stable)로 예약된
  // 우측 거터 띠가 밝게 보이지 않게 한다. 떠날 때 원래 배경으로 복원.
  useEffect(() => {
    if (view !== 'graph') return;
    const el = document.documentElement;
    const prev = el.style.background;
    el.style.background = GRAPH_BACKGROUND_VAR;
    return () => {
      el.style.background = prev;
    };
  }, [view]);

  const toggle = (
    <div role="group" aria-label="화면 전환" className="inline-flex shrink-0 gap-1 rounded bg-slate-200 p-1 shadow-sm">
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

  return (
    // flow-root: 자식 상단 마진의 margin collapse를 막아 루트 상단(=토글 기준점)을 두 뷰에서 동일하게 고정
    <div className="relative flow-root w-full">
      {/* 토글 — 콘텐츠 폭(max-w-328) 우측 끝에 맞춰 두 뷰 공통 배치(기본 마진 위치). 빈 영역은 클릭 통과 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex w-full max-w-328 justify-end">
          <div className="pointer-events-auto">{toggle}</div>
        </div>
      </div>

      {view === 'dashboard' ? (
        <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:gap-8">
          {/* 타이틀 행 — 모바일에서도 토글이 콘텐츠를 가리지 않도록 높이를 예약 */}
          <div className="flex h-10 items-center">{title}</div>
          {dashboard}
        </div>
      ) : (
        <div
          className="-mx-4 -my-6 h-[calc(100dvh-56px)] overflow-hidden sm:-mx-6 sm:-my-12 sm:h-dvh xl:-mx-10 xl:-my-20"
          style={{ background: GRAPH_BACKGROUND_VAR }}
        >
          <GraphView />
        </div>
      )}
    </div>
  );
}
