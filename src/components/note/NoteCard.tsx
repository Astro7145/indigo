'use client';

import Card from '@/src/components/common/cards/Card';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import Chip from '@/src/components/common/chips/Chip';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { useNote } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';
import { formatDate } from '@/src/utils/date';

export interface NoteCardProps {
  noteId: number;
  onClick?: () => void;
  /** 더보기(케밥) 메뉴 핸들러 — 제공 시 케밥이 IconButton이 됨 */
  onMore?: () => void;
  className?: string;
}

/**
 * 반응형 클래스 — 폭 343(mobile) → 636(sm) → 644(xl).
 * 모바일=small 디자인, 태블릿(sm, ≥640px)부터 large 디자인으로 전환.
 * 태블릿(sm)·데스크탑(xl)은 같은 large 스타일이며 폭만 636→644로 미세 조정(8px) — 그 외 패딩·아이콘·텍스트는 `sm:`에서 한 번만 분기.
 */
const rootClass =
  'flex flex-col w-[343px] gap-3 sm:w-[636px] sm:gap-4 sm:px-[38px] sm:pt-[28px] sm:pb-[32px] xl:w-[644px]';
const iconBoxClass = 'shrink-0 size-8 rounded-lg sm:size-10 sm:rounded';
const titleClass = 'text-sm leading-5 font-semibold sm:text-xl sm:leading-[30px]';
const headerGapClass = 'gap-2 sm:gap-4';
const kebabClass = 'size-4 sm:size-6';
const todoTextClass = 'text-xs leading-4 sm:text-sm sm:leading-5';

/**
 * 노트 카드 — `Note` 도메인 객체를 받아 공통 Card 표면 위에 합성.
 * 상단: 노트 아이콘 + 제목 (+ linkUrl 있을 때 link icon)
 * 하단: TODO 칩 + 연결된 todo title + 작성일
 * 사이즈는 외부 prop이 아니라 뷰포트 반응형(md)으로 자동 결정.
 */
export default function NoteCard({ noteId, onClick, onMore, className }: NoteCardProps) {
  const { data: note, isLoading, isError } = useNote(noteId);

  if (isLoading || !note) {
    return (
      <Card className={cn(rootClass, className)}>
        <p className="text-sm text-slate-400">{isError ? '불러오지 못했어요' : '불러오는 중…'}</p>
      </Card>
    );
  }

  return (
    <Card className={cn(rootClass, className)} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center', headerGapClass)}>
          <IcSpringNote aria-hidden className={iconBoxClass} />
          <h3 className={cn('text-slate-800', titleClass)}>{note.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {note.linkUrl && <IcLink aria-label="첨부 링크" />}
          {onMore ? (
            <IconButton
              aria-label="더보기 메뉴"
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
          <span className={cn('text-slate-700', todoTextClass, note.todo.done && 'text-slate-400 line-through')}>
            {note.todo.title}
          </span>
        </div>
        <span className="text-xs leading-4 text-slate-400">{formatDate(note.createdAt)}</span>
      </div>
    </Card>
  );
}
