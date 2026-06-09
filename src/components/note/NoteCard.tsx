'use client';

import type { ReactNode } from 'react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Card from '@/src/components/common/cards/Card';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import Chip from '@/src/components/common/chips/Chip';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { IcLink } from '@/src/components/common/icons/IcLink';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { useNote } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';
import type { Note } from '@/src/types/note';
import { formatDate } from '@/src/utils/date';

export interface NoteCardProps {
  noteId: number;
  /** 이미 조회한 노트를 넘기면 재조회 없이 그대로 렌더한다(리스트의 N+1 방지). */
  note?: Note;
  onClick?: () => void;
  /** 더보기(케밥) 메뉴 핸들러 — 제공 시 케밥이 IconButton이 됨 */
  onMore?: () => void;
  /** 제공 시 케밥이 Dropdown 트리거가 되고 이 노드(<Dropdown.Menu>)를 메뉴로 렌더한다. */
  menu?: ReactNode;
  className?: string;
}

/**
 * 반응형 클래스 — 그리드 열이 폭을 제어하므로 카드는 w-full로 채움.
 * 모바일=small 디자인, sm(≥640px)부터 large 디자인으로 전환.
 */
const rootClass = 'flex w-full flex-col gap-3 sm:gap-4 sm:px-[38px] sm:pt-[28px] sm:pb-[32px] cursor-pointer';
const iconBoxClass = 'shrink-0 size-8 rounded-lg sm:size-10 sm:rounded';
const titleClass = 'text-sm leading-5 font-semibold sm:text-xl sm:leading-[30px]';
const headerGapClass = 'gap-2 sm:gap-4';
const kebabClass = 'size-4 sm:size-6';
const todoTextClass = 'text-xs leading-4 sm:text-sm sm:leading-5';

/**
 * 노트 카드 — `Note` 도메인 객체를 받아 공통 Card 표면 위에 합성.
 * `note` prop이 있으면(리스트가 이미 조회) 그대로 렌더하고, 없으면 `noteId`로 조회한다.
 * 조회 경로는 Suspense 경계(AsyncBoundary)가 로딩/에러를 처리한다.
 */
export default function NoteCard({ noteId, note, onClick, onMore, menu, className }: NoteCardProps) {
  if (note) {
    return <NoteCardView note={note} onClick={onClick} onMore={onMore} menu={menu} className={className} />;
  }
  return (
    <AsyncBoundary
      fallback={
        <Card className={cn(rootClass, className)}>
          <p className="text-sm text-slate-400">불러오는 중…</p>
        </Card>
      }
      errorFallback={
        <Card className={cn(rootClass, className)}>
          <p className="text-sm text-slate-400">불러오지 못했어요</p>
        </Card>
      }
    >
      <NoteCardFetcher noteId={noteId} onClick={onClick} onMore={onMore} menu={menu} className={className} />
    </AsyncBoundary>
  );
}

function NoteCardFetcher({ noteId, ...rest }: Omit<NoteCardProps, 'note'>) {
  const { data } = useNote(noteId);
  return <NoteCardView note={data} {...rest} />;
}

/**
 * 표시 전용 — 상단: 노트 아이콘 + 제목 (+ linkUrl 있을 때 link icon)
 * 하단: TODO 칩 + 연결된 todo title + 작성일. 사이즈는 뷰포트 반응형(md)으로 자동 결정.
 */
function NoteCardView({
  note,
  onClick,
  onMore,
  menu,
  className,
}: { note: Note } & Pick<NoteCardProps, 'onClick' | 'onMore' | 'menu' | 'className'>) {
  return (
    <Card className={cn(rootClass, className)} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center', headerGapClass)}>
          <IcSpringNote aria-hidden className={iconBoxClass} />
          <h3 className={cn('text-slate-800', titleClass)}>{note.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {note.linkUrl && <IcLink aria-label="첨부 링크" />}
          {menu ? (
            <Dropdown>
              <Dropdown.Trigger asChild>
                <IconButton aria-label="더보기 메뉴" className="rounded-full" onClick={(e) => e.stopPropagation()}>
                  <IcKebab className={kebabClass} />
                </IconButton>
              </Dropdown.Trigger>
              {menu}
            </Dropdown>
          ) : onMore ? (
            <IconButton
              aria-label="더보기 메뉴"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onMore();
              }}
            >
              <IcKebab className={kebabClass} />
            </IconButton>
          ) : (
            // 핸들러 없으면 장식용 — 스크린리더에 인터랙티브로 오인되지 않게 aria-hidden
            <IcKebab aria-hidden className={kebabClass} />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip type={note.todo.done ? 'done' : 'todo'} />
          <span className={cn('text-slate-700', todoTextClass)}>{note.todo.title}</span>
        </div>
        <span className="text-xs leading-4 text-slate-400">{formatDate(note.createdAt)}</span>
      </div>
    </Card>
  );
}
