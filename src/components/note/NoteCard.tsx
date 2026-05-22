'use client';

import Card from '@/src/components/common/cards/Card';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import Chip from '@/src/components/common/chips/Chip';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { useNote } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';

export type NoteCardSize = 'large' | 'small';

export interface NoteCardProps {
  noteId: number;
  size?: NoteCardSize;
  onClick?: () => void;
  /** 더보기(케밥) 메뉴 핸들러 — 제공 시 케밥이 IconButton이 됨 */
  onMore?: () => void;
  className?: string;
}

/**
 * Figma 21209:64271 (state=TODO size=large 644×136) / 21209:64288 (state=TODO size=small 343×96).
 * - Large padding: px-[38px] pt-[28px] pb-[32px] (figma 정확, Card 기본 p-8 override).
 * - Small padding: p-4 (Card 기본 small과 동일).
 */
const sizeClasses: Record<NoteCardSize, string> = {
  large: 'w-[644px] gap-4 px-[38px] pt-[28px] pb-[32px]',
  small: 'w-[343px] gap-3',
};

const styleBySize: Record<
  NoteCardSize,
  {
    iconBox: string;
    title: string;
    headerGap: string;
    kebab: string;
    todoText: string;
  }
> = {
  large: {
    iconBox: 'size-10 rounded',
    title: 'text-xl font-semibold leading-[30px]',
    headerGap: 'gap-4',
    kebab: 'size-6',
    todoText: 'text-sm leading-5',
  },
  small: {
    iconBox: 'size-8 rounded-lg',
    title: 'text-sm font-semibold leading-5',
    headerGap: 'gap-2',
    kebab: 'size-4',
    todoText: 'text-xs leading-4',
  },
};

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
 */
export default function NoteCard({ noteId, size = 'large', onClick, onMore, className }: NoteCardProps) {
  const { data: note, isLoading, isError } = useNote(noteId);
  const s = styleBySize[size];

  if (isLoading || !note) {
    return (
      <Card size={size} className={cn('flex flex-col', sizeClasses[size], className)}>
        <p className="text-sm text-slate-400">{isError ? '불러오지 못했어요' : '불러오는 중…'}</p>
      </Card>
    );
  }

  return (
    <Card size={size} className={cn('flex flex-col', sizeClasses[size], className)} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center', s.headerGap)}>
          <IcSpringNote aria-hidden className={cn('shrink-0', s.iconBox)} />
          <h3 className={cn('text-slate-800', s.title)}>{note.title}</h3>
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
              <IcKebab className={s.kebab} />
            </IconButton>
          ) : (
            // 핸들러 없으면 장식용 — 스크린리더에 인터랙티브로 오인되지 않게 aria-hidden
            <IcKebab aria-hidden className={s.kebab} />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip type={note.todo.done ? 'done' : 'todo'} />
          <span className={cn('text-slate-700', s.todoText, note.todo.done && 'text-slate-400 line-through')}>
            {note.todo.title}
          </span>
        </div>
        <span className="text-xs leading-4 text-slate-400">{formatDate(note.createdAt)}</span>
      </div>
    </Card>
  );
}
