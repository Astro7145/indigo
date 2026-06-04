class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error test shim
global.IntersectionObserver = IO;

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
  getNote: jest.fn(),
}));
jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoal: jest.fn(),
}));

import { fireEvent, screen } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import * as noteApi from '@/src/api/note';
import NotesCollection from '@/src/components/note/NotesCollection';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Note, NoteListResponse } from '@/src/types/note';
import type { GoalDetail } from '@/src/types/goal';

const noteMock = noteApi as jest.Mocked<typeof noteApi>;
const goalMock = goalApi as jest.Mocked<typeof goalApi>;

const note = (id: number, title: string): Note => ({
  id,
  teamId: 't',
  userId: 1,
  todoId: id,
  title,
  content: '',
  linkUrl: null,
  createdAt: '2024-04-29T00:00:00Z',
  updatedAt: '2024-04-29T00:00:00Z',
  todo: { id, title: `할 일 ${id}`, done: false },
});
const page = (notes: Note[]): NoteListResponse => ({ notes, nextCursor: null, totalCount: notes.length });
const goal: GoalDetail = {
  id: 5,
  teamId: 't',
  userId: 1,
  title: '자바스크립트로 웹 서비스 만들기',
  createdAt: '',
  updatedAt: '',
  todos: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  goalMock.getGoal.mockResolvedValue(goal);
  noteMock.getNote.mockResolvedValue(note(1, 'x'));
});

it('목표 제목과 노트 카드를 렌더한다', async () => {
  const n1 = note(1, '체계적인 폴더 구조 세팅하기');
  const n2 = note(2, '서버 연동하기');
  noteMock.getNotes.mockResolvedValue(page([n1, n2]));
  noteMock.getNote.mockImplementation((id) => Promise.resolve(id === 2 ? n2 : n1));
  renderWithClient(<NotesCollection goalId={5} />);
  expect(await screen.findByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
  expect(await screen.findByText('체계적인 폴더 구조 세팅하기')).toBeInTheDocument();
});

it('노트가 없으면 빈 상태 텍스트를 보여준다', async () => {
  noteMock.getNotes.mockResolvedValue(page([]));
  renderWithClient(<NotesCollection goalId={5} />);
  expect(await screen.findByText('노트가 아직 없어요')).toBeInTheDocument();
});

it('케밥 클릭 시 수정/삭제 드롭다운을 표시한다', async () => {
  noteMock.getNotes.mockResolvedValue(page([note(1, '노트 A')]));
  renderWithClient(<NotesCollection goalId={5} />);
  const kebab = await screen.findByRole('button', { name: '더보기 메뉴' });
  fireEvent.click(kebab);
  expect(screen.getByText('수정하기')).toBeInTheDocument();
  expect(screen.getByText('삭제하기')).toBeInTheDocument();
});
