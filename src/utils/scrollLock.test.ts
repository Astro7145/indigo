import { lockScroll, unlockScroll, _resetScrollLock } from './scrollLock';

describe('scrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.scrollbarGutter = '';
    // 이전 테스트의 실패/예외로 전역 카운트가 남는 오염을 막는다
    _resetScrollLock();
    // 기본: 스크롤바 폭 0 (innerWidth === clientWidth) → padding 보정 없음(기존 동작 테스트에 영향 없도록)
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, get: () => 1000 });
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

  it('잠그면 거터를 접고(scrollbar-gutter:auto) 해제 시 복원한다', () => {
    lockScroll();
    expect(document.documentElement.style.scrollbarGutter).toBe('auto');
    unlockScroll();
    expect(document.documentElement.style.scrollbarGutter).toBe('');
  });

  it('잠그면 회수된 스크롤바 폭만큼 padding-right로 보정하고 해제 시 되돌린다', () => {
    // innerWidth 1000 - clientWidth 985 = 15
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, get: () => 985 });
    lockScroll();
    expect(document.body.style.paddingRight).toBe('15px');
    unlockScroll();
    expect(document.body.style.paddingRight).toBe('');
  });

  it('스크롤바 폭이 0이면(오버레이) padding-right를 건드리지 않는다', () => {
    // beforeEach 기본 clientWidth 1000 === innerWidth 1000 → 폭 0
    lockScroll();
    expect(document.body.style.paddingRight).toBe('');
    unlockScroll();
    expect(document.body.style.paddingRight).toBe('');
  });

  it('해제되지 않은 잠금이 남아도 초기화하면 다음 잠금/해제가 정상 복원된다', () => {
    // 해제 없이 잠금만 두 번 — 카운트가 누적된(오염된) 상태를 만든다
    lockScroll();
    lockScroll();
    _resetScrollLock();
    // 초기화 후 깨끗한 환경에서 한 쌍의 잠금/해제는 즉시 원래대로 복원돼야 한다
    document.body.style.overflow = '';
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    unlockScroll();
    expect(document.body.style.overflow).toBe('');
  });
});
