import instance from '@/src/api/axiosInstance'
import type {
  Note,
  NoteListParams,
  NoteListResponse,
  CreateNoteBody,
  UpdateNoteBody,
} from '@/src/types/note'

export const noteKeys = {
  all: ['note'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: NoteListParams = {}) => [...noteKeys.lists(), filters] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: number) => [...noteKeys.details(), id] as const,
}

export async function getNotes(params: NoteListParams = {}): Promise<NoteListResponse> {
  const { data } = await instance.get<NoteListResponse>('/notes', { params })
  return data
}

export async function getNote(noteId: number): Promise<Note> {
  const { data } = await instance.get<Note>(`/notes/${noteId}`)
  return data
}

export async function createNote(body: CreateNoteBody): Promise<Note> {
  const { data } = await instance.post<Note>('/notes', body)
  return data
}

export async function patchNote(noteId: number, body: UpdateNoteBody): Promise<Note> {
  const { data } = await instance.patch<Note>(`/notes/${noteId}`, body)
  return data
}

export async function deleteNote(noteId: number): Promise<void> {
  await instance.delete(`/notes/${noteId}`)
}
