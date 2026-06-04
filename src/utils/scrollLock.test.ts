import { lockScroll, unlockScroll } from './scrollLock';

describe('scrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
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
});
