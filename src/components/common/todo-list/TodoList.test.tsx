import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import TodoList from '@/src/components/common/todo-list/TodoList';
import { renderWithIntl } from '@/src/hooks/__tests__/test-utils';

const renderRow = (props?: Partial<React.ComponentProps<typeof TodoList>>) =>
  renderWithIntl(
    <ul>
      <TodoList title="할일 A" {...props} />
    </ul>,
  );

it('title을 렌더한다', async () => {
  await renderRow();
  expect(screen.getByText('할일 A')).toBeInTheDocument();
});

it('checked=true 이면 체크박스가 체크된 상태로 렌더한다', async () => {
  await renderRow({ checked: true });
  expect(screen.getByRole('checkbox')).toBeChecked();
});

it('체크박스 변경 시 onCheckedChange를 호출한다', async () => {
  const onCheckedChange = jest.fn();
  await renderRow({ onCheckedChange });
  fireEvent.click(screen.getByRole('checkbox'));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

it('onClick이 있으면 행 클릭 시 호출한다', async () => {
  const onClick = jest.fn();
  await renderRow({ onClick });
  fireEvent.click(screen.getByText('할일 A'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('StarAction — active=false 이면 즐겨찾기 aria-label을 렌더한다', async () => {
  await renderWithIntl(
    <ul>
      <TodoList title="할일 A">
        <TodoList.Actions>
          <TodoList.StarAction />
        </TodoList.Actions>
      </TodoList>
    </ul>,
  );
  expect(screen.getByLabelText('즐겨찾기')).toBeInTheDocument();
});

it('StarAction — active=true 이면 즐겨찾기 해제 aria-label을 렌더한다', async () => {
  await renderWithIntl(
    <ul>
      <TodoList title="할일 A">
        <TodoList.Actions>
          <TodoList.StarAction active />
        </TodoList.Actions>
      </TodoList>
    </ul>,
  );
  expect(screen.getByLabelText('즐겨찾기 해제')).toBeInTheDocument();
});

it('KebabAction — 클릭 시 수정하기·삭제하기 메뉴를 표시한다', async () => {
  await renderWithIntl(
    <ul>
      <TodoList title="할일 A">
        <TodoList.Actions>
          <TodoList.KebabAction />
        </TodoList.Actions>
      </TodoList>
    </ul>,
  );
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  expect(screen.getByText('수정하기')).toBeInTheDocument();
  expect(screen.getByText('삭제하기')).toBeInTheDocument();
});

it('ref를 행 컨테이너에 전달한다', async () => {
  const ref = createRef<HTMLDivElement>();
  await renderWithIntl(
    <ul>
      <TodoList title="할일 A" ref={ref} />
    </ul>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
