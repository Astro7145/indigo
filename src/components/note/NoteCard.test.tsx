jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNote: jest.fn(),
}));

import { fireEvent, screen } from '@testing-library/react';

import * as noteApi from '@/src/api/note';
import NoteCard from '@/src/components/note/NoteCard';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Note } from '@/src/types/note';

const mocked = noteApi as jest.Mocked<typeof noteApi>;

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

beforeEach(() => jest.resetAllMocks());

it('로딩 중에는 안내 문구를 보여준다', () => {
  mocked.getNote.mockReturnValue(new Promise(() => {}));
  renderWithClient(<NoteCard noteId={3} />);
  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});

it('noteId로 노트를 받아 제목·연결된 할일·링크 아이콘을 렌더한다', async () => {
  mocked.getNote.mockResolvedValue(note);
  renderWithClient(<NoteCard noteId={3} />);
  expect(await screen.findByText('노트 제목')).toBeInTheDocument();
  expect(screen.getByText('연결된 할일')).toBeInTheDocument();
  expect(screen.getByLabelText('첨부 링크')).toBeInTheDocument();
  expect(mocked.getNote).toHaveBeenCalledWith(3);
});

it('todo.done=true이면 line-through를 적용한다', async () => {
  mocked.getNote.mockResolvedValue({
    ...note,
    todo: { ...note.todo, done: true },
  });
  renderWithClient(<NoteCard noteId={3} />);
  expect(await screen.findByText('연결된 할일')).toHaveClass('line-through');
});

it('onMore 제공 시 더보기 클릭으로 onMore를 호출하고 카드 onClick으로 버블링하지 않는다', async () => {
  const onMore = jest.fn();
  const onClick = jest.fn();
  mocked.getNote.mockResolvedValue(note);
  renderWithClient(<NoteCard noteId={3} onClick={onClick} onMore={onMore} />);
  await screen.findByText('노트 제목');
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  expect(onMore).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();
});
