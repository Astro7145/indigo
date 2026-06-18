'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/src/utils/cn';
import { IcDashboard, IcGraph } from '@/src/components/common/icons';
import { GRAPH_BACKGROUND_VAR } from '@/src/components/common/graph/palette';
import GraphView from '@/src/components/common/graph/GraphView';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import { useTopbarSlotStore } from '@/src/stores/topbarSlot';

type View = 'dashboard' | 'graph';

interface DashboardViewProps {
  /** 헤더 좌측 타이틀 노드(예: "{name}님의 대시보드"). 대시보드 뷰에서만 노출. */
  title?: ReactNode;
  /** 서버에서 렌더된 기존 대시보드 섹션들. */
  dashboard: ReactNode;
}

const TAB_BASE = 'cursor-pointer rounded transition-colors';

/**
 * 대시보드 ↔ 우주(그래프) 세그먼트 토글.
 * - variant 'light'(기본): 밝은 콘텐츠 배경용(데스크탑 우상단) — 회색 트랙.
 * - variant 'topbar': 다크 모바일 Topbar(#1A1B2E)와 조화되도록 반투명 트랙 + 밝은 비활성 아이콘.
 * 활성 버튼은 두 변형 모두 흰 pill + indigo 아이콘으로 선택 상태를 또렷이 표시한다.
 */
function ViewToggle({
  view,
  onChange,
  variant = 'light',
}: {
  view: View;
  onChange: (next: View) => void;
  variant?: 'light' | 'topbar';
}) {
  const isTopbar = variant === 'topbar';
  const track = isTopbar ? 'bg-white/10' : 'bg-slate-200';
  const hover = isTopbar ? 'hover:bg-white/10' : 'hover:bg-white/60';
  const inactiveIcon = isTopbar ? 'text-white/80' : 'text-slate-500';
  // 활성 셀: 라이트는 순백, 다크 Topbar는 살짝 톤다운해 다크 바와 덜 튀게
  const activeCell = isTopbar ? 'bg-white/90 shadow-sm' : 'bg-white shadow-sm';
  // 모바일 Topbar 바(56px)에 맞게 토픽바 변형은 패딩을 줄여 컴팩트하게(제목·햄버거와 높이 비율 맞춤).
  const containerPad = isTopbar ? 'p-0.5' : 'p-1';
  const buttonPad = isTopbar ? 'p-0.5' : 'p-1.5';
  const iconSize = isTopbar ? 'size-4' : 'size-5';

  return (
    <div
      role="group"
      aria-label="화면 전환"
      className={cn('flex w-fit shrink-0 gap-1 rounded shadow-sm', track, containerPad)}
    >
      <button
        type="button"
        aria-label="대시보드"
        aria-pressed={view === 'dashboard'}
        onClick={() => onChange('dashboard')}
        className={cn(TAB_BASE, buttonPad, view === 'dashboard' ? activeCell : hover)}
      >
        <IcDashboard
          aria-hidden
          state={view === 'dashboard' ? 'active' : 'default'}
          className={cn(iconSize, view !== 'dashboard' && inactiveIcon)}
        />
      </button>
      <button
        type="button"
        aria-label="우주"
        aria-pressed={view === 'graph'}
        onClick={() => onChange('graph')}
        className={cn(TAB_BASE, buttonPad, view === 'graph' ? activeCell : hover)}
      >
        <IcGraph aria-hidden className={cn(iconSize, view === 'graph' ? 'text-indigo-600' : inactiveIcon)} />
      </button>
    </div>
  );
}

/**
 * 대시보드 ↔ 3D 그래프 인플레이스 토글.
 * - 데스크탑/태블릿(sm↑): 토글을 콘텐츠 영역(main) 우상단에 절대배치(전환 시 위치 불변).
 * - 모바일(~639px): 토글을 모바일 Topbar 우측 슬롯에 주입한다(기본 알림종을 대체; 종은 Topbar 펼침 메뉴에 유지). 콘텐츠 절대배치 토글은 숨김.
 * 그래프 뷰: main 패딩을 음수 마진으로 상쇄해 콘텐츠 영역을 캔버스로 꽉 채운다. 그래프 선택 시에만 GraphView(three.js 지연 로드)가 마운트.
 */
export default function DashboardView({ title, dashboard }: DashboardViewProps) {
  const [view, setView] = useState<View>('dashboard');
  const isMobile = useIsMobile();
  const setRightSlot = useTopbarSlotStore((s) => s.setRightSlot);
  const clearRightSlot = useTopbarSlotStore((s) => s.clearRightSlot);

  // 그래프 뷰에서는 html·body 배경을 캔버스 색으로 — 우측 거터/패딩 띠가 밝게 보이지 않게 한다.
  // html: scrollbar-gutter(stable)로 예약된 거터 띠(비락 시). body: 모달 락 시 시프트 보정용
  // body padding-right 영역이 body 배경을 드러내므로 그곳도 캔버스 색이어야 우주와 이어진다.
  // 떠날 때 원래 배경으로 복원.
  useEffect(() => {
    if (view !== 'graph') return;
    const el = document.documentElement;
    const prevHtml = el.style.background;
    const prevBody = document.body.style.background;
    el.style.background = GRAPH_BACKGROUND_VAR;
    document.body.style.background = GRAPH_BACKGROUND_VAR;
    return () => {
      el.style.background = prevHtml;
      document.body.style.background = prevBody;
    };
  }, [view]);

  // 모바일에서는 토글을 Topbar 우측 슬롯에 주입한다. view가 바뀌면 활성 상태 반영을 위해 다시 등록하고,
  // 모바일을 벗어나거나(리사이즈) 언마운트되면 슬롯을 비운다.
  useEffect(() => {
    if (!isMobile) return;
    setRightSlot(<ViewToggle view={view} onChange={setView} variant="topbar" />);
    return () => clearRightSlot();
  }, [isMobile, view, setRightSlot, clearRightSlot]);

  return (
    // flow-root: 자식 상단 마진의 margin collapse를 막아 루트 상단(=토글 기준점)을 두 뷰에서 동일하게 고정
    <div className="relative flow-root w-full">
      {/* 토글(데스크탑/태블릿) — 콘텐츠 폭(max-w-328) 우측 끝에 맞춰 배치. 모바일은 Topbar 슬롯에 떠서 여기선 숨김 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden sm:block">
        <div className="mx-auto flex w-full max-w-328 justify-end">
          <div className="pointer-events-auto">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </div>

      {view === 'dashboard' ? (
        <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:gap-8">
          {/* 타이틀 행 — 토글이 콘텐츠를 가리지 않도록 높이 예약(sm↑ 전용). 모바일은 토글이 Topbar에 있어 불필요 */}
          <div className="hidden h-10 items-center sm:flex">{title}</div>
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
