/**
 * (main) 그룹 셸 레이아웃.
 * 사이드바와 모바일 GNB는 별도 작업(이번 PR 범위 외) — 자리만 확보하는 placeholder.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* TODO(별도 작업): 사이드바 컴포넌트로 교체 */}
      <aside aria-hidden className="hidden w-[362px] shrink-0 border-r border-slate-200 bg-white lg:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* TODO(별도 작업): 모바일 GNB 컴포넌트로 교체 */}
        <div aria-hidden className="h-14 shrink-0 border-b border-slate-200 bg-slate-900 lg:hidden" />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10 lg:pt-20">{children}</main>
      </div>
    </div>
  );
}
