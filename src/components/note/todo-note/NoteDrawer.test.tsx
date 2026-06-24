jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  usePathname: jest.fn(() => '/todos'),
}));

jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
}));

jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodo: jest.fn().mockResolvedValue(null),
}));

// 자식 NoteWorkspace는 별도 테스트됨. 여기선 드로어의 열림/모드 분기/닫기/ESC만 검증하므로
// mode를 드러내고 requestClose를 ref로 노출하는 가벼운 stub으로 대체한다.
jest.mock('./NoteWorkspace', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  function MockNoteWorkspace({
    mode,
    onEdit,
    onClose,
    onCancel,
    ref,
  }: {
    mode: 'create' | 'edit' | 'read';
    onEdit: () => void;
    onClose: () => void;
    onCancel: () => void;
    ref?: React.Ref<{ requestClose: () => void }>;
  }) {
    // dirty 판단은 폼 책임이므로 stub은 단순히 mode에 따라 이탈 콜백을 호출한다.
    React.useImperativeHandle(ref, () => ({
      requestClose: () => (mode === 'read' ? onClose() : onCancel()),
    }));
    return (
      <div>
        <p>{mode === 'create' ? '작성 폼' : mode === 'edit' ? '수정 폼' : '상세 뷰'}</p>
        <button type="button" onClick={onEdit}>
          수정
        </button>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    );
  }

  return { __esModule: true, default: MockNoteWorkspace };
});

import { fireEvent, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getNotes } from '@/src/api/note';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import { useModalStore } from '@/src/stores/modal';
import type { Note } from '@/src/types/note';

import NoteDrawer from './NoteDrawer';

const note: Note = {
  id: 7,
  teamId: 't',
  userId: 1,
  todoId: 12,
  title: '제목',
  content: { type: 'doc', content: [] },
  linkUrl: null,
  createdAt: '2024-03-25T00:00:00.000Z',
  updatedAt: '2024-03-25T00:00:00.000Z',
  todo: { id: 12, title: '할 일', done: false },
};

function setParams(query: string) {
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(query));
}

beforeEach(() => {
  jest.clearAllMocks();
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  window.history.pushState({}, '', '/todos');
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('mode=write이면 작성 폼을 보여주고 노트 리스트를 요청하지 않는다', async () => {
  setParams('todoId=12&mode=write');

  renderWithClient(<NoteDrawer />);

  expect(await screen.findByText('작성 폼')).toBeInTheDocument();
  // initialData+staleTime:Infinity로 페치가 발생하지 않아야 한다 — 핵심 회귀 가드.
  expect(getNotes).not.toHaveBeenCalled();
});

it('mode=detail이면 상세 모드로 노트를 보여준다', async () => {
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });
  setParams('todoId=12&mode=detail');

  renderWithClient(<NoteDrawer />);

  expect(await screen.findByText('상세 뷰')).toBeInTheDocument();
});

it('mode=detail인데 노트가 없으면 작성 폼으로 폴백한다 (desync 가드)', async () => {
  (getNotes as jest.Mock).mockResolvedValue({ notes: [], nextCursor: null, totalCount: 0 });
  setParams('todoId=12&mode=detail');

  renderWithClient(<NoteDrawer />);

  expect(await screen.findByText('작성 폼')).toBeInTheDocument();
});

it('todoId만 있고 mode가 없으면 detail을 기본값으로 사용한다', async () => {
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });
  setParams('todoId=12');

  renderWithClient(<NoteDrawer />);

  expect(await screen.findByText('상세 뷰')).toBeInTheDocument();
});

it('쿼리파라미터가 없으면 드로어가 열리지 않는다', () => {
  setParams('');

  renderWithClient(<NoteDrawer />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(getNotes).not.toHaveBeenCalled();
});

it('todoId 없이 무관한 파라미터만 있으면 드로어가 열리지 않는다', () => {
  setParams('a=1');

  renderWithClient(<NoteDrawer />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(getNotes).not.toHaveBeenCalled();
});

it('상세 모드에서 닫기를 누르면 todoId·mode 파라미터를 제거한다', async () => {
  const pushState = jest.spyOn(window.history, 'pushState');
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });
  setParams('todoId=12&mode=detail');

  renderWithClient(<NoteDrawer />);
  await screen.findByText('상세 뷰');

  fireEvent.click(screen.getByRole('button', { name: '닫기' }));

  expect(pushState).toHaveBeenCalledWith(null, '', '/todos');
});

// --- ESC 닫기 ---

it('상세: Escape를 누르면 이벤트 전파를 막고 드로어를 닫는다', async () => {
  const pushState = jest.spyOn(window.history, 'pushState');
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });
  setParams('todoId=12&mode=detail');

  renderWithClient(<NoteDrawer />);
  await screen.findByText('상세 뷰');

  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  const stopProp = jest.spyOn(event, 'stopPropagation');
  document.dispatchEvent(event);

  expect(stopProp).toHaveBeenCalled();
  expect(pushState).toHaveBeenCalledWith(null, '', '/todos');
});

it('작성: Escape를 누르면 드로어를 닫는다', async () => {
  const replaceState = jest.spyOn(window.history, 'replaceState');
  setParams('todoId=12&mode=write');

  renderWithClient(<NoteDrawer />);
  await screen.findByText('작성 폼');

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

  expect(replaceState).toHaveBeenCalledWith(null, '', '/todos');
});

it('모달 스택이 열려 있으면 Escape를 눌러도 드로어는 반응하지 않는다', async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push, replace: jest.fn() });
  (getNotes as jest.Mock).mockResolvedValue({ notes: [note], nextCursor: null, totalCount: 1 });
  setParams('todoId=12&mode=detail');

  useModalStore.setState({ modals: [{ id: '1', variant: 'modal', render: () => null }] });

  renderWithClient(<NoteDrawer />);
  await screen.findByText('상세 뷰');

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

  expect(push).not.toHaveBeenCalled();

  useModalStore.setState({ modals: [] });
});
