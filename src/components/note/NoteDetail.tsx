'use client';

import { useState } from 'react';

import Chip from '@/src/components/common/chips/Chip';
import { IcCalendarOutline } from '@/src/components/common/icons/IcCalendarOutline';
import { IcFlagOutline } from '@/src/components/common/icons/IcFlagOutline';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import { IcTask } from '@/src/components/common/icons/IcTask';
import { useNote } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';

import NoteContent from './NoteContent';
import NoteLinkEmbed from './NoteLinkEmbed';

// Asia/Seoul 고정 포맷터 — SSR/CSR 타임존 차이로 인한 하이드레이션 미스매치 방지(NoteCard와 동일 패턴)
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return dateFormatter.format(d).replace(/-/g, '. ');
}

export interface NoteDetailProps {
  noteId: number;
  className?: string;
}

/** 노트 상세 본문 — 드로어/standalone 페이지가 공유한다. 닫기 버튼은 감싸는 셸이 담당. */
export default function NoteDetail({ noteId, className }: NoteDetailProps) {
  const { data: note, isLoading, isError } = useNote(noteId);
  const [embedOpen, setEmbedOpen] = useState(false);

  if (isLoading) return <p className={cn('p-6 text-sm text-slate-400', className)}>불러오는 중…</p>;
  if (isError || !note) return <p className={cn('p-6 text-sm text-slate-400', className)}>노트를 불러오지 못했어요</p>;

  const content = typeof note.content === 'string' ? note.content : '';
  const tags = note.todo.tags ?? [];
  const hasLink = !!note.linkUrl;

  const viewer = (
    <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
      <div className="flex items-center gap-2">
        <IcSpringNote aria-hidden className="size-8 shrink-0" />
        <h2 className="min-w-0 text-xl font-semibold text-slate-800">{note.title}</h2>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <dt className="flex shrink-0 items-center gap-1 text-slate-400">
            <IcFlagOutline aria-hidden className="size-4" size="small" />
            목표
          </dt>
          <dd className="min-w-0 truncate text-slate-700">{note.todo.goal?.title ?? '-'}</dd>
        </div>
        <div className="flex items-center gap-2">
          {/* 값=updatedAt(기획 "마지막 저장일"). 라벨은 Figma 시안의 "작성일" 표기를 따른다. */}
          <dt className="flex shrink-0 items-center gap-1 text-slate-400">
            <IcCalendarOutline aria-hidden className="size-4" />
            작성일
          </dt>
          <dd className="text-slate-700">{formatDate(note.updatedAt)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="flex shrink-0 items-center gap-1 text-slate-400">
            <IcTask aria-hidden className="size-4" />할 일
          </dt>
          <dd className="flex min-w-0 items-center gap-2">
            <Chip type={note.todo.done ? 'done' : 'todo'} />
            <span className="min-w-0 truncate text-slate-700">{note.todo.title}</span>
          </dd>
        </div>
        {tags.length > 0 && (
          <div className="flex items-center gap-2">
            <dt className="shrink-0 text-slate-400"># 태그</dt>
            <dd className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span key={t.id} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                  {t.name}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {hasLink && (
        <button
          type="button"
          onClick={() => setEmbedOpen((v) => !v)}
          aria-pressed={embedOpen}
          className="flex w-full items-center gap-2 rounded border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100"
        >
          <IcLink aria-hidden className="size-4 shrink-0 text-slate-400" />
          <span className="min-w-0 truncate text-sm text-slate-600">{note.linkUrl}</span>
        </button>
      )}

      <NoteContent html={content} />
    </div>
  );

  if (hasLink && embedOpen) {
    return (
      <div className={cn('flex h-full min-h-0 flex-col xl:flex-row', className)}>
        {viewer}
        <div className="min-h-0 flex-1 border-t border-slate-200 xl:border-t-0 xl:border-l">
          <NoteLinkEmbed url={note.linkUrl!} />
        </div>
      </div>
    );
  }

  return <div className={cn('flex h-full min-h-0', className)}>{viewer}</div>;
}
