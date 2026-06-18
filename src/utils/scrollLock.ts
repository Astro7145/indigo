// body 스크롤 락을 참조 카운팅으로 관리한다.
// 모달·드로어·오버레이 사이드바가 겹쳐 열려도 마지막 하나가 닫힐 때만 원래 값을 복원하므로,
// 겹친 잠금이 서로의 복원을 덮어쓰지 않는다.
//
// 시프트·거터 띠 동시 해결: 평소 html은 scrollbar-gutter:stable로 스크롤바 폭을 예약한다
// (대시보드↔우주 전환 등 스크롤바 유무가 바뀌어도 콘텐츠 폭 고정). 락 동안에는
//  1) 거터를 접고(scrollbar-gutter:auto) → 오버레이(fixed 백드롭)가 화면 끝까지 닿아 거터 띠가 안 보임
//  2) overflow:hidden으로 배경 스크롤을 막고
//  3) 회수된 스크롤바 폭만큼 body padding-right로 메워 → 배경 콘텐츠는 제자리(시프트 0)
// 셋을 함께 적용한다.

let count = 0;
let originalOverflow = '';
let originalPaddingRight = '';
let originalScrollbarGutter = '';

// SSR·비브라우저 환경(window/document 부재)에서 호출돼도 ReferenceError가 나지 않도록 막는다.
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined' && !!document.body;

export function lockScroll() {
  if (!isBrowser()) return;
  if (count === 0) {
    const html = document.documentElement;
    // 예약된 거터(스크롤바) 폭. stable 거터가 있으면 innerWidth - clientWidth가 그 폭이 된다.
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    originalScrollbarGutter = html.style.scrollbarGutter;
    // 1) 거터 접기 — 오버레이가 화면 끝까지 닿아 거터 띠가 안 보이게.
    html.style.scrollbarGutter = 'auto';
    // 2) 배경 스크롤 잠금.
    document.body.style.overflow = 'hidden';
    // 3) 회수된 폭만큼 보정해 배경 시프트 0 (오버레이 스크롤바=폭0이면 무보정).
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
