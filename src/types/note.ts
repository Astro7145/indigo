import type { CursorParams } from '@/src/types/common'

export interface NoteTodoRef {
  id: number
  title: string
  done: boolean
  createdAt?: string
  goal?: { id: number; title: string } | null
  tags?: { id: number; name: string }[]
}

export interface Note {
  id: number
  teamId: string
  userId: number
  todoId: number
  title: string
  content?: unknown | null
  linkUrl: string | null
  createdAt: string
  updatedAt: string
  todo: NoteTodoRef
}

export interface NoteListParams extends CursorParams {
  todoId?: number
  goalId?: number
  search?: string
  sort?: 'latest' | 'oldest'
}

export interface NoteListResponse {
  notes: Note[]
  nextCursor: number | null
  totalCount: number
}

export interface CreateNoteBody {
  todoId: number
  title: string
  content?: unknown
  linkUrl?: string
}

export interface UpdateNoteBody {
  title?: string
  content?: unknown
  linkUrl?: string | null
}
