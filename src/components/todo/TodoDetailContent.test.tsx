jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import * as noteApi from '@/src/api/note';
import TodoDetailContent from '@/src/components/todo/TodoDetailContent';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo } from '@/src/types/todo';

const mocked = noteApi as jest.Mocked<typeof noteApi>;

beforeEach(() => {
  jest.resetAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (usePathname as jest.Mock).mockReturnValue('/todos');
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
});

const baseTodo: Todo = {
  id: 1,
  teamId: 'team',
  userId: 1,
  goalId: null,
  title: '자바스크립트 기초 챕터1 듣기',
  done: false,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2024-04-01T00:00:00.000Z',
  updatedAt: '2024-04-01T00:00:00.000Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
};

const noop = () => {};

function renderContent(overrides: Partial<Parameters<typeof TodoDetailContent>[0]> = {}) {
  return renderWithClient(<TodoDetailContent todo={baseTodo} onClose={noop} {...overrides} />);
}

it('완료 전이면 TO DO 칩을 보여준다', () => {
  renderContent();
  expect(screen.getByText('TO DO')).toBeInTheDocument();
});

it('완료된 할일이면 DONE 칩을 보여준다', () => {
  renderContent({ todo: { ...baseTodo, done: true } });
  expect(screen.getByText('DONE')).toBeInTheDocument();
});

it('목표가 없으면 목표 행을 표시하지 않는다', () => {
  renderContent();
  expect(screen.queryByText('목표')).not.toBeInTheDocument();
});

it('목표가 있으면 목표명을 표시한다', () => {
  renderContent({ todo: { ...baseTodo, goal: { id: 2, title: '자바스크립트로 웹 서비스 만들기' } } });
  expect(screen.getByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
});

it('마감기한이 있으면 yyyy. mm. dd로 표시한다', () => {
  renderContent({ todo: { ...baseTodo, dueDate: '2024-04-29T00:00:00.000Z' } });
  expect(screen.getByText('2024. 04. 29')).toBeInTheDocument();
});

it('첨부자료가 모두 없으면 첨부자료 섹션을 표시하지 않는다', () => {
  renderContent();
  expect(screen.queryByText('첨부자료')).not.toBeInTheDocument();
});

it('링크가 있으면 해당 주소로 이동하는 링크를 표시한다', () => {
  renderContent({ todo: { ...baseTodo, linkUrl: 'https://www.codeit.kr' } });
  expect(screen.getByText('첨부자료')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'https://www.codeit.kr' });
  expect(link).toHaveAttribute('href', 'https://www.codeit.kr');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
});

it('첨부 이미지가 있으면 이미지를 표시한다', () => {
  renderContent({ todo: { ...baseTodo, fileUrl: 'https://example.com/image.png' } });
  expect(screen.getByText('첨부자료')).toBeInTheDocument();
  expect(screen.getByAltText('첨부 이미지')).toBeInTheDocument();
});

it('태그를 인덱스 순서대로 색상 매핑한다', () => {
  renderContent({
    todo: {
      ...baseTodo,
      tags: [
        { id: 1, name: '코딩' },
        { id: 2, name: '자기계발' },
        { id: 3, name: '공부' },
      ],
    },
  });
  expect(screen.getByText('코딩')).toHaveClass('bg-badge-green-bg');
  expect(screen.getByText('자기계발')).toHaveClass('bg-badge-yellow-bg');
  expect(screen.getByText('공부')).toHaveClass('bg-badge-red-bg');
});

it('noteIds가 비어 있으면 노트를 요청하지 않고 작성된 노트 섹션을 표시하지 않는다', () => {
  renderContent({ todo: { ...baseTodo, noteIds: [] } });
  expect(screen.queryByText('작성된 노트')).not.toBeInTheDocument();
  expect(mocked.getNotes).not.toHaveBeenCalled();
});

it('노트가 있는 할일은 조회 중에 노트 추가하기 버튼을 보여주지 않는다', () => {
  mocked.getNotes.mockReturnValue(new Promise(() => {})); // 영원히 대기
  renderContent({ todo: { ...baseTodo, id: 3, noteIds: [7] } });
  expect(screen.queryByRole('button', { name: /노트 추가하기/ })).not.toBeInTheDocument();
});

it('노트가 없으면 노트 추가하기 버튼을 표시한다', () => {
  renderContent({ todo: { ...baseTodo, noteIds: [] } });
  expect(screen.getByRole('button', { name: /노트 추가하기/ })).toBeInTheDocument();
});

it('노트 추가하기 버튼을 누르면 write 모드로 노트 드로어를 연다', () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push });
  renderContent({ todo: { ...baseTodo, id: 5, noteIds: [] } });

  screen.getByRole('button', { name: /노트 추가하기/ }).click();

  expect(push).toHaveBeenCalledWith(expect.stringContaining('todoId=5'));
  expect(push).toHaveBeenCalledWith(expect.stringContaining('mode=write'));
});

it('noteIds가 있으면 해당 todoId로 노트를 받아 제목을 표시한다', async () => {
  mocked.getNotes.mockResolvedValue({
    notes: [{ id: 7, title: '프로그래밍과 데이터 in JavaScript' }],
    nextCursor: null,
    totalCount: 1,
  } as never);
  renderContent({ todo: { ...baseTodo, id: 3, noteIds: [7] } });
  await waitFor(() => expect(screen.getByText('프로그래밍과 데이터 in JavaScript')).toBeInTheDocument());
  expect(mocked.getNotes).toHaveBeenCalledWith({ todoId: 3 });
});

it('작성된 노트를 클릭하면 해당 todoId와 mode=detail로 노트 드로어를 연다', async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push });
  mocked.getNotes.mockResolvedValue({
    notes: [{ id: 7, title: '프로그래밍과 데이터 in JavaScript' }],
    nextCursor: null,
    totalCount: 1,
  } as never);
  renderContent({ todo: { ...baseTodo, id: 3, noteIds: [7] } });

  fireEvent.click(await screen.findByRole('button', { name: '프로그래밍과 데이터 in JavaScript' }));

  expect(push).toHaveBeenCalledWith(expect.stringContaining('todoId=3'));
  expect(push).toHaveBeenCalledWith(expect.stringContaining('mode=detail'));
});

it('닫기 버튼을 누르면 onClose를 호출한다', () => {
  const onClose = jest.fn();
  renderContent({ onClose });
  screen.getByRole('button', { name: '닫기' }).click();
  expect(onClose).toHaveBeenCalledTimes(1);
});
