jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNote: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as noteApi from '@/src/api/note';
import NoteDetail from '@/src/components/note/NoteDetail';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Note } from '@/src/types/note';

const noteMock = noteApi as jest.Mocked<typeof noteApi>;

const sample: Note = {
  id: 1,
  teamId: 't',
  userId: 1,
  todoId: 9,
  title: '프로그래밍과 데이터 in JavaScript',
  linkUrl: 'https://www.codeit.kr/lessons/3480',
  createdAt: '2024-03-20T00:00:00Z',
  updatedAt: '2024-03-25T00:00:00Z',
  todo: {
    id: 9,
    title: '자바스크립트 기초 챕터1 듣기',
    done: false,
    goal: { id: 5, title: '자바스크립트로 웹 서비스 만들기' },
    tags: [
      { id: 1, name: '코딩' },
      { id: 2, name: '공부' },
    ],
  },
};

beforeEach(() => jest.resetAllMocks());

it('노트 메타를 렌더한다', async () => {
  noteMock.getNote.mockResolvedValue(sample);
  renderWithClient(<NoteDetail noteId={1} />);
  expect(await screen.findByText('프로그래밍과 데이터 in JavaScript')).toBeInTheDocument();
  expect(screen.getByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
  expect(screen.getByText('자바스크립트 기초 챕터1 듣기')).toBeInTheDocument();
  expect(screen.getByText('코딩')).toBeInTheDocument();
});

it('링크 카드 클릭 시 임베드를 토글한다', async () => {
  noteMock.getNote.mockResolvedValue(sample);
  renderWithClient(<NoteDetail noteId={1} />);
  const linkCard = await screen.findByRole('button', { name: /codeit\.kr/ });
  expect(screen.queryByTitle('첨부 링크 미리보기')).toBeNull();
  fireEvent.click(linkCard);
  await waitFor(() => expect(screen.getByTitle('첨부 링크 미리보기')).toBeInTheDocument());
});
