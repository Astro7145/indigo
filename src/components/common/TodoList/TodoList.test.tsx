import { fireEvent, render, screen } from '@testing-library/react';

import TodoList from '@/src/components/common/TodoList/TodoList';

it('title을 렌더한다', () => {
  render(<TodoList title="자바스크립트 듣기" />);
  expect(screen.getByText('자바스크립트 듣기')).toBeInTheDocument();
});

it('checked를 체크박스에 반영하고 aria-label은 title이다', () => {
  render(<TodoList title="할일 A" checked />);
  expect(screen.getByRole('checkbox', { name: '할일 A' })).toBeChecked();
});

it('체크박스 클릭 시 onCheckedChange를 토글 값으로 호출한다', () => {
  const onCheckedChange = jest.fn();
  render(<TodoList title="할일" checked={false} onCheckedChange={onCheckedChange} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

it('StarAction은 아이콘 버튼이며 클릭 시 onClick을 호출한다', () => {
  const onClick = jest.fn();
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.StarAction onClick={onClick} />
      </TodoList.Actions>
    </TodoList>,
  );
  fireEvent.click(screen.getByRole('button', { name: '즐겨찾기' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('StarAction은 active prop으로 채운 별이 된다', () => {
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.StarAction onClick={() => {}} active />
      </TodoList.Actions>
    </TodoList>,
  );
  expect(screen.getByRole('button', { name: '즐겨찾기 해제' })).toBeInTheDocument();
});

it('StarAction의 active는 checked(done)와 독립이다', () => {
  // checked여도 active 미지정이면 빈 별 — 별(즐겨찾기)과 체크박스(done)는 다른 상태
  render(
    <TodoList title="할일" checked>
      <TodoList.Actions>
        <TodoList.StarAction onClick={() => {}} />
      </TodoList.Actions>
    </TodoList>,
  );
  expect(screen.getByRole('button', { name: '즐겨찾기' })).toBeInTheDocument();
});

it('StarAction은 상시 표시다 (hoverOnly 클래스 없음)', () => {
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.StarAction onClick={() => {}} />
      </TodoList.Actions>
    </TodoList>,
  );
  expect(screen.getByRole('button', { name: '즐겨찾기' }).className).not.toMatch(/group-hover/);
});

it('NoteAction·LinkAction은 상시 표시 아이콘 버튼이다 (hoverOnly 아님)', () => {
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.NoteAction onClick={() => {}} />
        <TodoList.LinkAction onClick={() => {}} />
      </TodoList.Actions>
    </TodoList>,
  );
  expect(screen.getByRole('button', { name: '노트' }).className).not.toMatch(/group-hover/);
  expect(screen.getByRole('button', { name: '링크' }).className).not.toMatch(/group-hover/);
});

it('EditAction은 hoverOnly 아이콘 버튼이다', () => {
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.EditAction onClick={() => {}} hoverOnly />
      </TodoList.Actions>
    </TodoList>,
  );
  expect(screen.getByRole('button', { name: '수정' }).className).toMatch(/group-hover/);
});

it('KebabAction 클릭 시 수정/삭제 메뉴를 연다', () => {
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.KebabAction />
      </TodoList.Actions>
    </TodoList>,
  );
  expect(screen.queryByText('수정하기')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '더보기 메뉴' }));
  expect(screen.getByText('수정하기')).toBeInTheDocument();
  expect(screen.getByText('삭제하기')).toBeInTheDocument();
});

it('메뉴 수정하기 클릭 시 onEdit 호출 후 닫힌다', () => {
  const onEdit = jest.fn();
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.KebabAction onEdit={onEdit} />
      </TodoList.Actions>
    </TodoList>,
  );
  fireEvent.click(screen.getByRole('button', { name: '더보기 메뉴' }));
  fireEvent.click(screen.getByText('수정하기'));
  expect(onEdit).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('수정하기')).not.toBeInTheDocument();
});

it('메뉴 삭제하기 클릭 시 onDelete 호출 후 닫힌다', () => {
  const onDelete = jest.fn();
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.KebabAction onDelete={onDelete} />
      </TodoList.Actions>
    </TodoList>,
  );
  fireEvent.click(screen.getByRole('button', { name: '더보기 메뉴' }));
  fireEvent.click(screen.getByText('삭제하기'));
  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('삭제하기')).not.toBeInTheDocument();
});

it('메뉴는 Escape·외부 클릭으로 닫힌다', () => {
  render(
    <TodoList title="할일">
      <TodoList.Actions>
        <TodoList.KebabAction />
      </TodoList.Actions>
    </TodoList>,
  );
  fireEvent.click(screen.getByRole('button', { name: '더보기 메뉴' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByText('수정하기')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '더보기 메뉴' }));
  expect(screen.getByText('수정하기')).toBeInTheDocument();
  fireEvent.mouseDown(document.body);
  expect(screen.queryByText('수정하기')).not.toBeInTheDocument();
});

it('액션 클릭은 행으로 버블링되지 않는다 (stopPropagation)', () => {
  const onRowClick = jest.fn();
  const onStar = jest.fn();
  render(
    <div onClick={onRowClick}>
      <TodoList title="할일">
        <TodoList.Actions>
          <TodoList.StarAction onClick={onStar} />
        </TodoList.Actions>
      </TodoList>
    </div>,
  );
  fireEvent.click(screen.getByRole('button', { name: '즐겨찾기' }));
  expect(onStar).toHaveBeenCalledTimes(1);
  expect(onRowClick).not.toHaveBeenCalled();
});

it('size="small"이면 본문에 text-sm를 적용한다', () => {
  render(<TodoList title="작은 할일" size="small" />);
  expect(screen.getByText('작은 할일').className).toMatch(/text-sm/);
});

it('variant="onDark"이면 white 체크박스를 렌더한다', () => {
  const { container } = render(<TodoList title="할일" variant="onDark" />);
  expect(container.querySelector('path[stroke="var(--color-indigo-600)"]')).toBeInTheDocument();
});

it('컨텍스트 밖에서 서브컴포넌트를 쓰면 에러를 던진다', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<TodoList.StarAction onClick={() => {}} />)).toThrow();
  spy.mockRestore();
});
