'use client';

import type { ReactNode } from 'react';

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
export default function NoteCard({ noteId, note, onClick, onMore, menu, className }: NoteCardProps) {
  const query = useNote(note ? undefined : noteId);
  const resolved = note ?? query.data;
  const isLoading = !note && query.isLoading;
  const isError = !note && query.isError;

  if (isLoading || !resolved) {
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
          <h3 className={cn('text-slate-800', titleClass)}>{resolved.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {resolved.linkUrl && <IcLink aria-label="첨부 링크" />}
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
          <Chip type={resolved.todo.done ? 'done' : 'todo'} />
          <span className={cn('text-slate-700', todoTextClass)}>{resolved.todo.title}</span>
        </div>
        <span className="text-xs leading-4 text-slate-400">{formatDate(resolved.createdAt)}</span>
      </div>
    </Card>
  );
}
