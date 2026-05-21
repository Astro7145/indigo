jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
  getNote: jest.fn(),
  createNote: jest.fn(),
  patchNote: jest.fn(),
  deleteNote: jest.fn(),
}));
import * as noteApi from '@/src/api/note';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  useNoteList,
  useInfiniteNoteList,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@/src/hooks/note';

const mocked = noteApi as jest.Mocked<typeof noteApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useNoteList는 params와 함께 getNotes를 호출한다', async () => {
  mocked.getNotes.mockResolvedValue({
    notes: [],
    nextCursor: null,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useNoteList({ todoId: 3 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getNotes).toHaveBeenCalledWith({ todoId: 3 });
});

it('useNote는 id가 undefined이면 비활성화된다', () => {
  renderHookWithClient(() => useNote(undefined));
  expect(mocked.getNote).not.toHaveBeenCalled();
});

it('useNote는 id가 주어지면 getNote를 호출한다', async () => {
  mocked.getNote.mockResolvedValue({ id: 5, title: 't' } as never);
  const { result } = renderHookWithClient(() => useNote(5));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getNote).toHaveBeenCalledWith(5);
});

it('useInfiniteNoteList는 첫 페이지에서 cursor를 전달한다', async () => {
  mocked.getNotes.mockResolvedValueOnce({
    notes: [],
    nextCursor: 4,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useInfiniteNoteList({ todoId: 3 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getNotes).toHaveBeenLastCalledWith({
    todoId: 3,
    cursor: undefined,
  });
  expect(result.current.hasNextPage).toBe(true);
});

it('useCreateNote는 성공 시 목록을 무효화한다', async () => {
  mocked.createNote.mockResolvedValue({ id: 1 } as never);
  const { result, client } = renderHookWithClient(() => useCreateNote());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ todoId: 3, title: 'x' });
  expect(mocked.createNote).toHaveBeenCalledWith({ todoId: 3, title: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.lists() });
});

it('useUpdateNote는 성공 시 목록을 무효화하고 상세 캐시에 기록한다', async () => {
  mocked.patchNote.mockResolvedValue({ id: 5 } as never);
  const { result, client } = renderHookWithClient(() => useUpdateNote());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const setData = jest.spyOn(client, 'setQueryData');
  await result.current.mutateAsync({ noteId: 5, body: { title: 'x' } });
  expect(mocked.patchNote).toHaveBeenCalledWith(5, { title: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.lists() });
  expect(setData).toHaveBeenCalledWith(noteApi.noteKeys.detail(5), { id: 5 });
});

it('useDeleteNote는 성공 시 목록을 무효화하고 상세 캐시를 제거한다', async () => {
  mocked.deleteNote.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeleteNote());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const rm = jest.spyOn(client, 'removeQueries');
  await result.current.mutateAsync(5);
  expect(mocked.deleteNote).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.lists() });
  expect(rm).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.detail(5) });
});
