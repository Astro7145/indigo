jest.mock('@/src/hooks/note/note', () => ({ useDeleteNote: jest.fn() }));
jest.mock('@/src/hooks/useToast', () => ({ useToast: jest.fn() }));

import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import Modal from '@/src/components/common/modal/Modal';
import NoteDeleteConfirm from '@/src/components/note/NoteDeleteConfirm';
import * as noteHooks from '@/src/hooks/note/note';
import * as toastHook from '@/src/hooks/useToast';
import type { Note } from '@/src/types/note';

const mockedUseDeleteNote = noteHooks.useDeleteNote as jest.MockedFunction<typeof noteHooks.useDeleteNote>;
const mockedUseToast = toastHook.useToast as jest.MockedFunction<typeof toastHook.useToast>;

const mockMutate = jest.fn();
const mockShowToast = jest.fn();

// Modal.Title/Modal.Cancel/Modal.Confirm은 ModalContext가 필요해 실제 <Modal> 안에서만 렌더할 수 있다
// (NoteCancelConfirm·NoteLinkInput과 동일 — 프로덕션에선 ModalStack이 이 셸을 씌운다).
function renderInModal(children: ReactNode) {
  return render(
    <Modal open onClose={() => {}}>
      {children}
    </Modal>,
  );
}

const makeNote = (id: number, title: string): Note => ({
  id,
  teamId: 't',
  userId: 1,
  todoId: id,
  title,
  content: '',
  linkUrl: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  todo: { id, title: `할 일 ${id}`, done: false },
});

const setDeleteState = (isPending = false) =>
  mockedUseDeleteNote.mockReturnValue({
    mutate: mockMutate,
    isPending,
  } as unknown as ReturnType<typeof noteHooks.useDeleteNote>);

beforeEach(() => {
  jest.clearAllMocks();
  setDeleteState();
  mockedUseToast.mockReturnValue({ showToast: mockShowToast, hideToast: jest.fn() });
});

it('확인을 누르면 해당 노트가 삭제되고 닫힌다', () => {
  mockMutate.mockImplementation((_vars, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());
  const onClose = jest.fn();
  renderInModal(<NoteDeleteConfirm note={makeNote(7, '노트 A')} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(mockMutate).toHaveBeenCalledWith({ noteId: 7, todoId: 7 }, expect.any(Object));
  expect(mockShowToast).toHaveBeenCalledWith('노트가 삭제되었습니다.');
  expect(onClose).toHaveBeenCalled();
});

it('취소를 누르면 삭제 없이 닫힌다', () => {
  const onClose = jest.fn();
  renderInModal(<NoteDeleteConfirm note={makeNote(7, '노트 A')} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(mockMutate).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});

it('삭제에 실패하면 실패 토스트를 띄우고 닫지 않는다', () => {
  mockMutate.mockImplementation((_vars, opts?: { onError?: () => void }) => opts?.onError?.());
  const onClose = jest.fn();
  renderInModal(<NoteDeleteConfirm note={makeNote(7, '노트 A')} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(mockShowToast).toHaveBeenCalledWith('노트 삭제에 실패했습니다.');
  expect(onClose).not.toHaveBeenCalled();
});

it('삭제 진행 중에는 확인 및 취소 버튼을 누를 수 없다', () => {
  setDeleteState(true);
  renderInModal(<NoteDeleteConfirm note={makeNote(7, '노트 A')} onClose={jest.fn()} />);

  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
});

it('경고 문구로 복구 불가를 안내한다', () => {
  renderInModal(<NoteDeleteConfirm note={makeNote(7, '노트 A')} onClose={jest.fn()} />);

  expect(screen.getByText('정말 삭제하시겠어요?')).toBeInTheDocument();
  expect(screen.getByText('삭제된 노트는 복구할 수 없습니다.')).toBeInTheDocument();
});
