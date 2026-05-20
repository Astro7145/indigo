import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  noteKeys,
  getNotes,
  getNote,
  createNote,
  patchNote,
  deleteNote,
} from '@/src/api/note'
import type {
  Note,
  NoteListParams,
  NoteListResponse,
  CreateNoteBody,
  UpdateNoteBody,
} from '@/src/types/note'
import type { ApiError } from '@/src/types/common'

export function useNoteList(params: NoteListParams = {}) {
  return useQuery<NoteListResponse, ApiError>({
    queryKey: noteKeys.list(params),
    queryFn: () => getNotes(params),
  })
}

export function useInfiniteNoteList(params: Omit<NoteListParams, 'cursor'> = {}) {
  return useInfiniteQuery<NoteListResponse, ApiError>({
    queryKey: [...noteKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) =>
      getNotes({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function useNote(id: number | undefined) {
  return useQuery<Note, ApiError>({
    queryKey: noteKeys.detail(id ?? -1),
    queryFn: () => getNote(id as number),
    enabled: id != null,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation<Note, ApiError, CreateNoteBody>({
    mutationFn: (body) => createNote(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.lists() })
    },
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation<Note, ApiError, { noteId: number; body: UpdateNoteBody }>({
    mutationFn: ({ noteId, body }) => patchNote(noteId, body),
    onSuccess: (_, { noteId }) => {
      qc.invalidateQueries({ queryKey: noteKeys.lists() })
      qc.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
    },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteNote(id),
    onSuccess: (_, noteId) => {
      qc.invalidateQueries({ queryKey: noteKeys.lists() })
      qc.removeQueries({ queryKey: noteKeys.detail(noteId) })
    },
  })
}
