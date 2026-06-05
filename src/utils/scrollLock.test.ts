import { lockScroll, unlockScroll, _resetScrollLock } from './scrollLock';

describe('scrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.documentElement.classList.remove('scroll-locked');
    // 이전 테스트의 실패/예외로 전역 카운트가 남는 오염을 막는다
    _resetScrollLock();
  });

  it('잠그면 body 스크롤이 막히고 해제하면 원래대로 돌아온다', () => {
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    unlockScroll();
    expect(document.body.style.overflow).toBe('');
  });

  it('겹쳐서 잠가도 마지막 해제까지는 스크롤이 막힌 채 유지된다', () => {
    lockScroll();
    lockScroll();
    unlockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    unlockScroll();
    expect(document.body.style.overflow).toBe('');
  });

  it('잠그기 직전의 overflow 값을 복원한다', () => {
    document.body.style.overflow = 'scroll';
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    unlockScroll();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('잠그면 html에 scroll-locked를 달아 거터 띠를 덮고 해제하면 뗀다', () => {
    lockScroll();
    expect(document.documentElement.classList.contains('scroll-locked')).toBe(true);
    unlockScroll();
    expect(document.documentElement.classList.contains('scroll-locked')).toBe(false);
  });

  it('해제되지 않은 잠금이 남아도 초기화하면 다음 잠금/해제가 정상 복원된다', () => {
    // 해제 없이 잠금만 두 번 — 카운트가 누적된(오염된) 상태를 만든다
    lockScroll();
    lockScroll();
    _resetScrollLock();
    // 초기화 후 깨끗한 환경에서 한 쌍의 잠금/해제는 즉시 원래대로 복원돼야 한다
    document.body.style.overflow = '';
    document.documentElement.classList.remove('scroll-locked');
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    unlockScroll();
    expect(document.body.style.overflow).toBe('');
  });
});
