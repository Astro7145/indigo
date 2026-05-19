jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { getNotes, getNote, createNote, patchNote, deleteNote, noteKeys } from '@/src/api/note'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.get.mockResolvedValue({ data: { notes: [], nextCursor: null, totalCount: 0 } } as never)
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.delete.mockResolvedValue({ data: undefined } as never)
})

it('getNotes GET /notes with params', async () => {
  const r = await getNotes({ todoId: 3, search: 'x' })
  expect(mocked.get).toHaveBeenCalledWith('/notes', { params: { todoId: 3, search: 'x' } })
  expect(r).toEqual({ notes: [], nextCursor: null, totalCount: 0 })
})
it('getNote GET /notes/:id', async () => {
  await getNote(9)
  expect(mocked.get).toHaveBeenCalledWith('/notes/9')
})
it('createNote POST /notes', async () => {
  await createNote({ todoId: 3, title: 't' })
  expect(mocked.post).toHaveBeenCalledWith('/notes', { todoId: 3, title: 't' })
})
it('patchNote PATCH /notes/:id', async () => {
  await patchNote(9, { title: 'u' })
  expect(mocked.patch).toHaveBeenCalledWith('/notes/9', { title: 'u' })
})
it('deleteNote DELETE /notes/:id', async () => {
  await deleteNote(9)
  expect(mocked.delete).toHaveBeenCalledWith('/notes/9')
})
it('noteKeys factory produces stable keys', () => {
  expect(noteKeys.list({ todoId: 3 })).toEqual(['note', 'list', { todoId: 3 }])
  expect(noteKeys.detail(9)).toEqual(['note', 'detail', 9])
})
