// body 스크롤 락을 참조 카운팅으로 관리한다.
// 모달·드로어·오버레이 사이드바가 겹쳐 열려도 마지막 하나가 닫힐 때만 원래 값을 복원하므로,
// 겹친 잠금이 서로의 복원을 덮어쓰지 않는다.
//
// 시프트·거터 띠 동시 해결: 평소 html은 scrollbar-gutter:stable로 스크롤바 폭을 예약한다.
// 락 동안에는
//  1) 거터를 접고(scrollbar-gutter:auto) → 오버레이(fixed 백드롭)가 화면 끝까지 닿아 거터 띠가 안 보임
//  2) overflow:hidden으로 배경 스크롤을 막고
//  3) 거터가 차지하던 스크롤바 폭만큼 body padding-right로 메워 → 배경 콘텐츠는 제자리(시프트 0)
// 셋을 함께 적용한다.

let count = 0;
let originalOverflow = '';
let originalPaddingRight = '';
let originalScrollbarGutter = '';

// SSR·비브라우저 환경(window/document 부재)에서 호출돼도 ReferenceError가 나지 않도록 막는다.
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined' && !!document.body;

// 거터(scrollbar-gutter:stable)가 예약하는 폭을 잰다. `innerWidth - clientWidth`는 스크롤바가
// 실제로 떠 있을 때만 폭을 주므로(예: 그래프 뷰처럼 스크롤이 없으면 0을 반환) 쓰지 않는다.
// off-screen overflow:scroll 요소로 OS 스크롤바 폭을 직접 재면 스크롤바 유무와 무관하게 일관된다
// (오버레이 스크롤바면 0).
function getScrollbarWidth() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;overflow:scroll;width:50px;height:50px;';
  document.body.appendChild(probe);
  const width = probe.offsetWidth - probe.clientWidth;
  probe.remove();
  return width;
}

export function lockScroll() {
  if (!isBrowser()) return;
  if (count === 0) {
    const html = document.documentElement;
    const scrollbarWidth = getScrollbarWidth();
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    originalScrollbarGutter = html.style.scrollbarGutter;
    // 1) 거터 접기 — 오버레이가 화면 끝까지 닿아 거터 띠가 안 보이게.
    html.style.scrollbarGutter = 'auto';
    // 2) 배경 스크롤 잠금.
    document.body.style.overflow = 'hidden';
    // 3) 거터가 비우는 폭만큼 보정해 배경 시프트 0 (오버레이 스크롤바=폭0이면 무보정).
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  count += 1;
}

export function unlockScroll() {
  if (!isBrowser()) return;
  if (count === 0) return;
  count -= 1;
  if (count === 0) {
    const html = document.documentElement;
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
    html.style.scrollbarGutter = originalScrollbarGutter;
  }
}

// 테스트 전용: 모듈 전역 상태(count/original*)를 초기화해 테스트 간 상태 오염을 막는다.
export function _resetScrollLock() {
  count = 0;
  originalOverflow = '';
  originalPaddingRight = '';
  originalScrollbarGutter = '';
}
