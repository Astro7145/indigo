import { render } from '@testing-library/react';
import { today } from '@internationalized/date';

import Calendar from '@/src/components/common/calendar/Calendar';

const KST = 'Asia/Seoul';

// today ring 클래스는 다크 토큰까지 함께 봐서 focus-visible용 ring 유틸과 구분
const TODAY_RING_MARKER = 'dark:ring-indigo-dark-800';

it('오늘 셀은 aria-current="date"와 ring 테두리 강조가 적용된다', () => {
  const todayDate = today(KST);
  render(<Calendar defaultFocusedValue={todayDate} />);

  const todayButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-current="date"]');
  expect(todayButtons).toHaveLength(1);

  const circle = todayButtons[0].querySelector('.rounded-full');
  expect(circle?.className).toContain(TODAY_RING_MARKER);
  expect(circle?.className).not.toContain('bg-indigo-600');
  expect(todayButtons[0].className).toContain('text-slate-700');
});

it('오늘이 선택된 상태이면 선택(selected) 스타일이 우선한다', () => {
  const todayDate = today(KST);
  render(<Calendar value={todayDate} defaultFocusedValue={todayDate} />);

  const todayButton = document.querySelector<HTMLButtonElement>('button[aria-current="date"]');
  expect(todayButton).not.toBeNull();

  const circle = todayButton!.querySelector('.rounded-full');
  expect(circle?.className).toContain('bg-indigo-600');
  expect(circle?.className).not.toContain(TODAY_RING_MARKER);
});

it('다른 날짜가 선택돼도 오늘 셀의 ring 강조는 유지된다', () => {
  const todayDate = today(KST);
  // 같은 달 안에서 today가 아닌 날 — month boundary로 outside가 되지 않도록 day로만 ±1
  const otherDate = todayDate.set({ day: todayDate.day === 1 ? 2 : todayDate.day - 1 });
  render(<Calendar value={otherDate} defaultFocusedValue={todayDate} />);

  // 오늘은 ring으로, 선택된 셀은 bg-indigo-600으로 — 둘 다 동시에 강조된다
  const todayButton = document.querySelector<HTMLButtonElement>('button[aria-current="date"]');
  expect(todayButton).not.toBeNull();
  const todayCircle = todayButton!.querySelector('.rounded-full');
  expect(todayCircle?.className).toContain(TODAY_RING_MARKER);
  expect(todayCircle?.className).not.toContain('bg-indigo-600');

  // selected 셀은 aria 속성 대신 채움 클래스로 식별
  const selectedCircle = document.querySelector<HTMLSpanElement>('.rounded-full.bg-indigo-600');
  expect(selectedCircle).not.toBeNull();
  // selected 셀이 today 셀과 다른 셀이어야 한다
  expect(todayCircle).not.toBe(selectedCircle);
});
