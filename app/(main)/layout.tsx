/**
 * (main) 그룹 셸 레이아웃.
 * 사이드바와 모바일 GNB는 별도 작업(이번 PR 범위 외) — 자리만 확보하는 placeholder.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* TODO(별도 작업): 사이드바 컴포넌트로 교체. figma 반응형 — 태블릿(sm~xl) 60px 레일, 데스크톱(xl+) 362px */}
      <aside
        aria-hidden
        className="hidden w-[60px] shrink-0 border-r border-slate-200 bg-white sm:block xl:w-[362px]"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* TODO(별도 작업): 모바일 GNB 컴포넌트로 교체 (sm 미만에서만 상단 바) */}
        <div aria-hidden className="h-14 shrink-0 border-b border-slate-200 bg-slate-900 sm:hidden" />
        <main className="flex-1 overflow-y-auto px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
