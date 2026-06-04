// body 스크롤 락을 참조 카운팅으로 관리한다.
// 모달이 겹쳐 열려도(예: 폼 모달 위에 확인 모달) 마지막 하나가 닫힐 때만
// 원래 overflow 값을 복원하므로, 스택된 모달이 서로의 복원을 덮어쓰지 않는다.

let count = 0;
let original = '';

export function lockScroll() {
  if (count === 0) {
    original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  count += 1;
}

export function unlockScroll() {
  if (count === 0) return;
  count -= 1;
  if (count === 0) {
    document.body.style.overflow = original;
  }
}
