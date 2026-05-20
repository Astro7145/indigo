jest.mock('@/src/api/note', () => ({
  ...jest.requireActual('@/src/api/note'),
  getNotes: jest.fn(),
  getNote: jest.fn(),
  createNote: jest.fn(),
  patchNote: jest.fn(),
  deleteNote: jest.fn(),
}))
import * as noteApi from '@/src/api/note'
import { waitFor } from '@testing-library/react'
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils'
import {
  useNoteList,
  useInfiniteNoteList,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@/src/hooks/note'

const mocked = noteApi as jest.Mocked<typeof noteApi>

beforeEach(() => {
  jest.resetAllMocks()
})

it('useNoteList calls getNotes with params', async () => {
  mocked.getNotes.mockResolvedValue({ notes: [], nextCursor: null, totalCount: 0 } as never)
  const { result } = renderHookWithClient(() => useNoteList({ todoId: 3 }))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getNotes).toHaveBeenCalledWith({ todoId: 3 })
})

it('useNote is disabled when id is undefined', () => {
  renderHookWithClient(() => useNote(undefined))
  expect(mocked.getNote).not.toHaveBeenCalled()
})

it('useNote calls getNote when id is provided', async () => {
  mocked.getNote.mockResolvedValue({ id: 5, title: 't' } as never)
  const { result } = renderHookWithClient(() => useNote(5))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getNote).toHaveBeenCalledWith(5)
})

it('useInfiniteNoteList passes cursor on first page', async () => {
  mocked.getNotes
    .mockResolvedValueOnce({ notes: [], nextCursor: 4, totalCount: 0 } as never)
  const { result } = renderHookWithClient(() => useInfiniteNoteList({ todoId: 3 }))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getNotes).toHaveBeenLastCalledWith({ todoId: 3, cursor: undefined })
  expect(result.current.hasNextPage).toBe(true)
})

it('useCreateNote invalidates lists on success', async () => {
  mocked.createNote.mockResolvedValue({ id: 1 } as never)
  const { result, client } = renderHookWithClient(() => useCreateNote())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({ todoId: 3, title: 'x' })
  expect(mocked.createNote).toHaveBeenCalledWith({ todoId: 3, title: 'x' })
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.lists() })
})

it('useUpdateNote invalidates lists and detail on success', async () => {
  mocked.patchNote.mockResolvedValue({ id: 5 } as never)
  const { result, client } = renderHookWithClient(() => useUpdateNote())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({ noteId: 5, body: { title: 'x' } })
  expect(mocked.patchNote).toHaveBeenCalledWith(5, { title: 'x' })
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.lists() })
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.detail(5) })
})

it('useDeleteNote invalidates lists and removes detail on success', async () => {
  mocked.deleteNote.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() => useDeleteNote())
  const inv = jest.spyOn(client, 'invalidateQueries')
  const rm = jest.spyOn(client, 'removeQueries')
  await result.current.mutateAsync(5)
  expect(mocked.deleteNote).toHaveBeenCalledWith(5)
  expect(inv).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.lists() })
  expect(rm).toHaveBeenCalledWith({ queryKey: noteApi.noteKeys.detail(5) })
})
