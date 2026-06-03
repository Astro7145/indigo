'use client';

import Image from 'next/image';

import Badge, { type BadgeColor } from '@/src/components/common/badges/Badge';
import IconButton from '@/src/components/common/buttons/IconButton';
import Chip from '@/src/components/common/chips/Chip';
import { IcCalendarOutline, IcDelete, IcFlagOutline, IcLink, IcSpringNote } from '@/src/components/common/icons';
import type { Todo } from '@/src/types/todo';
import { formatDotDate } from '@/src/utils/date';

export interface TodoNoteRef {
  id: number;
  title: string;
}

export interface TodoDetailContentProps {
  todo: Todo;
  notes: TodoNoteRef[];
  onClose: () => void;
  onNoteClick: (noteId: number) => void;
}

// 태그 색상 팔레트 — 생성 폼(TagInput)과 동일 순서. 저장된 태그엔 색상이 없어 인덱스로 순환 매핑한다.
const TAG_BADGE_COLORS: BadgeColor[] = ['green', 'yellow', 'red', 'purple', 'gray'];

/** 메타 행 라벨(아이콘 + 텍스트)의 공통 회색 텍스트 스타일 */
const metaLabelClass = 'text-sm font-medium whitespace-nowrap text-slate-400';
/** 메타 행 값 텍스트 스타일 */
const metaValueClass = 'min-w-0 flex-1 text-sm text-slate-700';
/** 섹션 제목 스타일 (모바일 sm → 데스크탑 base) */
const sectionTitleClass = 'text-sm font-semibold text-slate-700 sm:text-base';

export default function TodoDetailContent({ todo, notes, onClose, onNoteClick }: TodoDetailContentProps) {
  const dueDate = formatDotDate(todo.dueDate);
  const hasAttachment = Boolean(todo.linkUrl || todo.fileUrl);

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더: 제목 + 상태 칩 + 닫기 */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="text-base font-semibold tracking-[-0.48px] text-slate-800 sm:text-xl sm:leading-[30px] sm:tracking-[-0.6px]">
            {todo.title}
          </h2>
          <Chip type={todo.done ? 'done' : 'todo'} className="shrink-0" />
        </div>
        <IconButton aria-label="닫기" onClick={onClose} className="shrink-0">
          <IcDelete aria-hidden className="size-6 text-slate-400" />
        </IconButton>
      </div>

      {/* 메타: 목표 / 마감기한 / 태그 */}
      <div className="flex flex-col gap-4">
        {todo.goal && (
          <div className="flex w-full items-center gap-2">
            <div className="flex shrink-0 items-center gap-1">
              <IcFlagOutline aria-hidden size="small" className="size-[18px] text-slate-400" />
              <span className={metaLabelClass}>목표</span>
            </div>
            <p className={metaValueClass}>{todo.goal.title}</p>
          </div>
        )}

        {dueDate && (
          <div className="flex w-full items-center gap-2">
            <div className="flex shrink-0 items-center gap-1">
              <IcCalendarOutline aria-hidden className="size-[18px] text-slate-400" />
              <span className={metaLabelClass}>마감기한</span>
            </div>
            <p className={metaValueClass}>{dueDate}</p>
          </div>
        )}

        {todo.tags.length > 0 && (
          <div className="flex w-full items-start gap-2">
            <div className="flex shrink-0 items-center gap-1 text-slate-400">
              <span className="w-[17px] text-center text-base font-semibold">#</span>
              <span className="text-sm font-medium whitespace-nowrap">태그</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
              {todo.tags.map((tag, i) => (
                <Badge key={tag.id} color={TAG_BADGE_COLORS[i % TAG_BADGE_COLORS.length]}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 첨부자료 (링크/이미지 둘 다 없으면 섹션 생략) */}
      {hasAttachment && (
        <section className="flex w-full flex-col gap-2">
          <h3 className={sectionTitleClass}>첨부자료</h3>
          <div className="flex flex-col gap-3">
            {todo.linkUrl && (
              <a
                href={todo.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-start gap-1 hover:underline"
              >
                <IcLink aria-hidden className="size-6 shrink-0 text-slate-500" />
                <span className="min-w-0 flex-1 text-base break-all text-slate-700">{todo.linkUrl}</span>
              </a>
            )}
            {todo.fileUrl && (
              <div className="relative aspect-[408/223] w-full overflow-hidden rounded-[4px] border border-slate-200">
                <Image src={todo.fileUrl} alt="첨부 이미지" fill className="object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 작성된 노트 (없으면 섹션 생략) */}
      {notes.length > 0 && (
        <section className="flex w-full flex-col gap-2">
          <h3 className={sectionTitleClass}>작성된 노트</h3>
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => onNoteClick(note.id)}
                  className="flex w-full items-center gap-2 rounded-[4px] border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <IcSpringNote aria-hidden className="size-8 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-base font-medium text-slate-700">{note.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
