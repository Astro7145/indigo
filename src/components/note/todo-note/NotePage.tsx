'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import NoteWorkspace from '@/src/components/note/todo-note/NoteWorkspace';
import { useNoteList } from '@/src/hooks/note';
import { useTodo } from '@/src/hooks/todo';

export interface NotePageProps {
  todoId: number;
}

const STATUS_BOX =
  'mx-auto flex min-h-full w-full max-w-[343px] items-center justify-center sm:max-w-[636px] xl:max-w-[768px]';

// 데이터 유무로 작성/상세를 분기하고, editing state로 상세↔수정을 토글한다.
// 항상 같은 NoteWorkspace를 렌더하고 note·editing만 넘기므로, 에디터 인스턴스가 유지돼 전환 시 깜빡임·점프가 없다.
export default function NotePage({ todoId }: NotePageProps) {
  const router = useRouter();
  // note는 todo와 1:1이라 todoId로 첫 노트를 잡는다
  const { data, isLoading, isError } = useNoteList({ todoId });
  // 메타(목표·할일·태그)용 full todo는 여기서 조회해 NoteWorkspace에 내려준다.
  const { data: todo } = useTodo(todoId);
  const [editing, setEditing] = useState(false);

  const note = data?.notes[0];

  if (isLoading) {
    return (
      <div className={STATUS_BOX}>
        <p className="text-sm text-slate-400">불러오는 중…</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={STATUS_BOX}>
        <p className="text-sm text-slate-400">노트를 불러오지 못했어요</p>
      </div>
    );
  }

  if (!note) {
    // 노트 없음 → 작성. 완료 시 useCreateNote가 리스트를 invalidate → 리페치로 note가 채워져 자동으로 상세로 전환된다.
    return (
      <NoteWorkspace
        todoId={todoId}
        todo={todo}
        mode="create"
        onEdit={() => setEditing(true)}
        onComplete={() => {
          /* 생성 성공 시 리스트 invalidate → 리페치로 note가 채워져 자동으로 상세로 전환된다 */
        }}
        onCancel={() => router.back()}
      />
    );
  }

  // note 있음 → editing 토글로 상세↔수정 전환 (같은 컴포넌트 인스턴스 유지)
  return (
    <NoteWorkspace
      todoId={todoId}
      note={note}
      todo={todo}
      mode={editing ? 'edit' : 'read'}
      onEdit={() => setEditing(true)}
      onComplete={() => setEditing(false)}
      onCancel={() => setEditing(false)}
    />
  );
}
