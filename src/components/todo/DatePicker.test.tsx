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

// TODO: 테스트 케이스는 Task 2에서 추가한다.
it.todo('DatePicker 테스트 케이스 추가 예정');
