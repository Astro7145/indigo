import { type ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDate } from '@internationalized/date';
import Calendar from '@/src/components/common/calendar/Calendar';
import DatePicker from '@/src/components/todo/date-picker/DatePicker';

jest.mock('@/src/components/common/calendar/Calendar');
jest.mock('@/src/components/todo/BottomSheet');
jest.mock('@/src/hooks/useIsMobile', () => ({
  useIsMobile: jest.fn().mockReturnValue(false),
}));

(Calendar as jest.Mock).mockImplementation(({ onChange }: ComponentProps<typeof Calendar>) => (
  <button type="button" onClick={() => onChange?.(new CalendarDate(2024, 6, 20))}>
    날짜 변경
  </button>
));

it('날짜를 선택하지 않은 상태에서는 안내 문구가 표시된다', () => {
  render(<DatePicker value={null} />);
  expect(screen.getByText('날짜를 선택해주세요')).toBeInTheDocument();
});

it('날짜가 선택되어 있으면 해당 날짜가 표시된다', () => {
  render(<DatePicker value={new CalendarDate(2024, 5, 15)} />);
  expect(screen.getByText('2024. 05. 15')).toBeInTheDocument();
});

it('날짜 선택 버튼을 누르면 캘린더 팝업이 열린다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  await user.click(screen.getByRole('button', { name: '날짜를 선택해주세요' }));
  expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
});

it('팝업이 열린 상태에서 날짜 선택 버튼을 다시 누르면 팝업이 닫힌다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  const trigger = screen.getByRole('button', { name: '날짜를 선택해주세요' });
  await user.click(trigger);
  await user.click(trigger);
  expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
});

it('취소 버튼을 누르면 팝업이 닫힌다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  await user.click(screen.getByRole('button', { name: '날짜를 선택해주세요' }));
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
});

it('취소 버튼을 누르면 날짜 변경이 적용되지 않는다', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<DatePicker value={null} onChange={onChange} />);
  await user.click(screen.getByRole('button', { name: '날짜를 선택해주세요' }));
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(onChange).not.toHaveBeenCalled();
});

it('확인 버튼을 누르면 선택한 날짜가 적용된다', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const value = new CalendarDate(2024, 5, 15);
  render(<DatePicker value={value} onChange={onChange} />);
  await user.click(screen.getByRole('button', { name: '2024. 05. 15' }));
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onChange).toHaveBeenCalledWith(value);
});

it('확인 버튼을 누르면 팝업이 닫힌다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={null} />);
  await user.click(screen.getByRole('button', { name: '날짜를 선택해주세요' }));
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
});

it('다른 날짜를 선택하고 취소 버튼을 누르면 기존 날짜가 유지된다', async () => {
  const user = userEvent.setup();
  render(<DatePicker value={new CalendarDate(2024, 5, 15)} />);
  // 열기
  await user.click(screen.getByRole('button', { name: '2024. 05. 15' }));
  // 날짜 변경 → pendingDate = 2024/6/20
  await user.click(screen.getByText('날짜 변경'));
  // 취소 → pendingDate 리셋, 닫힘
  await user.click(screen.getByRole('button', { name: '취소' }));
  // 재오픈
  await user.click(screen.getByRole('button', { name: '2024. 05. 15' }));
  // pendingDate가 value(05/15)로 리셋됐으면 06/20은 표시되지 않는다
  expect(screen.queryByText('2024. 06. 20')).not.toBeInTheDocument();
});

it('다른 날짜를 선택하고 확인 버튼을 누르면 그 날짜가 적용된다', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<DatePicker value={new CalendarDate(2024, 5, 15)} onChange={onChange} />);
  await user.click(screen.getByRole('button', { name: '2024. 05. 15' }));
  // 날짜 변경 → pendingDate = 2024/6/20
  await user.click(screen.getByText('날짜 변경'));
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(onChange).toHaveBeenCalledWith(new CalendarDate(2024, 6, 20));
});
