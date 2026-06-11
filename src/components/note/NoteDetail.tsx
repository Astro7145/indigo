'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import Chip from '@/src/components/common/chips/Chip';
import { IcCalendarOutline } from '@/src/components/common/icons/IcCalendarOutline';
import { IcCheckbox } from '@/src/components/common/icons/IcCheckbox';
import { IcFlagOutline } from '@/src/components/common/icons/IcFlagOutline';
import { IcHash } from '@/src/components/common/icons/IcHash';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import { useNote } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';
import { formatDate } from '@/src/utils/date';

import NoteLinkEmbed from './NoteLinkEmbed';

export interface NoteDetailProps {
  noteId: number;
  className?: string;
}

/** 노트 상세 본문 — 드로어/standalone 페이지가 공유한다. 닫기 버튼은 감싸는 셸이 담당. */
export default function NoteDetail({ noteId, className }: NoteDetailProps) {
  const t = useTranslations('goals');
  const tc = useTranslations('common');
  const { data: note, isLoading, isError } = useNote(noteId);
  const [embedOpen, setEmbedOpen] = useState(false);

  if (isLoading) return <p className={cn('p-6 text-sm text-slate-400', className)}>{tc('state.loading')}</p>;
  if (isError || !note) return <p className={cn('p-6 text-sm text-slate-400', className)}>{t('note.loadError')}</p>;

  const tags = note.todo.tags ?? [];
  const hasLink = !!note.linkUrl;

  const viewer = (
    <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
      <div className="flex flex-col gap-7.5">
        <div className="flex items-center gap-3">
          <IcSpringNote aria-hidden className="size-10 shrink-0" />
          <h2 className="min-w-0 text-2xl font-semibold text-slate-800">{note.title}</h2>
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <dt className="flex w-16 shrink-0 items-center gap-1 font-medium text-slate-400">
              <IcFlagOutline aria-hidden className="size-4" size="small" />
              {t('note.goalLabel')}
            </dt>
            <dd className="min-w-0 flex-1 truncate text-slate-700">{note.todo.goal?.title ?? '-'}</dd>
          </div>
          <div className="flex items-center gap-2">
            {/* 값=updatedAt(기획 "마지막 저장일"). 라벨은 Figma 시안의 "작성일" 표기를 따른다. */}
            <dt className="flex w-16 shrink-0 items-center gap-1 font-medium text-slate-400">
              <IcCalendarOutline aria-hidden className="size-4" />
              {t('note.dateLabel')}
            </dt>
            <dd className="text-slate-700">{formatDate(note.updatedAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="flex w-16 shrink-0 items-center gap-1 font-medium text-slate-400">
              <IcCheckbox aria-hidden className="size-4" />
              {t('note.todoLabel')}
            </dt>
            <dd className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 truncate text-slate-700">{note.todo.title}</span>
              <Chip type={note.todo.done ? 'done' : 'todo'} />
            </dd>
          </div>

          <div className="flex items-center gap-2">
            <dt className="flex w-16 shrink-0 items-center gap-1 font-medium text-slate-400">
              <IcHash aria-hidden className="size-4" />
              {t('note.tagLabel')}
            </dt>
            {tags.length > 0 && (
              <dd className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-indigo-300 bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </dd>
            )}
          </div>
        </dl>
      </div>

      {hasLink && (
        <>
          <div className="h-px w-full bg-slate-200" />
          <button
            type="button"
            onClick={() => setEmbedOpen((v) => !v)}
            aria-pressed={embedOpen}
            className="flex w-full items-center gap-1.5 rounded-[14px] bg-slate-50 px-4 py-3.5 text-left transition-colors hover:bg-slate-100"
          >
            <IcLink aria-hidden className="size-5 shrink-0 text-slate-400" />
            <span className="min-w-0 truncate text-sm font-medium text-slate-700">{note.linkUrl}</span>
          </button>
        </>
      )}
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
