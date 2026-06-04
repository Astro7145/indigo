jest.mock('@/src/api/client-fetcher');
import instance from '@/src/api/client-fetcher';
import { getNotes, getNote, createNote, patchNote, deleteNote, noteKeys } from '@/src/api/note';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { notes: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('getNotes는 params와 함께 GET /notes를 호출한다', async () => {
  const r = await getNotes({ todoId: 3, search: 'x' });
  expect(mocked.get).toHaveBeenCalledWith('/notes', { params: { todoId: 3, search: 'x' } });
  expect(r).toEqual({ notes: [], nextCursor: null, totalCount: 0 });
});
it('getNote는 GET /notes/:id를 호출한다', async () => {
  await getNote(9);
  expect(mocked.get).toHaveBeenCalledWith('/notes/9');
});
it('createNote는 /notes로 POST한다', async () => {
  await createNote({ todoId: 3, title: 't' });
  expect(mocked.post).toHaveBeenCalledWith('/notes', { todoId: 3, title: 't' });
});
it('patchNote는 /notes/:id로 PATCH한다', async () => {
  await patchNote(9, { title: 'u' });
  expect(mocked.patch).toHaveBeenCalledWith('/notes/9', { title: 'u' });
});
it('deleteNote는 /notes/:id로 DELETE한다', async () => {
  await deleteNote(9);
  expect(mocked.delete).toHaveBeenCalledWith('/notes/9');
});
it('noteKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(noteKeys.list({ todoId: 3 })).toEqual(['note', 'list', { todoId: 3 }]);
  expect(noteKeys.detail(9)).toEqual(['note', 'detail', 9]);
});
