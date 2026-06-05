// body 스크롤 락을 참조 카운팅으로 관리한다.
// 모달이 겹쳐 열려도(예: 폼 모달 위에 확인 모달) 마지막 하나가 닫힐 때만
// 원래 overflow 값을 복원하므로, 스택된 모달이 서로의 복원을 덮어쓰지 않는다.
//
// 추가: 잠금 동안 html에 .scroll-locked를 단다. scrollbar-gutter:stable이 예약한 거터가
// 스크롤바 숨김(overflow:hidden) 후 빈 띠로 남는데, 이를 globals.css에서 백드롭 색으로 덮는다.

let count = 0;
let original = '';

// SSR·비브라우저 환경(window/document 부재)에서 호출돼도 ReferenceError가 나지 않도록 막는다.
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined' && !!document.body;

export function lockScroll() {
  if (!isBrowser()) return;
  if (count === 0) {
    original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('scroll-locked');
  }
  count += 1;
}

export function unlockScroll() {
  if (!isBrowser()) return;
  if (count === 0) return;
  count -= 1;
  if (count === 0) {
    document.body.style.overflow = original;
    document.documentElement.classList.remove('scroll-locked');
  }
}

// 테스트 전용: 모듈 전역 상태(count/original)를 초기화해 테스트 간 상태 오염을 막는다.
export function _resetScrollLock() {
  count = 0;
  original = '';
}
