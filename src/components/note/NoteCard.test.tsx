import { fireEvent, render, screen } from '@testing-library/react';

import Dropdown from '@/src/components/common/dropdown/Dropdown';
import NoteCard from '@/src/components/note/NoteCard';
import type { Note } from '@/src/types/note';

const note: Note = {
  id: 3,
  teamId: 't',
  userId: 1,
  todoId: 10,
  title: '노트 제목',
  content: undefined,
  linkUrl: 'https://example.com',
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  todo: { id: 10, title: '연결된 할일', done: false },
};

it('제목·연결된 할일·링크 아이콘을 렌더한다', () => {
  render(<NoteCard note={note} />);
  expect(screen.getByText('노트 제목')).toBeInTheDocument();
  expect(screen.getByText('연결된 할일')).toBeInTheDocument();
  expect(screen.getByLabelText('첨부 링크')).toBeInTheDocument();
});

it('todo.done=true여도 제목에 취소선을 적용하지 않는다', () => {
  render(<NoteCard note={{ ...note, todo: { ...note.todo, done: true } }} />);
  expect(screen.getByText('연결된 할일')).not.toHaveClass('line-through');
});

it('onMore 제공 시 더보기 클릭으로 onMore를 호출하고 카드 onClick으로 버블링하지 않는다', () => {
  const onMore = jest.fn();
  const onClick = jest.fn();
  render(<NoteCard note={note} onClick={onClick} onMore={onMore} />);
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  expect(onMore).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();
});

it('menu 제공 시 케밥 클릭으로 드롭다운이 열리고 카드 onClick은 호출되지 않는다', () => {
  const onClick = jest.fn();
  render(
    <NoteCard
      note={note}
      onClick={onClick}
      menu={
        <Dropdown.Menu size="small" placement="bottom-end">
          <Dropdown.Item>수정하기</Dropdown.Item>
          <Dropdown.Item>삭제하기</Dropdown.Item>
        </Dropdown.Menu>
      }
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: '더보기 메뉴' }));
  expect(screen.getByText('수정하기')).toBeInTheDocument();
  expect(onClick).not.toHaveBeenCalled();
});
