import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDate } from '@internationalized/date';
import DatePicker from '@/src/components/todo/DatePicker';

// Calendar 내부는 react-aria 의존도가 높아 stub으로 대체한다.
// onClick으로 onChange(CalendarDate(2024, 6, 20))를 호출해 pendingDate 변경을 시뮬레이션한다.
jest.mock('@/src/components/common/calendar/Calendar', () => {
  // jest.mock factory는 호이스팅되므로 외부 import를 직접 참조할 수 없다.
  // jest.requireActual로 CalendarDate를 가져온다.
  const { CalendarDate: CD } = jest.requireActual('@internationalized/date');
  return {
    __esModule: true,
    default: ({ onChange }: { onChange: (date: InstanceType<typeof CD>) => void }) => (
      <button type="button" onClick={() => onChange(new CD(2024, 6, 20))}>
        날짜 변경
      </button>
    ),
  };
});

// BottomSheet를 null로 mock해 모바일 DatePickerContent가 이중 렌더되지 않게 한다.
// (데스크탑 팝오버만 테스트 대상으로 남긴다)
jest.mock('@/src/components/todo/BottomSheet', () => ({
  __esModule: true,
  default: () => null,
}));

it('value가 null이면 "날짜를 선택해주세요"를 표시한다', () => {
  render(<DatePicker value={null} />);
  expect(screen.getByText('날짜를 선택해주세요')).toBeInTheDocument();
});

it('value가 있으면 포맷된 날짜를 표시한다', () => {
  render(<DatePicker value={new CalendarDate(2024, 5, 15)} />);
  expect(screen.getByText('2024. 05. 15')).toBeInTheDocument();
});

it('트리거 클릭 시 취소·확인 버튼이 노출된다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  await user.click(screen.getByText('날짜를 선택해주세요').closest('button') as HTMLButtonElement);
  expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
});

it('열린 상태에서 트리거 재클릭 시 팝업이 닫힌다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  const trigger = screen.getByText('날짜를 선택해주세요').closest('button') as HTMLButtonElement;
  await user.click(trigger);
  await user.click(trigger);
  expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
});

it('취소 클릭 시 팝업이 닫힌다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  await user.click(screen.getByText('날짜를 선택해주세요').closest('button') as HTMLButtonElement);
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
});

it('취소 클릭 시 onChange가 호출되지 않는다', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<DatePicker value={null} onChange={onChange} />);
  await user.click(screen.getByText('날짜를 선택해주세요').closest('button') as HTMLButtonElement);
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(onChange).not.toHaveBeenCalled();
});
