import { render } from '@testing-library/react';
import { today } from '@internationalized/date';

import Calendar from '@/src/components/common/calendar/Calendar';

const KST = 'Asia/Seoul';

it('오늘 셀은 aria-current="date"와 indigo 원형 강조가 적용된다', () => {
  const todayDate = today(KST);
  render(<Calendar defaultFocusedValue={todayDate} />);

  const todayButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-current="date"]');
  expect(todayButtons).toHaveLength(1);

  const circle = todayButtons[0].querySelector('.rounded-full');
  expect(circle?.className).toContain('bg-indigo-500');
  expect(todayButtons[0].className).toContain('text-white');
});

it('오늘이 선택된 상태이면 선택(selected) 스타일이 우선한다', () => {
  const todayDate = today(KST);
  render(<Calendar value={todayDate} defaultFocusedValue={todayDate} />);

  const todayButton = document.querySelector<HTMLButtonElement>('button[aria-current="date"]');
  expect(todayButton).not.toBeNull();

  const circle = todayButton!.querySelector('.rounded-full');
  expect(circle?.className).toContain('bg-indigo-600');
  expect(circle?.className).not.toContain('bg-indigo-500');
});

it('다른 날짜가 선택되면 오늘 셀의 indigo 강조는 사라진다', () => {
  const todayDate = today(KST);
  // 같은 달 안에서 today가 아닌 날 — month boundary로 outside가 되지 않도록 day로만 ±1
  const otherDate = todayDate.set({ day: todayDate.day === 1 ? 2 : todayDate.day - 1 });
  render(<Calendar value={otherDate} defaultFocusedValue={todayDate} />);

  // 시맨틱(aria-current="date")은 유지하되 시각 강조(bg-indigo-500)만 빠진다
  const todayButton = document.querySelector<HTMLButtonElement>('button[aria-current="date"]');
  expect(todayButton).not.toBeNull();

  const circle = todayButton!.querySelector('.rounded-full');
  expect(circle?.className).not.toContain('bg-indigo-500');
});
