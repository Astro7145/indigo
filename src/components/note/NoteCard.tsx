'use client';

import Card from '@/src/components/common/cards/Card';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import Chip from '@/src/components/common/chips/Chip';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { useNote } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';

export interface NoteCardProps {
  noteId: number;
  onClick?: () => void;
  /** 더보기(케밥) 메뉴 핸들러 — 제공 시 케밥이 IconButton이 됨 */
  onMore?: () => void;
  className?: string;
}

/**
 * 반응형 클래스 — 폭 343(mobile) → 636(md) → 644(lg).
 * 모바일=small 디자인, md(≥768px)부터 large 디자인으로 전환.
 * md·lg는 같은 large 스타일이며 폭만 636→644로 미세 조정(8px) — 그 외 패딩·아이콘·텍스트는 `md:`에서 한 번만 분기.
 */
const rootClass =
  'flex flex-col w-[343px] gap-3 md:w-[636px] md:gap-4 md:px-[38px] md:pt-[28px] md:pb-[32px] lg:w-[644px]';
const iconBoxClass = 'shrink-0 size-8 rounded-lg md:size-10 md:rounded';
const titleClass = 'text-sm leading-5 font-semibold md:text-xl md:leading-[30px]';
const headerGapClass = 'gap-2 md:gap-4';
const kebabClass = 'size-4 md:size-6';
const todoTextClass = 'text-xs leading-4 md:text-sm md:leading-5';

// 고정 타임존(Asia/Seoul) 포맷터 — SSR(UTC)/CSR 타임존 차이로 인한
// 하이드레이션 미스매치를 방지하기 위해 new Date()의 로컬 메서드 대신 사용
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY. MM. DD 포맷 (Figma 디자인 정렬, Asia/Seoul 고정) */
function formatDate(iso: string): string {
  const date = new Date(iso);
  // 잘못된 날짜 문자열이면 Intl.format이 RangeError를 던지므로 원문 그대로 반환
  if (isNaN(date.getTime())) return iso;
  // en-CA는 YYYY-MM-DD → "YYYY. MM. DD"로 변환
  return dateFormatter.format(date).replace(/-/g, '. ');
}

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
      <Card size="small" className={cn(rootClass, className)}>
        <p className="text-sm text-slate-400">{isError ? '불러오지 못했어요' : '불러오는 중…'}</p>
      </Card>
    );
  }

  return (
    <Card size="small" className={cn(rootClass, className)} onClick={onClick}>
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
